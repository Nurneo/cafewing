import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Order } from '../../types';
import { OrderTable } from '../orders/OrderTable';
import { NewOrderPage } from '../orders/NewOrderPage';
import { EditOrderModal } from '../orders/EditOrderModal';
import { Button } from '../ui/Button';
import { Plus, Filter, List, PlusCircle, AlertCircle } from 'lucide-react';
import { supabaseService } from '../../services/supabaseService';
import { useAuth } from '../../context/AuthContext';

export const WaiterDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [statusFilters, setStatusFilters] = useState<Record<Order['status'], boolean>>({
    'in-progress': true,
    'completed': true,
    'updated': true
  });
  const [currentView, setCurrentView] = useState<'table-management' | 'new-order'>('table-management');
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
    
    // Subscribe to real-time updates
    const unsubscribe = supabaseService.subscribeToOrders((updatedOrders) => {
      setOrders(updatedOrders);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const filtered = orders.filter(order => statusFilters[order.status]);
    setFilteredOrders(filtered);
  }, [orders, statusFilters]);

  const toggleStatusFilter = (status: Order['status']) => {
    setStatusFilters(prev => ({
      ...prev,
      [status]: !prev[status]
    }));
  };

  const getActiveFiltersCount = () => {
    return Object.values(statusFilters).filter(Boolean).length;
  };

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const ordersData = await supabaseService.getOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading orders:', error);
      setError(t('errors.loadingError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrder = async (orderData: {
    tableNumber: string;
    items: Order['items'];
    status: Order['status'];
    notes?: string;
    basePrice: number;
    serviceFeePrice: number;
  }) => {
    try {
      if (!user?.id) {
        console.error('No user ID available');
        alert('User authentication error. Please try logging in again.');
        return;
      }

      const { error } = await supabaseService.createOrder({
        ...orderData,
        waiterId: user.id
      });
      
      if (error) {
        console.error('Error creating order:', error);
        alert(t('errors.savingError'));
        return;
      }

      setCurrentView('table-management');
      // Orders will be updated via real-time subscription
    } catch (error) {
      console.error('Error creating order:', error);
      alert(t('errors.savingError'));
    }
  };

  const handleEditOrder = (order: Order) => {
    console.log('Opening edit modal for order:', order.id);
    setEditingOrder(order);
    setIsEditModalOpen(true);
  };

  const handleSaveEditedOrder = (updatedOrder: Order) => {
    console.log('Order updated successfully:', updatedOrder.id);
    // Orders will be updated via real-time subscription
    setIsEditModalOpen(false);
    setEditingOrder(null);
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (confirm(t('orders.confirmDelete'))) {
      try {
        const { error } = await supabaseService.deleteOrder(orderId);
        
        if (error) {
          console.error('Error deleting order:', error);
          
          // Check for specific order not found error
          if (error.code === 'ORDER_NOT_FOUND') {
            alert(t('errors.orderNotFound'));
            // Refresh orders to sync with server state
            loadOrders();
          } else {
            alert(t('errors.savingError'));
          }
          return;
        }
        
        // Orders will be updated via real-time subscription
      } catch (error) {
        console.error('Error deleting order:', error);
        alert(t('errors.savingError'));
      }
    }
  };

  const handleStatusChange = async (orderId: string, status: Order['status']) => {
    try {
      console.log('Attempting to change order status:', { orderId, status });
      
      const { error } = await supabaseService.updateOrder(orderId, { status });
      
      if (error) {
        console.error('Error updating order status:', error);
        
        // Check for specific order not found error
        if (error.code === 'ORDER_NOT_FOUND') {
          alert(t('errors.orderNotFound'));
          // Refresh orders to sync with server state
          loadOrders();
          // Throw error to propagate failure to calling function
          throw new Error('Order not found');
        } else {
          alert(t('errors.savingError'));
          // Throw error to propagate failure to calling function
          throw new Error('Failed to update order status');
        }
      }
      
      console.log('Order status updated successfully');
      // Orders will be updated via real-time subscription
    } catch (error) {
      console.error('Error updating order status:', error);
      // Re-throw the error to propagate it to the calling function
      throw error;
    }
  };

  if (currentView === 'new-order') {
    return (
      <div className="page-transition">
        <NewOrderPage
          onBack={() => setCurrentView('table-management')}
          onSubmit={handleCreateOrder}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center fade-in">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <div className="text-red-400 text-lg font-medium mb-4">{error}</div>
          <Button variant="PRIMARY" onClick={loadOrders}>
            {t('common.tryAgain')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black page-transition">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Navigation */}
        <div className="flex space-x-2 mb-8 bg-gray-900 border border-gray-800 rounded-xl p-2 slide-in-left">
          <button
            onClick={() => setCurrentView('table-management')}
            className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 font-semibold gpu-accelerated ${
              currentView === 'table-management'
                ? 'bg-cyan-600 text-black shadow-neon scale-105'
                : 'text-gray-400 hover:text-white hover:bg-gray-800 hover:scale-105'
            }`}
          >
            <List size={18} />
            <span>{t('table.tableManagement')}</span>
          </button>
          <button
            onClick={() => setCurrentView('new-order')}
            className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 font-semibold gpu-accelerated ${
              currentView === 'new-order'
                ? 'bg-cyan-600 text-black shadow-neon scale-105'
                : 'text-gray-400 hover:text-white hover:bg-gray-800 hover:scale-105'
            }`}
          >
            <PlusCircle size={18} />
            <span>{t('table.newOrder')}</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 space-y-6 lg:space-y-0">
          <div className="slide-in-left">
            <h1 className="text-3xl font-bold text-white mb-2 text-heading">
              {t('table.tableManagement')}
            </h1>
            <p className="text-gray-300 text-lg text-subheading">
              {t('dashboard.welcome')}, <span className="accent-cyan font-semibold">{user?.name}</span>! {t('dashboard.manageOrdersEfficiently')}.
            </p>
          </div>
          
          <Button
            variant="PRIMARY"
            onClick={() => setCurrentView('new-order')}
            className="flex items-center space-x-2 slide-in-right"
          >
            <Plus size={18} />
            <span>{t('orders.newOrder')}</span>
          </Button>
        </div>

        <div className="mb-6 slide-up">
          <div className="card-modern p-4">
            <div className="flex items-center space-x-4 mb-4">
              <Filter size={18} className="text-gray-400" />
              <h3 className="text-sm font-semibold text-white text-subheading">{t('orders.filterByStatus')}</h3>
              <span className="text-xs text-gray-400 text-caption">
                ({getActiveFiltersCount()}/3 {t('orders.statusesShown')})
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(Object.keys(statusFilters) as Order['status'][]).map((status) => (
                <button
                  key={status}
                  onClick={() => toggleStatusFilter(status)}
                  className={`
                    flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 gpu-accelerated
                    ${statusFilters[status]
                      ? 'border-cyan-400 bg-cyan-400/10 shadow-neon'
                      : 'border-red-400 bg-red-400/10 shadow-lg'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`
                      w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200
                      ${statusFilters[status]
                        ? 'bg-cyan-400 text-black'
                        : 'bg-red-400 text-white'
                      }
                    `}>
                      {statusFilters[status] ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm font-medium ${
                      statusFilters[status] ? 'text-cyan-400' : 'text-red-400'
                    } text-subheading`}>
                      {t(`orders.${status}`)}
                    </span>
                  </div>
                  
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    statusFilters[status] 
                      ? 'bg-cyan-900/30 text-cyan-300' 
                      : 'bg-red-900/30 text-red-300'
                  } text-caption`}>
                    {orders.filter(order => order.status === status).length}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mb-6 text-center">
          <div className="text-sm text-gray-400 text-caption">
            {t('orders.showingOrders')} <span className="font-semibold text-white mx-1">{filteredOrders.length}</span> {t('orders.ofOrders')} <span className="font-semibold text-white mx-1">{orders.length}</span> {t('orders.ordersText')}
          </div>
        </div>

        <div className="slide-up stagger-1">
          <OrderTable
            orders={filteredOrders}
            onEdit={handleEditOrder}
            onDelete={handleDeleteOrder}
            onStatusChange={handleStatusChange}
            isLoading={isLoading}
          />
        </div>

        {/* Edit Order Modal */}
        <EditOrderModal
          order={editingOrder}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingOrder(null);
          }}
          onSave={handleSaveEditedOrder}
        />
      </div>
    </div>
  );
};
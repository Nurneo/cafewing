import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Order } from '../../types';
import { Button } from '../ui/Button';
import { Edit2, Trash2, CheckCircle, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { OrderDetailsModal } from './OrderDetailsModal';
import { TableSkeleton } from '../ui/LoadingSkeleton';

interface OrderTableProps {
  orders: Order[];
  onEdit: (order: Order) => void;
  onDelete: (orderId: string) => void;
  onStatusChange: (orderId: string, status: Order['status']) => void;
  isLoading?: boolean;
}

export const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  onEdit,
  onDelete,
  onStatusChange,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [processingOrders, setProcessingOrders] = useState<Set<string>>(new Set());
  const [completedOrders, setCompletedOrders] = useState<Set<string>>(new Set());

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'in-progress': return 'status-in-progress';
      case 'completed': return 'status-completed';
      case 'updated': return 'status-updated';
      default: return 'bg-gray-800 text-gray-400 border border-gray-700';
    }
  };

  const formatStatus = (status: Order['status']) => {
    return t(`orders.${status}`);
  };

  const formatItems = (items: Order['items']) => {
    if (!Array.isArray(items)) return t('orders.noOrders');
    return items.map(item => `${item.name} x${item.quantity}`).join(', ');
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleCompleteOrder = async (order: Order, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    // Add visual feedback immediately
    setProcessingOrders(prev => new Set(prev).add(order.id));
    
    try {
      // Call the onStatusChange function to mark order as completed
      await onStatusChange(order.id, 'completed');
      
      // Show success feedback
      setCompletedOrders(prev => new Set(prev).add(order.id));
      
      // Remove from processing after a brief moment
      setTimeout(() => {
        setProcessingOrders(prev => {
          const newSet = new Set(prev);
          newSet.delete(order.id);
          return newSet;
        });
      }, 500);
      
      // Remove success feedback after animation
      setTimeout(() => {
        setCompletedOrders(prev => {
          const newSet = new Set(prev);
          newSet.delete(order.id);
          return newSet;
        });
      }, 2000);
      
    } catch (error) {
      console.error('Failed to complete order:', error);
      // Remove processing state on error
      setProcessingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(order.id);
        return newSet;
      });
      
      // Don't show success feedback if there was an error
      setCompletedOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(order.id);
        return newSet;
      });
    }
  };

  const isOrderProcessing = (orderId: string) => processingOrders.has(orderId);
  const isOrderJustCompleted = (orderId: string) => completedOrders.has(orderId);

  if (isLoading) {
    return <TableSkeleton rows={8} columns={10} />;
  }

  if (orders.length === 0) {
    return (
      <div className="card-modern p-12 text-center fade-in">
        <div className="text-xl font-semibold text-gray-400 mb-3 text-subheading">{t('orders.noOrders')}</div>
        <div className="text-gray-500 text-caption">{t('orders.ordersDescription')}</div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Card Layout - Compact Version */}
      <div className="block lg:hidden space-y-3 fade-in">
        {orders.map((order, index) => (
          <div 
            key={order.id}
            className={`card-modern p-3 cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-cyan-600 fade-in ${
              isOrderJustCompleted(order.id) ? 'ring-2 ring-green-400 bg-green-900/10' : ''
            }`}
            onClick={() => setSelectedOrder(order)}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            {/* Compact Header - Order ID, Table, and Status */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-white bg-gray-800 px-2 py-1 rounded-full">
                  #{order.displayId}
                </span>
                <span className="text-sm font-medium text-gray-300 text-body">
                  {order.tableNumber}
                </span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                {formatStatus(order.status)}
              </span>
            </div>

            {/* Compact Items and Waiter Row */}
            <div className="mb-2">
              <div className="text-xs text-gray-300 mb-1 text-caption">
                {truncateText(formatItems(order.items), 45)}
              </div>
              {/* Show notes on mobile if they exist */}
              {order.notes && (
                <div className="text-xs text-gray-400 mb-1 italic text-caption">
                  {t('orders.notes')}: {truncateText(order.notes, 40)}
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="px-2 py-1 bg-cyan-900/30 border border-cyan-700/50 rounded-full text-xs font-medium accent-cyan whitespace-nowrap">
                  {order.createdBy}
                </span>
                <div className="text-right">
                  <div className="text-xs font-bold accent-cyan">{order.serviceFeePrice}с</div>
                  <div className="text-xs text-gray-400 text-caption">{new Date(order.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>
            </div>

            {/* Compact Actions Row */}
            <div className="flex space-x-1 pt-2 border-t border-gray-700" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="OUTLINE"
                size="sm"
                onClick={() => setSelectedOrder(order)}
                className="flex-1 p-1.5 text-xs min-h-[32px] flex items-center justify-center space-x-1"
                title={t('orders.viewDetails')}
              >
                <Eye size={10} />
                <span>{t('common.view')}</span>
              </Button>
              
              <Button
                variant="SECONDARY"
                size="sm"
                onClick={() => onEdit(order)}
                className="flex-1 p-1.5 text-xs min-h-[32px] flex items-center justify-center space-x-1"
                title={t('orders.editOrder')}
              >
                <Edit2 size={10} />
                <span>{t('common.edit')}</span>
              </Button>
              
              {order.status !== 'completed' && (
                <Button
                  variant={isOrderJustCompleted(order.id) ? "SUCCESS" : "SUCCESS"}
                  size="sm"
                  onClick={(e) => handleCompleteOrder(order, e)}
                  disabled={isOrderProcessing(order.id)}
                  className={`flex-1 p-1.5 text-xs min-h-[32px] flex items-center justify-center space-x-1 transition-all duration-300 ${
                    isOrderProcessing(order.id) ? 'opacity-50 cursor-not-allowed' : ''
                  } ${
                    isOrderJustCompleted(order.id) ? 'animate-pulse bg-green-400 text-black' : ''
                  }`}
                  title={t('orders.markAsCompleted')}
                >
                  {isOrderProcessing(order.id) ? (
                    <>
                      <div className="w-2 h-2 border border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>...</span>
                    </>
                  ) : isOrderJustCompleted(order.id) ? (
                    <>
                      <CheckCircle size={10} />
                      <span>✓</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={10} />
                      <span>{t('orders.done')}</span>
                    </>
                  )}
                </Button>
              )}
              
              {user?.role === 'admin' && (
                <Button
                  variant="DANGER"
                  size="sm"
                  onClick={() => onDelete(order.id)}
                  className="flex-1 p-1.5 text-xs min-h-[32px] flex items-center justify-center space-x-1"
                  title={t('orders.deleteOrder')}
                >
                  <Trash2 size={10} />
                  <span>{t('orders.del')}</span>
                </Button>
              )}
            </div>

            {/* Success Overlay */}
            {isOrderJustCompleted(order.id) && (
              <div className="absolute inset-0 bg-green-400/10 border-2 border-green-400 rounded-lg pointer-events-none animate-pulse"></div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop Table Layout - Enhanced with Notes Column */}
      <div className="hidden lg:block table-modern fade-in">
        <div className="overflow-x-auto scrollbar-modern smooth-scroll">
          <div className="max-h-[70vh] overflow-y-auto scrollbar-modern smooth-scroll">
            <table className="min-w-full">
              <thead className="table-header sticky top-0 z-10 backdrop-blur-sm">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                    {t('orders.orderID')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                    {t('orders.table')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                    {t('orders.items')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                    {t('orders.status')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                    {t('orders.notes')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                    {t('orders.waiter')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                    {t('orders.basePrice')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                    {t('orders.serviceFee')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                    {t('orders.time')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {orders.map((order, index) => (
                  <tr 
                    key={order.id} 
                    className={`table-row cursor-pointer gpu-accelerated fade-in transition-all duration-300 ${
                      isOrderJustCompleted(order.id) ? 'bg-green-900/20 ring-1 ring-green-400' : ''
                    }`}
                    onClick={() => setSelectedOrder(order)}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <td className="px-6 py-4 text-sm font-bold text-white">
                      #{order.displayId}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-300 text-body">
                      {order.tableNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300 max-w-xs text-body">
                      <div className="truncate" title={formatItems(order.items)}>
                        {truncateText(formatItems(order.items), 30)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 hover:scale-105 ${getStatusColor(order.status)}`}>
                        {formatStatus(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300 max-w-xs text-body">
                      <div className="truncate" title={order.notes || ''}>
                        {order.notes ? (
                          <span className="italic text-gray-400">
                            {truncateText(order.notes, 25)}
                          </span>
                        ) : (
                          <span className="text-gray-600">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-3 py-1 bg-cyan-900/30 border border-cyan-700/50 rounded-full text-xs font-bold transition-all duration-200 hover:scale-105 accent-cyan whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] inline-block">
                        {order.createdBy}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-300 text-body">
                      {order.basePrice}с
                    </td>
                    <td className="px-6 py-4 text-sm font-bold accent-cyan">
                      {order.serviceFeePrice}с
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400 text-caption">
                      {new Date(order.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="OUTLINE"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 transition-all duration-200 hover:scale-105 gpu-accelerated"
                          title={t('orders.viewDetails')}
                        >
                          <Eye size={14} />
                        </Button>
                        
                        <Button
                          variant="SECONDARY"
                          size="sm"
                          onClick={() => onEdit(order)}
                          className="p-2 transition-all duration-200 hover:scale-105 gpu-accelerated"
                          title={t('orders.editOrder')}
                        >
                          <Edit2 size={14} />
                        </Button>
                        
                        {order.status !== 'completed' && (
                          <Button
                            variant="SUCCESS"
                            size="sm"
                            onClick={(e) => handleCompleteOrder(order, e)}
                            disabled={isOrderProcessing(order.id)}
                            className={`p-2 transition-all duration-200 hover:scale-105 gpu-accelerated ${
                              isOrderProcessing(order.id) ? 'opacity-50 cursor-not-allowed' : ''
                            } ${
                              isOrderJustCompleted(order.id) ? 'animate-pulse bg-green-400 text-black' : ''
                            }`}
                            title={t('orders.markAsCompleted')}
                          >
                            {isOrderProcessing(order.id) ? (
                              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : isOrderJustCompleted(order.id) ? (
                              <span className="text-lg">✓</span>
                            ) : (
                              <CheckCircle size={14} />
                            )}
                          </Button>
                        )}
                        
                        {user?.role === 'admin' && (
                          <Button
                            variant="DANGER"
                            size="sm"
                            onClick={() => onDelete(order.id)}
                            className="p-2 transition-all duration-200 hover:scale-105 gpu-accelerated"
                            title={t('orders.deleteOrder')}
                          >
                            <Trash2 size={14} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onEdit={onEdit}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
        />
      )}
    </>
  );
};
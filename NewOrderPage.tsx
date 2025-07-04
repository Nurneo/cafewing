import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { OrderItem, OrderStatus, MenuItem, Order } from '../../types';
import { Button } from '../ui/Button';
import { TABLES } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';
import { supabaseService } from '../../services/supabaseService';
import { ArrowLeft, Plus, Minus, ArrowUp, ShoppingCart, AlertCircle, Lock } from 'lucide-react';
import { MenuItemSkeleton } from '../ui/LoadingSkeleton';

interface NewOrderPageProps {
  onBack: () => void;
  onSubmit: (orderData: {
    tableNumber: string;
    items: OrderItem[];
    status: OrderStatus;
    notes?: string;
    basePrice: number;
    serviceFeePrice: number;
  }) => void;
}

export const NewOrderPage: React.FC<NewOrderPageProps> = ({ onBack, onSubmit }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: number }>({});
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<OrderStatus>('in-progress');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [occupiedTables, setOccupiedTables] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
    
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load menu items and occupied tables separately
      const [menuData, occupiedTablesData] = await Promise.all([
        supabaseService.getMenuItems(),
        supabaseService.getOccupiedTables()
      ]);
      
      setMenuItems(menuData);
      setOccupiedTables(occupiedTablesData);

      // Set up real-time subscription for table occupancy
      const unsubscribe = supabaseService.subscribeToTableOccupancy((updatedOccupiedTables) => {
        console.log('Table occupancy updated via subscription:', updatedOccupiedTables);
        setOccupiedTables(updatedOccupiedTables);
      });

      // Store unsubscribe function for cleanup
      return unsubscribe;
    } catch (error) {
      console.error('Error loading data:', error);
      setError(t('errors.loadingError'));
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const updateItemQuantity = (itemId: string, change: number) => {
    setSelectedItems(prev => {
      const currentQuantity = prev[itemId] || 0;
      const newQuantity = Math.max(0, currentQuantity + change);
      
      if (newQuantity === 0) {
        const { [itemId]: removed, ...rest } = prev;
        return rest;
      }
      
      return { ...prev, [itemId]: newQuantity };
    });
  };

  const getItemById = (itemId: string): MenuItem | undefined => {
    return menuItems.find(item => item.id === itemId);
  };

  const calculatePrices = () => {
    const basePrice = Object.entries(selectedItems).reduce((total, [itemId, quantity]) => {
      const item = getItemById(itemId);
      return total + (item ? item.price * quantity : 0);
    }, 0);
    
    const serviceFeePrice = Math.round(basePrice * 1.15);
    
    return { basePrice, serviceFeePrice };
  };

  const isTableOccupied = (table: string): boolean => {
    return occupiedTables.has(table);
  };

  const handleTableSelect = (table: string) => {
    if (!isTableOccupied(table)) {
      setSelectedTable(table);
    }
  };

  const { basePrice, serviceFeePrice } = calculatePrices();

  const handleSubmit = () => {
    if (!selectedTable || Object.keys(selectedItems).length === 0) {
      alert(t('orders.orderMustHaveItems'));
      return;
    }

    if (isTableOccupied(selectedTable)) {
      alert(t('orders.tableOccupiedError'));
      return;
    }

    const orderItems: OrderItem[] = Object.entries(selectedItems).map(([itemId, quantity]) => {
      const item = getItemById(itemId);
      return {
        name: item?.name || 'Unknown Item',
        quantity,
        price: item?.price || 0,
      };
    });

    onSubmit({
      tableNumber: selectedTable,
      items: orderItems,
      status,
      notes: notes || undefined,
      basePrice,
      serviceFeePrice,
    });
  };

  // Group menu items by category
  const groupedMenuItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  const formatItemDisplay = (item: MenuItem) => {
    let display = item.name;
    if (item.grams) {
      display += ` (${item.grams})`;
    }
    return display;
  };

  const renderMenuCategory = (categoryName: string, items: MenuItem[]) => (
    <div key={categoryName} className="card-modern p-6 mb-8 fade-in">
      <h3 className="text-xl font-bold text-white mb-6 border-b border-gray-700 pb-3 text-heading">
        {t(`categories.${categoryName}`) || categoryName}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((item, index) => (
          <div 
            key={item.id} 
            className="card-secondary p-4 transition-all duration-300 hover:border-cyan-600 hover:shadow-lg fade-in"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex flex-col space-y-3">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-white leading-tight text-subheading">
                  {formatItemDisplay(item)}
                </h4>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold accent-cyan text-body">
                  {item.price}с
                </span>
                
                <div className="flex items-center space-x-3">
                  <Button
                    variant="DANGER"
                    size="sm"
                    onClick={() => updateItemQuantity(item.id, -1)}
                    className="p-2 w-10 h-10 rounded-full transition-all duration-300 hover:scale-105 flex items-center justify-center gpu-accelerated"
                    disabled={!selectedItems[item.id]}
                  >
                    <Minus size={14} />
                  </Button>
                  
                  <span className="w-10 text-center text-sm font-bold text-white bg-gray-800 border border-gray-600 rounded-full py-2 px-3 min-w-[40px] transition-all duration-200">
                    {selectedItems[item.id] || 0}
                  </span>
                  
                  <Button
                    variant="SUCCESS"
                    size="sm"
                    onClick={() => updateItemQuantity(item.id, 1)}
                    className="p-2 w-10 h-10 rounded-full transition-all duration-300 hover:scale-105 flex items-center justify-center gpu-accelerated"
                  >
                    <Plus size={14} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center fade-in">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <div className="text-red-400 text-lg font-medium mb-4">{error}</div>
          <div className="space-x-4">
            <Button variant="PRIMARY" onClick={loadData}>
              {t('common.tryAgain')}
            </Button>
            <Button variant="OUTLINE" onClick={onBack}>
              {t('common.back')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center mb-8 sticky top-0 bg-black z-10 py-4 slide-in-left">
          <Button
            variant="OUTLINE"
            onClick={onBack}
            className="mr-4 p-3 transition-all duration-300 hover:scale-105 gpu-accelerated"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-3xl font-bold text-white text-heading">
            {t('orders.newOrder')}
          </h1>
        </div>

        {/* Table Selection - Enhanced with Global Occupation Status */}
        <div className="card-modern p-6 mb-8 fade-in">
          <h2 className="text-xl font-bold text-white mb-6 text-heading">
            {t('orders.selectTable')}
          </h2>
          
          {/* Table Status Legend */}
          <div className="mb-6 flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-gray-300">{t('orders.tableAvailable')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-gray-300">{t('orders.tableOccupied')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-cyan-500 rounded"></div>
              <span className="text-gray-300">{t('orders.tableSelected')}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {TABLES.map((table, index) => {
              const isOccupied = isTableOccupied(table);
              const isSelected = selectedTable === table;
              
              return (
                <div key={table} className="relative group">
                  <Button
                    variant={isSelected ? "PRIMARY" : isOccupied ? "DANGER" : "OUTLINE"}
                    onClick={() => handleTableSelect(table)}
                    disabled={isOccupied}
                    className={`
                      h-14 text-sm font-semibold transition-all duration-300 rounded-xl gpu-accelerated fade-in
                      ${isOccupied 
                        ? 'opacity-60 cursor-not-allowed pointer-events-none bg-red-500/70 text-white border-red-600' 
                        : 'hover:scale-105'
                      }
                      ${isSelected && !isOccupied ? 'scale-105 shadow-neon' : ''}
                    `}
                    style={{ 
                      animationDelay: `${index * 0.05}s`,
                      pointerEvents: isOccupied ? 'none' : 'auto'
                    }}
                  >
                    <div className="flex flex-col items-center">
                      <span>{table}</span>
                      {isOccupied && (
                        <Lock size={12} className="mt-1 opacity-80" />
                      )}
                    </div>
                  </Button>
                  
                  {/* Tooltip for occupied tables */}
                  {isOccupied && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                      <div className="bg-red-900 text-red-200 text-xs rounded-lg px-3 py-2 whitespace-nowrap border border-red-700 shadow-lg">
                        {t('orders.tableOccupiedTooltip')}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-900"></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Global occupied tables summary */}
          {occupiedTables.size > 0 && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
              <div className="flex items-center space-x-2 text-red-300 text-sm">
                <Lock size={16} />
                <span>
                  {t('orders.occupiedTablesCount', { count: occupiedTables.size })} (visible to all users)
                </span>
              </div>
              <div className="text-xs text-red-400 mt-1">
                Occupied tables: {Array.from(occupiedTables).join(', ')}
              </div>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-8 slide-in-left text-heading">
            {t('orders.selectMenuItems')}
          </h2>
          {isLoading ? (
            <MenuItemSkeleton count={6} />
          ) : (
            Object.entries(groupedMenuItems).map(([category, items]) =>
              renderMenuCategory(category, items)
            )
          )}
        </div>

        {/* Selected Items Summary */}
        {Object.keys(selectedItems).length > 0 && (
          <div className="card-modern p-6 mb-8 fade-in">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center text-heading">
              <ShoppingCart className="mr-3" size={24} />
              {t('orders.selectedItems')}
            </h3>
            <div className="space-y-3 mb-6">
              {Object.entries(selectedItems).map(([itemId, quantity], index) => {
                const item = getItemById(itemId);
                return (
                  <div 
                    key={itemId} 
                    className="flex justify-between items-center text-sm p-4 bg-gray-800 border border-gray-700 rounded-lg transition-all duration-200 hover:bg-gray-750 fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <span className="text-white font-semibold text-body">
                      {item ? formatItemDisplay(item) : 'Unknown Item'} x{quantity}
                    </span>
                    <span className="accent-cyan font-bold text-body">
                      {item ? item.price * quantity : 0}с
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-gray-700 pt-6 space-y-4">
              <div className="flex justify-between font-semibold text-lg">
                <span className="text-gray-300 text-subheading">{t('orders.basePrice')}:</span>
                <span className="text-white text-body">{basePrice}с</span>
              </div>
              <div className="flex justify-between font-bold text-xl">
                <span className="text-gray-300 text-subheading">{t('orders.serviceFeePercent')}:</span>
                <span className="accent-cyan text-heading">{serviceFeePrice}с</span>
              </div>
            </div>
          </div>
        )}

        {/* Order Details */}
        <div className="card-modern p-6 mb-8 fade-in">
          <h3 className="text-xl font-bold text-white mb-6 text-heading">
            {t('orders.orderInfo')}
          </h3>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="status" className="block text-sm font-semibold text-gray-300 mb-3 text-subheading">
                {t('orders.status')}
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                className="input-modern"
              >
                <option value="in-progress">{t('orders.inProgress')}</option>
                <option value="completed">{t('orders.completed')}</option>
                <option value="updated">{t('orders.updated')}</option>
              </select>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-semibold text-gray-300 mb-3 text-subheading">
                {t('orders.notes')} ({t('common.cancel')})
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="input-modern"
                placeholder={t('orders.specialInstructions')}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 pb-8 fade-in">
          <Button
            variant="PRIMARY"
            onClick={handleSubmit}
            className="flex-1 py-4 text-lg font-bold transition-all duration-300 hover:scale-105 rounded-xl gpu-accelerated"
            disabled={!selectedTable || Object.keys(selectedItems).length === 0 || isTableOccupied(selectedTable)}
          >
            {t('orders.createOrder')}
          </Button>
          <Button
            variant="OUTLINE"
            onClick={onBack}
            className="flex-1 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105 rounded-xl gpu-accelerated"
          >
            {t('common.cancel')}
          </Button>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-gradient-to-br from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black p-4 rounded-full shadow-neon transition-all duration-300 hover:scale-110 z-50 gpu-accelerated"
          aria-label="Scroll to top"
        >
          <ArrowUp size={24} />
        </button>
      )}
    </div>
  );
};
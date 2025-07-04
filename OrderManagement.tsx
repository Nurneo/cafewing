import React, { useState, useEffect } from 'react';
import { Order, OrderItem, MenuItem } from '../../types';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Edit2, X, Plus, Minus, Save, AlertTriangle } from 'lucide-react';
import { supabaseService } from '../../services/supabaseService';
import { useTranslation } from 'react-i18next';

interface OrderManagementProps {
  orders: Order[];
  onUpdateOrder: (order: Order) => void;
  onCancelOrder: (orderId: string) => void;
}

export const OrderManagement: React.FC<OrderManagementProps> = ({
  orders,
  onUpdateOrder,
  onCancelOrder,
}) => {
  const { t } = useTranslation();
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editedItems, setEditedItems] = useState<OrderItem[]>([]);
  const [editedTableNumber, setEditedTableNumber] = useState<string>('');
  const [editedStatus, setEditedStatus] = useState<Order['status']>('pending');
  const [editedNotes, setEditedNotes] = useState<string>('');
  const [availableMenuItems, setAvailableMenuItems] = useState<MenuItem[]>([]);
  const [selectedMenuItem, setSelectedMenuItem] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAddItems, setShowAddItems] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    try {
      const menuItems = await supabaseService.getMenuItems();
      setAvailableMenuItems(menuItems);
    } catch (error) {
      console.error('Error loading menu items:', error);
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'in-progress': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900';
      case 'completed': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900';
      case 'updated': return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900';
    }
  };

  const formatStatus = (status: Order['status']) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');
  };

  const getOrderSummary = (items: OrderItem[]) => {
    if (!Array.isArray(items) || items.length === 0) return 'No items';
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    return `${totalItems} item${totalItems !== 1 ? 's' : ''}`;
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setEditedItems([...order.items]);
    setEditedTableNumber(order.tableNumber);
    setEditedStatus(order.status);
    setEditedNotes(order.notes || '');
    setIsModalOpen(true);
    setShowAddItems(false);
  };

  const handleCancelOrder = (orderId: string) => {
    if (confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      onCancelOrder(orderId);
    }
  };

  const handleRemoveItem = (index: number) => {
    const newItems = editedItems.filter((_, i) => i !== index);
    setEditedItems(newItems);
  };

  const handleAddItem = () => {
    if (!selectedMenuItem) {
      alert('Please select a menu item');
      return;
    }

    const menuItem = availableMenuItems.find(item => item.id === selectedMenuItem);
    if (!menuItem) {
      alert('Selected menu item not found');
      return;
    }

    const existingItemIndex = editedItems.findIndex(item => item.name === menuItem.name);
    
    if (existingItemIndex >= 0) {
      // Update existing item quantity
      const newItems = [...editedItems];
      newItems[existingItemIndex].quantity += quantity;
      setEditedItems(newItems);
    } else {
      // Add new item
      const newItem: OrderItem = {
        name: menuItem.name,
        quantity,
        price: menuItem.price,
      };
      setEditedItems([...editedItems, newItem]);
    }

    setSelectedMenuItem('');
    setQuantity(1);
    setShowAddItems(false);
  };

  const handleUpdateQuantity = (index: number, change: number) => {
    const newItems = [...editedItems];
    const newQuantity = Math.max(1, newItems[index].quantity + change);
    newItems[index].quantity = newQuantity;
    setEditedItems(newItems);
  };

  const calculatePrices = (items: OrderItem[]) => {
    const basePrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const serviceFeePrice = Math.round(basePrice * 1.15);
    return { basePrice, serviceFeePrice };
  };

  const handleSaveChanges = async () => {
    if (!editingOrder) return;

    if (editedItems.length === 0) {
      alert('Order must have at least one item');
      return;
    }

    if (!editedTableNumber.trim()) {
      alert('Table number is required');
      return;
    }

    setIsSaving(true);

    try {
      console.log('Admin attempting to save order changes:', { orderId: editingOrder.id });
      
      const { basePrice, serviceFeePrice } = calculatePrices(editedItems);

      const updatedOrder: Order = {
        ...editingOrder,
        tableNumber: editedTableNumber,
        items: editedItems,
        status: editedStatus,
        notes: editedNotes || undefined,
        basePrice,
        serviceFeePrice,
      };

      // Update the order in the database
      const { error } = await supabaseService.updateOrder(editingOrder.id, {
        tableNumber: editedTableNumber,
        status: editedStatus,
        notes: editedNotes || undefined,
        basePrice,
        serviceFeePrice,
        items: editedItems,
      });

      if (error) {
        console.error('Error updating order:', error);
        
        // Check for specific order not found error
        if (error.code === 'ORDER_NOT_FOUND') {
          alert(t('errors.orderNotFound'));
          setIsModalOpen(false);
          setEditingOrder(null);
          setEditedItems([]);
        } else {
          alert('Failed to update order. Please try again.');
        }
        return;
      }

      console.log('Order updated successfully by admin');
      onUpdateOrder(updatedOrder);
      setIsModalOpen(false);
      setEditingOrder(null);
      setEditedItems([]);
      alert('Order updated successfully!');
    } catch (error) {
      console.error('Error saving order:', error);
      alert('Failed to save order. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatItemDisplay = (item: MenuItem) => {
    let display = item.name;
    if (item.grams) {
      display += ` (${item.grams})`;
    }
    return display;
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="space-y-6 px-4 sm:px-0">
      {/* Header */}
      <div className="slide-in-left">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Order Management</h2>
        <p className="text-gray-400 text-sm sm:text-base">Edit and manage customer orders</p>
      </div>

      {/* Orders List - Mobile Optimized */}
      <div className="card-modern overflow-hidden slide-up">
        {orders.length === 0 ? (
          <div className="text-center py-8 sm:py-12 text-gray-500 dark:text-gray-400 px-4">
            <div className="text-base sm:text-lg font-medium mb-2">No orders found</div>
            <div className="text-sm">Orders will appear here when created</div>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-modern">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Table
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden sm:table-cell">
                    Waiter
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Summary
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden md:table-cell">
                    Notes
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-900 divide-y divide-gray-800">
                {orders.map((order, index) => (
                  <tr key={order.id} className="hover:bg-gray-800 transition-colors duration-200">
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm font-medium text-white">
                        #{index + 1}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm text-white">
                        {order.tableNumber}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${getStatusColor(order.status)}`}>
                        {formatStatus(order.status)}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                      <div className="text-xs sm:text-sm text-white">
                        {order.createdBy}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm text-white">
                        {getOrderSummary(order.items)}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="text-xs sm:text-sm text-gray-300 max-w-xs">
                        <div className="truncate" title={order.notes || ''}>
                          {truncateText(order.notes || '', 30)}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm">
                        <div className="font-semibold text-blue-400">
                          {order.serviceFeePrice}с
                        </div>
                        <div className="text-gray-400 text-xs">
                          Base: {order.basePrice}с
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                        <Button
                          variant="SECONDARY"
                          size="sm"
                          onClick={() => handleEditOrder(order)}
                          className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center"
                          title="Edit order"
                        >
                          <Edit2 size={12} />
                        </Button>
                        <Button
                          variant="DANGER"
                          size="sm"
                          onClick={() => handleCancelOrder(order.id)}
                          className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center"
                          title="Cancel order"
                        >
                          <X size={12} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Order Modal - Enhanced for Admin */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Edit Order #${editingOrder ? orders.findIndex(o => o.id === editingOrder.id) + 1 : ''}`}
        size="lg"
      >
        {editingOrder && (
          <div className="w-[90vw] max-w-2xl mx-auto max-h-[80vh] overflow-y-auto p-4 shadow-lg space-y-6">
            {/* Order Basic Info */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-medium text-white mb-4">Order Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="tableNumber" className="block text-sm font-semibold text-gray-300 mb-2">
                    Table Number *
                  </label>
                  <input
                    id="tableNumber"
                    type="text"
                    value={editedTableNumber}
                    onChange={(e) => setEditedTableNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white min-h-[44px]"
                    placeholder="e.g., Table 5"
                    disabled={isSaving}
                  />
                </div>
                <div>
                  <label htmlFor="status" className="block text-sm font-semibold text-gray-300 mb-2">
                    Status *
                  </label>
                  <select
                    id="status"
                    value={editedStatus}
                    onChange={(e) => setEditedStatus(e.target.value as Order['status'])}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white min-h-[44px]"
                    disabled={isSaving}
                  >
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="updated">Updated</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-gray-400 text-sm">Original Waiter:</span>
                <span className="ml-2 font-medium text-white">{editingOrder.createdBy}</span>
              </div>
            </div>

            {/* Notes Section */}
            <div className="bg-gray-800 rounded-lg p-4">
              <label htmlFor="notes" className="block text-sm font-semibold text-white mb-3">
                Order Notes
              </label>
              <textarea
                id="notes"
                value={editedNotes}
                onChange={(e) => setEditedNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Special instructions, customer requests, etc..."
                disabled={isSaving}
              />
            </div>

            {/* Current Items */}
            <div>
              <h3 className="font-medium text-white mb-3">Order Items</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-modern">
                {editedItems.map((item, index) => (
                  <div key={index} className="bg-gray-800 rounded-lg p-3">
                    {/* Upper row: Full item name */}
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-white text-sm leading-tight flex-1 pr-2">
                        {item.name}
                      </span>
                      <Button
                        variant="DANGER"
                        size="sm"
                        onClick={() => handleRemoveItem(index)}
                        className="p-1 w-6 h-6 ml-2 flex items-center justify-center"
                        disabled={isSaving}
                      >
                        <X size={10} />
                      </Button>
                    </div>
                    
                    {/* Lower row: Price and quantity controls */}
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-400">{item.price}с each</div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="OUTLINE"
                          size="sm"
                          onClick={() => handleUpdateQuantity(index, -1)}
                          className="p-1 w-9 h-9 rounded-full flex items-center justify-center"
                          disabled={item.quantity <= 1 || isSaving}
                        >
                          <Minus size={10} />
                        </Button>
                        <span className="w-8 text-center font-medium text-white text-sm">
                          {item.quantity}
                        </span>
                        <Button
                          variant="OUTLINE"
                          size="sm"
                          onClick={() => handleUpdateQuantity(index, 1)}
                          className="p-1 w-9 h-9 rounded-full flex items-center justify-center"
                          disabled={isSaving}
                        >
                          <Plus size={10} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Items Button */}
            <div>
              <Button
                variant="SUCCESS"
                onClick={() => setShowAddItems(!showAddItems)}
                className="w-full flex items-center justify-center space-x-2 min-h-[44px]"
                disabled={isSaving}
              >
                <Plus size={16} />
                <span>Add Items</span>
              </Button>
            </div>

            {/* Add Items Dropdown */}
            {showAddItems && (
              <div className="bg-gray-800 rounded-lg p-4 max-h-[50vh] overflow-y-auto scrollbar-modern">
                <h3 className="font-medium text-white mb-3">Add Items</h3>
                <div className="space-y-3">
                  <select
                    value={selectedMenuItem}
                    onChange={(e) => setSelectedMenuItem(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white min-h-[44px]"
                    disabled={isSaving}
                  >
                    <option value="">Select menu item...</option>
                    {availableMenuItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {formatItemDisplay(item)} - {item.price}с
                      </option>
                    ))}
                  </select>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="w-20 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white min-h-[44px]"
                      placeholder="Qty"
                      disabled={isSaving}
                    />
                    <Button
                      variant="PRIMARY"
                      onClick={handleAddItem}
                      className="flex-1 flex items-center justify-center space-x-1 min-h-[44px]"
                      disabled={isSaving}
                    >
                      <Plus size={16} />
                      <span>Add</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Pricing Summary */}
            {editedItems.length > 0 && (
              <div className="bg-blue-900/20 rounded-lg p-4">
                <h3 className="font-medium text-white mb-2">Updated Pricing</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Base Price:</span>
                    <span className="font-medium text-white">
                      {calculatePrices(editedItems).basePrice}с
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Service Fee (15%):</span>
                    <span className="font-medium text-white">
                      {calculatePrices(editedItems).serviceFeePrice - calculatePrices(editedItems).basePrice}с
                    </span>
                  </div>
                  <div className="border-t border-blue-700 pt-1">
                    <div className="flex justify-between">
                      <span className="font-semibold text-white">Total:</span>
                      <span className="font-bold text-blue-400">
                        {calculatePrices(editedItems).serviceFeePrice}с
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col space-y-3 pt-4 border-t border-gray-700">
              <Button
                variant="PRIMARY"
                onClick={handleSaveChanges}
                className="w-full flex items-center justify-center space-x-2 min-h-[44px]"
                disabled={editedItems.length === 0 || !editedTableNumber.trim() || isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Save Changes</span>
                  </>
                )}
              </Button>
              <Button
                variant="OUTLINE"
                onClick={() => setIsModalOpen(false)}
                className="w-full min-h-[44px]"
                disabled={isSaving}
              >
                Cancel
              </Button>
            </div>

            {/* Warning */}
            <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <AlertTriangle size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-200">
                  <strong>Admin Note:</strong> You can modify all aspects of this order including table number, 
                  status, notes, and items. Changes will be saved immediately and reflected across the system.
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
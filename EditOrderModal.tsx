import React, { useState, useEffect } from 'react';
import { Order, OrderItem, MenuItem } from '../../types';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Plus, Minus, X, Save, AlertTriangle } from 'lucide-react';
import { supabaseService } from '../../services/supabaseService';
import { useTranslation } from 'react-i18next';

interface EditOrderModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedOrder: Order) => void;
}

export const EditOrderModal: React.FC<EditOrderModalProps> = ({
  order,
  isOpen,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();
  const [editedItems, setEditedItems] = useState<OrderItem[]>([]);
  const [availableMenuItems, setAvailableMenuItems] = useState<MenuItem[]>([]);
  const [selectedMenuItem, setSelectedMenuItem] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [showAddItems, setShowAddItems] = useState(false);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<Order['status']>('pending');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (order && isOpen) {
      setEditedItems([...order.items]);
      setNotes(order.notes || '');
      setStatus(order.status);
      loadMenuItems();
    }
  }, [order, isOpen]);

  const loadMenuItems = async () => {
    try {
      setIsLoading(true);
      const menuItems = await supabaseService.getMenuItems();
      setAvailableMenuItems(menuItems);
    } catch (error) {
      console.error('Error loading menu items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveItem = (index: number) => {
    const newItems = editedItems.filter((_, i) => i !== index);
    setEditedItems(newItems);
  };

  const handleUpdateQuantity = (index: number, change: number) => {
    const newItems = [...editedItems];
    const newQuantity = Math.max(1, newItems[index].quantity + change);
    newItems[index].quantity = newQuantity;
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

  const calculatePrices = (items: OrderItem[]) => {
    const basePrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const serviceFeePrice = Math.round(basePrice * 1.15);
    return { basePrice, serviceFeePrice };
  };

  const handleSave = async () => {
    if (!order) return;

    if (editedItems.length === 0) {
      alert('Order must have at least one item');
      return;
    }

    setIsSaving(true);

    try {
      console.log('Attempting to save order changes:', { orderId: order.id });
      
      const { basePrice, serviceFeePrice } = calculatePrices(editedItems);

      const updatedOrder: Order = {
        ...order,
        items: editedItems,
        status: 'updated',
        notes: notes || undefined,
        basePrice,
        serviceFeePrice,
      };

      // Update the order in the database
      const { error } = await supabaseService.updateOrder(order.id, {
        status: 'updated',
        notes: notes || undefined,
        basePrice,
        serviceFeePrice,
        items: editedItems,
      });

      if (error) {
        console.error('Error updating order:', error);
        
        // Check for specific order not found error
        if (error.code === 'ORDER_NOT_FOUND') {
          alert(t('errors.orderNotFound'));
          onClose(); // Close modal since order doesn't exist
        } else {
          alert('Failed to update order. Please try again.');
        }
        return;
      }

      console.log('Order updated successfully');
      onSave(updatedOrder);
      onClose();
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

  if (!order) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Order - Table ${order.tableNumber}`}
      size="lg"
    >
      <div className="p-4 sm:p-6 space-y-6">
        {/* Order Info */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="font-medium text-white mb-3">Order Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Table:</span>
              <span className="ml-2 font-medium text-white">{order.tableNumber}</span>
            </div>
            <div>
              <span className="text-gray-400">Original Status:</span>
              <span className="ml-2 font-medium text-white capitalize">{order.status.replace('-', ' ')}</span>
            </div>
          </div>
        </div>

        {/* Current Items */}
        <div>
          <h3 className="font-medium text-white mb-3">Order Items</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-modern">
            {editedItems.map((item, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-3">
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

        {/* Add Items Section */}
        {showAddItems && (
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="font-medium text-white mb-3">Add Items</h3>
            {isLoading ? (
              <div className="text-center py-4">
                <div className="text-gray-400">Loading menu items...</div>
              </div>
            ) : (
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
            )}
          </div>
        )}

        {/* Notes Section */}
        <div>
          <label htmlFor="notes" className="block text-sm font-semibold text-white mb-2">
            Notes
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Special instructions or notes..."
            disabled={isSaving}
          />
        </div>

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

        {/* Warning */}
        <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <AlertTriangle size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-200">
              <strong>Note:</strong> Saving changes will automatically update the order status to "Updated" 
              and recalculate the pricing based on current menu prices.
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col space-y-3 pt-4 border-t border-gray-700">
          <Button
            variant="PRIMARY"
            onClick={handleSave}
            className="w-full flex items-center justify-center space-x-2 min-h-[44px]"
            disabled={editedItems.length === 0 || isSaving}
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
            onClick={onClose}
            className="w-full min-h-[44px]"
            disabled={isSaving}
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};
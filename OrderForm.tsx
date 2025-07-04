import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../../types';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { parseItemsString } from '../../utils/helpers';

interface OrderFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (order: Partial<Order>) => void;
  editOrder?: Order | null;
}

export const OrderForm: React.FC<OrderFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editOrder,
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    tableNumber: '',
    itemsString: '',
    notes: '',
    status: 'in-progress' as OrderStatus,
  });

  useEffect(() => {
    if (editOrder) {
      setFormData({
        tableNumber: editOrder.tableNumber,
        itemsString: editOrder.items.map(item => `${item.name} x${item.quantity}`).join(', '),
        notes: editOrder.notes || '',
        status: editOrder.status,
      });
    } else {
      setFormData({
        tableNumber: '',
        itemsString: '',
        notes: '',
        status: 'pending',
      });
    }
  }, [editOrder, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.tableNumber || !formData.itemsString) {
      return;
    }

    const items = parseItemsString(formData.itemsString);

    const orderData: Partial<Order> = {
      tableNumber: formData.tableNumber,
      items,
      status: formData.status,
      notes: formData.notes || undefined,
      ...(editOrder ? { id: editOrder.id } : {}),
      timestamp: editOrder ? editOrder.timestamp : new Date().toISOString(),
      createdBy: editOrder ? editOrder.createdBy : user?.name || 'Unknown',
      basePrice: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      serviceFeePrice: Math.round(items.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 1.15),
    };

    onSubmit(orderData);
    onClose();
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editOrder ? 'Edit Order' : 'New Order'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="tableNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Table Number *
          </label>
          <input
            id="tableNumber"
            type="text"
            value={formData.tableNumber}
            onChange={(e) => handleChange('tableNumber', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
            placeholder="e.g., Table 5"
            required
          />
        </div>

        <div>
          <label htmlFor="items" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Order Items *
          </label>
          <textarea
            id="items"
            value={formData.itemsString}
            onChange={(e) => handleChange('itemsString', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
            placeholder="e.g., Coffee x2, Croissant x1, Orange Juice x1"
            required
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Format: Item Name x Quantity, separated by commas
          </p>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="updated">Updated</option>
          </select>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
            placeholder="Special instructions or notes..."
          />
        </div>

        <div className="flex space-x-3 pt-4">
          <Button type="submit" variant="PRIMARY" className="flex-1">
            {editOrder ? 'Update Order' : 'Create Order'}
          </Button>
          <Button type="button" variant="OUTLINE" onClick={onClose} className="flex-1">
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};
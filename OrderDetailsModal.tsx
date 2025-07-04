import React from 'react';
import { Order } from '../../types';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Edit2, Trash2, CheckCircle, Clock, User, MapPin, FileText, DollarSign, MessageSquare, Hash } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface OrderDetailsModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (order: Order) => void;
  onStatusChange: (orderId: string, status: Order['status']) => void;
  onDelete: (orderId: string) => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  isOpen,
  onClose,
  onEdit,
  onStatusChange,
  onDelete,
}) => {
  const { user } = useAuth();

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

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
    };
  };

  const handleEditClick = () => {
    console.log('Edit button clicked for order:', order.id);
    onEdit(order);
    onClose();
  };

  const { date, time } = formatDateTime(order.timestamp);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Order Details"
    >
      <div className="space-y-6">
        {/* Header Info with Order ID */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Hash size={16} className="text-gray-500 dark:text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Order ID</p>
              <p className="font-bold text-gray-900 dark:text-gray-100 text-lg">#{order.displayId}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin size={16} className="text-gray-500 dark:text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Table</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">{order.tableNumber}</p>
            </div>
          </div>
        </div>

        {/* Waiter Info */}
        <div className="flex items-center space-x-2">
          <User size={16} className="text-gray-500 dark:text-gray-400" />
          <div className="flex-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">Waiter</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">{order.createdBy}</p>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center space-x-2">
          <Clock size={16} className="text-gray-500 dark:text-gray-400" />
          <div className="flex-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${getStatusColor(order.status)}`}>
              {formatStatus(order.status)}
            </span>
          </div>
        </div>

        {/* Notes - Enhanced visibility */}
        {order.notes && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center">
              <MessageSquare size={16} className="mr-2 text-blue-600 dark:text-blue-400" />
              Order Notes
            </h3>
            <div className="bg-white dark:bg-gray-800 rounded-md p-3 border border-blue-200 dark:border-blue-600">
              <p className="text-gray-900 dark:text-gray-100 italic">{order.notes}</p>
            </div>
          </div>
        )}

        {/* Items */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center">
            <FileText size={16} className="mr-2 text-gray-500 dark:text-gray-400" />
            Order Items
          </h3>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
            {Array.isArray(order.items) ? order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">{item.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-blue-600 dark:text-blue-400">{item.price * item.quantity}с</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.price}с each</p>
                </div>
              </div>
            )) : (
              <p className="text-gray-500 dark:text-gray-400">No items found</p>
            )}
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center">
            <DollarSign size={16} className="mr-2 text-blue-600 dark:text-blue-400" />
            Pricing Details
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Base Price:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{order.basePrice}с</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Service Fee (15%):</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{order.serviceFeePrice - order.basePrice}с</span>
            </div>
            <div className="border-t border-blue-200 dark:border-blue-700 pt-2">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900 dark:text-gray-100">Total:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">{order.serviceFeePrice}с</span>
              </div>
            </div>
          </div>
        </div>

        {/* Timestamp */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Created on {date} at {time}</p>
        </div>

        {/* Actions */}
        <div className="flex space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="SECONDARY"
            onClick={handleEditClick}
            className="flex-1 flex items-center justify-center space-x-2"
          >
            <Edit2 size={16} />
            <span>Edit</span>
          </Button>
          
          {order.status !== 'completed' && (
            <Button
              variant="SUCCESS"
              onClick={() => {
                onStatusChange(order.id, 'completed');
                onClose();
              }}
              className="flex-1 flex items-center justify-center space-x-2"
            >
              <CheckCircle size={16} />
              <span>Complete</span>
            </Button>
          )}
          
          {user?.role === 'admin' && (
            <Button
              variant="DANGER"
              onClick={() => {
                onDelete(order.id);
                onClose();
              }}
              className="flex-1 flex items-center justify-center space-x-2"
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
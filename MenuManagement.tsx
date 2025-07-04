import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MenuItem } from '../../types';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Edit2, Trash2, Plus, Search, AlertCircle, Eye, EyeOff, Save, Loader2, X } from 'lucide-react';
import { supabaseService } from '../../services/supabaseService';
import { TableSkeleton } from '../ui/LoadingSkeleton';

const MENU_CATEGORIES = [
  'ЗАВТРАКИ',
  'САЛАТЫ', 
  'ПЕРВЫЕ БЛЮДА',
  'ВТОРЫЕ БЛЮДА',
  'НАЦИОНАЛЬНАЯ КУХНЯ',
  'ГАРНИРЫ',
  'БАР',
  'ШАШЛЫКИ',
  'БЛЮДА НА КОМПАНИЮ',
  'ФАСТФУД'
];

export const MenuManagement: React.FC = () => {
  const { t } = useTranslation();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showUnavailable, setShowUnavailable] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    grams: '',
    price: '',
    category: 'ЗАВТРАКИ',
    is_available: true
  });

  useEffect(() => {
    loadMenuItems();
    
    // Subscribe to real-time updates
    const unsubscribe = supabaseService.subscribeToMenuItems((updatedItems) => {
      console.log('Menu items updated via subscription:', updatedItems.length);
      setMenuItems(updatedItems);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    filterItems();
  }, [menuItems, searchTerm, selectedCategory, showUnavailable]);

  const loadMenuItems = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const items = await supabaseService.getAllMenuItems();
      console.log('Loaded menu items from Supabase:', items.length);
      setMenuItems(items);
    } catch (error) {
      console.error('Error loading menu items:', error);
      setError(t('errors.loadingError'));
    } finally {
      setIsLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = menuItems;

    if (!showUnavailable) {
      filtered = filtered.filter(item => item.is_available);
    }

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    setFilteredItems(filtered);
  };

  const handleAddNew = () => {
    console.log('Add new menu item button clicked - opening modal');
    setEditingItem(null);
    setFormData({ 
      name: '', 
      grams: '', 
      price: '', 
      category: 'ЗАВТРАКИ',
      is_available: true 
    });
    setIsModalOpen(true);
  };

  const handleEdit = (item: MenuItem) => {
    console.log('Edit menu item button clicked for:', item.name, 'ID:', item.id);
    console.log('Item data:', item);
    
    try {
      setEditingItem(item);
      setFormData({
        name: item.name || '',
        grams: item.grams || '',
        price: item.price?.toString() || '',
        category: item.category || 'ЗАВТРАКИ',
        is_available: item.is_available ?? true
      });
      
      console.log('Form data set to:', {
        name: item.name || '',
        grams: item.grams || '',
        price: item.price?.toString() || '',
        category: item.category || 'ЗАВТРАКИ',
        is_available: item.is_available ?? true
      });
      
      setIsModalOpen(true);
      console.log('Modal should now be open');
    } catch (error) {
      console.error('Error in handleEdit:', error);
      alert('Error opening edit form. Please try again.');
    }
  };

  const handleDelete = async (itemId: string) => {
    if (confirm(t('menu.confirmDeleteItem'))) {
      try {
        console.log('Deleting menu item from Supabase:', itemId);
        const { error } = await supabaseService.deleteMenuItem(itemId);
        
        if (error) {
          console.error('Error deleting menu item:', error);
          alert(t('errors.savingError'));
          return;
        }
        
        console.log('Menu item deleted successfully from Supabase');
        // Items will be updated via real-time subscription
      } catch (error) {
        console.error('Error deleting menu item:', error);
        alert(t('errors.savingError'));
      }
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      console.log('Toggling availability in Supabase for:', item.name, 'from', item.is_available, 'to', !item.is_available);
      const { error } = await supabaseService.updateMenuItem(item.id, {
        is_available: !item.is_available
      });
      
      if (error) {
        console.error('Error updating menu item availability:', error);
        alert(t('errors.savingError'));
        return;
      }
      
      console.log('Menu item availability updated successfully in Supabase');
      // Items will be updated via real-time subscription
    } catch (error) {
      console.error('Error updating menu item availability:', error);
      alert(t('errors.savingError'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted with data:', formData);
    console.log('Editing item:', editingItem);
    
    if (!formData.name.trim() || !formData.price || !formData.category) {
      alert('Please fill in all required fields (Name, Price, Category)');
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price < 0) {
      alert('Please enter a valid price (must be a positive number)');
      return;
    }

    setIsSaving(true);

    try {
      const itemData = {
        name: formData.name.trim(),
        grams: formData.grams.trim() || undefined,
        price,
        category: formData.category,
        is_available: formData.is_available,
      };

      console.log('Submitting item data to Supabase:', itemData);

      if (editingItem) {
        // Update existing item in Supabase
        console.log('Updating menu item in Supabase:', editingItem.id, itemData);
        const { error } = await supabaseService.updateMenuItem(editingItem.id, itemData);
        
        if (error) {
          console.error('Error updating menu item in Supabase:', error);
          alert(t('errors.savingError'));
          return;
        }
        
        console.log('Menu item updated successfully in Supabase');
      } else {
        // Add new item to Supabase
        console.log('Creating new menu item in Supabase:', itemData);
        const { error } = await supabaseService.createMenuItem(itemData);
        
        if (error) {
          console.error('Error creating menu item in Supabase:', error);
          alert(t('errors.savingError'));
          return;
        }
        
        console.log('Menu item created successfully in Supabase');
      }

      // Close modal and reset form
      setIsModalOpen(false);
      setFormData({ 
        name: '', 
        grams: '', 
        price: '', 
        category: 'ЗАВТРАКИ',
        is_available: true 
      });
      setEditingItem(null);
      
      // Show success message
      alert(editingItem ? t('menu.itemUpdated') : t('menu.itemCreated'));
      
      // Items will be updated via real-time subscription
    } catch (error) {
      console.error('Error saving menu item to Supabase:', error);
      alert(t('errors.savingError'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseModal = () => {
    if (!isSaving) {
      console.log('Closing modal');
      setIsModalOpen(false);
      setEditingItem(null);
      setFormData({ 
        name: '', 
        grams: '', 
        price: '', 
        category: 'ЗАВТРАКИ',
        is_available: true 
      });
    }
  };

  const formatItemDisplay = (item: MenuItem) => {
    let display = item.name;
    if (item.grams) {
      display += ` (${item.grams})`;
    }
    return display;
  };

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center fade-in">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <div className="text-red-400 text-lg font-medium mb-4">{error}</div>
          <Button variant="PRIMARY" onClick={loadMenuItems}>
            {t('common.tryAgain')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in px-4 sm:px-0">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div className="slide-in-left">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 text-heading">{t('menu.title')}</h2>
          <p className="text-gray-400 text-base sm:text-lg text-subheading">{t('menu.description')}</p>
        </div>
        <Button
          variant="PRIMARY"
          onClick={handleAddNew}
          className="flex items-center justify-center space-x-2 slide-in-right w-full sm:w-auto min-h-[48px] px-6 py-3 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 gpu-accelerated"
          data-testid="add-new-item-button"
        >
          <Plus size={20} />
          <span>{t('menu.addNewItem')}</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="card-modern p-4 sm:p-6 space-y-4 slide-up">
        <div className="flex flex-col space-y-4">
          {/* Search */}
          <div className="relative">
            <Search 
              size={18} 
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10" 
            />
            <input
              type="text"
              placeholder={t('menu.searchItems')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-900 border-2 border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-200 font-inter text-base min-h-[48px]"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-modern min-h-[48px] text-base"
          >
            <option value="all">{t('menu.allCategories')}</option>
            {MENU_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {t(`categories.${category}`) || category}
              </option>
            ))}
          </select>

          {/* Show Unavailable Toggle */}
          <label className="flex items-center space-x-3 text-gray-300 min-h-[48px] cursor-pointer">
            <input
              type="checkbox"
              checked={showUnavailable}
              onChange={(e) => setShowUnavailable(e.target.checked)}
              className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-cyan-600 focus:ring-cyan-500"
            />
            <span className="text-sm sm:text-base text-body">{t('menu.showUnavailable')}</span>
          </label>
        </div>

        <div className="text-sm text-gray-400 text-caption">
          {t('menu.showingItems')} <span className="font-semibold text-white">{filteredItems.length}</span> {t('menu.ofItems')} <span className="font-semibold text-white">{menuItems.length}</span> {t('menu.itemsText')}
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="slide-up stagger-1">
        {isLoading ? (
          <TableSkeleton rows={10} columns={6} />
        ) : filteredItems.length === 0 ? (
          <div className="card-modern p-8 sm:p-12 text-center">
            <div className="text-lg sm:text-xl font-semibold text-gray-400 mb-3 text-subheading">{t('menu.noItems')}</div>
            <div className="text-gray-500 text-caption">{t('menu.itemsDescription')}</div>
          </div>
        ) : (
          <div className="table-modern">
            <div className="overflow-x-auto scrollbar-modern">
              <table className="min-w-full">
                <thead className="table-header sticky top-0 z-10">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                      {t('menu.itemName')}
                    </th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider hidden sm:table-cell">
                      {t('menu.weightQuantity')}
                    </th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                      {t('menu.price')}
                    </th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider hidden md:table-cell">
                      {t('menu.category')}
                    </th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider hidden lg:table-cell">
                      {t('common.status')}
                    </th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                      {t('common.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredItems.map((item, index) => (
                    <tr 
                      key={item.id} 
                      className="table-row fade-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className={`text-xs sm:text-sm font-semibold ${item.is_available ? 'text-white' : 'text-gray-500'} text-body`}>
                          {item.name}
                          <div className="sm:hidden text-xs text-gray-400 mt-1 text-caption">
                            {item.grams && `${item.grams} • `}
                            <span className="md:hidden">{t(`categories.${item.category}`) || item.category}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                        <div className={`text-xs sm:text-sm ${item.is_available ? 'text-gray-300' : 'text-gray-600'} text-body`}>
                          {item.grams || '-'}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className={`text-xs sm:text-sm font-bold ${item.is_available ? 'accent-cyan' : 'text-gray-600'}`}>
                          {item.price}с
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                        <span className={`px-2 py-1 text-xs font-bold rounded-full transition-all duration-200 hover:scale-105 ${
                          item.is_available 
                            ? 'bg-gray-800 text-gray-300 border border-gray-700' 
                            : 'bg-gray-900 text-gray-600 border border-gray-800'
                        }`}>
                          {t(`categories.${item.category}`) || item.category}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 hidden lg:table-cell">
                        <span className={`px-2 py-1 text-xs font-bold rounded-full transition-all duration-200 hover:scale-105 ${
                          item.is_available 
                            ? 'bg-green-900 text-green-300 border border-green-700' 
                            : 'bg-red-900 text-red-300 border border-red-700'
                        }`}>
                          {item.is_available ? t('menu.statusAvailable') : t('menu.statusUnavailable')}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-1">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Edit button clicked for menu item:', item.name, 'ID:', item.id);
                              handleEdit(item);
                            }}
                            className="btn-modern btn-secondary p-2 transition-all duration-200 hover:scale-105 gpu-accelerated min-w-[48px] min-h-[48px] flex items-center justify-center focus-modern rounded-lg"
                            title={t('menu.editItemAction')}
                            type="button"
                            data-testid={`edit-item-${item.id}`}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleToggleAvailability(item);
                            }}
                            className={`btn-modern ${item.is_available ? 'btn-outline' : 'btn-success'} p-2 transition-all duration-200 hover:scale-105 gpu-accelerated min-w-[48px] min-h-[48px] flex items-center justify-center focus-modern rounded-lg`}
                            title={item.is_available ? t('menu.markAsUnavailable') : t('menu.markAsAvailable')}
                            type="button"
                          >
                            {item.is_available ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDelete(item.id);
                            }}
                            className="btn-modern btn-danger p-2 transition-all duration-200 hover:scale-105 gpu-accelerated min-w-[48px] min-h-[48px] flex items-center justify-center focus-modern rounded-lg"
                            title={t('menu.deleteItem')}
                            type="button"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal - Enhanced for Full Editing and Mobile Optimization */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingItem ? t('menu.editItem') : t('menu.addNewItem')}
        size="md"
      >
        <div className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-white mb-2 text-subheading">
                {t('menu.itemName')} *
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="input-modern min-h-[48px] text-base"
                placeholder={t('menu.enterItemName')}
                required
                disabled={isSaving}
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="grams" className="block text-sm font-semibold text-white mb-2 text-subheading">
                {t('menu.weight')}
              </label>
              <input
                id="grams"
                type="text"
                value={formData.grams}
                onChange={(e) => setFormData(prev => ({ ...prev, grams: e.target.value }))}
                className="input-modern min-h-[48px] text-base"
                placeholder={t('menu.weightOptional')}
                disabled={isSaving}
              />
              <p className="text-xs text-gray-400 mt-1 text-caption">
                {t('menu.weightDescription')}
              </p>
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-semibold text-white mb-2 text-subheading">
                {t('menu.price')} (с) *
              </label>
              <input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                className="input-modern min-h-[48px] text-base"
                placeholder={t('menu.enterPrice')}
                required
                disabled={isSaving}
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-semibold text-white mb-2 text-subheading">
                {t('menu.category')} *
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="input-modern min-h-[48px] text-base"
                required
                disabled={isSaving}
              >
                {MENU_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {t(`categories.${category}`) || category}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-3 min-h-[48px]">
              <input
                id="is_available"
                type="checkbox"
                checked={formData.is_available}
                onChange={(e) => setFormData(prev => ({ ...prev, is_available: e.target.checked }))}
                className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-cyan-600 focus:ring-cyan-500"
                disabled={isSaving}
              />
              <label htmlFor="is_available" className="text-sm font-semibold text-white cursor-pointer text-subheading">
                {t('menu.available')}
              </label>
            </div>

            {/* Supabase Sync Status */}
            <div className="bg-cyan-900/20 border border-cyan-700 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                <span className="accent-cyan text-sm font-medium text-subheading">
                  {t('menu.realTimeSync')}
                </span>
              </div>
              <p className="text-cyan-200 text-xs mt-1 text-caption">
                {t('menu.syncDescription')}
              </p>
            </div>

            <div className="flex flex-col space-y-3 pt-6 border-t border-gray-700">
              <Button 
                type="submit" 
                variant="PRIMARY" 
                className="w-full min-h-[48px] flex items-center justify-center space-x-2 text-base font-semibold rounded-xl"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>{t('orders.saving')}</span>
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    <span>{editingItem ? t('menu.updateItem') : t('menu.addItem')}</span>
                  </>
                )}
              </Button>
              <Button 
                type="button" 
                variant="OUTLINE" 
                onClick={handleCloseModal} 
                className="w-full min-h-[48px] text-base font-semibold rounded-xl"
                disabled={isSaving}
              >
                {t('common.cancel')}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};
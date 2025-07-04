import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { LanguageToggle } from './LanguageToggle';
import { ThemeToggle } from './ThemeToggle';
import { 
  User, 
  Mail, 
  Shield, 
  LogOut,
  Palette,
  Settings
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleDisplay = (role: string) => {
    return role === 'admin' ? t('auth.admin') : t('auth.waiter');
  };

  const getRoleIcon = (role: string) => {
    return role === 'admin' ? Shield : User;
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const RoleIcon = getRoleIcon(user?.role || 'waiter');

  return (
    <div className="min-h-screen bg-primary page-transition">
      <div className="p-6 max-w-4xl mx-auto space-section">
        {/* Header */}
        <div className="mb-8 slide-in-left">
          <h1 className="text-display text-primary mb-3 text-heading flex items-center space-x-3">
            <Settings className="text-accent-primary" size={48} />
            <span>{t('profile.settings')}</span>
          </h1>
          <p className="text-subtitle text-secondary text-subheading">
            {t('profile.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Personal Information - Full Width */}
          <div className="space-y-6">
            <div className="card-modern slide-up">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-title text-primary text-heading flex items-center space-x-3">
                  <User className="text-accent-primary" size={24} />
                  <span>{t('profile.personalInfo')}</span>
                </h2>
              </div>

              <div className="space-y-6">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-semibold text-primary mb-3 text-subheading">
                    {t('profile.name')}
                  </label>
                  <div className="flex items-center space-x-3 p-4 bg-secondary border border-primary rounded-lg">
                    <User className="text-tertiary" size={20} />
                    <span className="text-primary font-medium text-body">{user?.name}</span>
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-semibold text-primary mb-3 text-subheading">
                    {t('profile.email')}
                  </label>
                  <div className="flex items-center space-x-3 p-4 bg-secondary border border-primary rounded-lg">
                    <Mail className="text-tertiary" size={20} />
                    <span className="text-primary font-medium text-body">{user?.email}</span>
                  </div>
                  <p className="text-xs text-tertiary mt-2 text-caption">
                    Email cannot be changed for security reasons
                  </p>
                </div>

                {/* Role Field */}
                <div>
                  <label className="block text-sm font-semibold text-primary mb-3 text-subheading">
                    {t('profile.role')}
                  </label>
                  <div className="flex items-center space-x-3 p-4 bg-secondary border border-primary rounded-lg">
                    <RoleIcon className="text-accent-primary" size={20} />
                    <span className="text-primary font-medium text-body">
                      {getRoleDisplay(user?.role || 'waiter')}
                    </span>
                    {user?.role === 'admin' && (
                      <span className="px-2 py-1 bg-accent-primary/20 border border-accent-primary/50 rounded-full text-xs font-bold text-accent-primary">
                        ADMIN
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div className="card-modern slide-up stagger-1">
              <h2 className="text-title text-primary mb-6 text-heading flex items-center space-x-3">
                <Palette className="text-accent-primary" size={24} />
                <span>{t('profile.accountSettings')}</span>
              </h2>

              <div className="space-y-8">
                {/* Theme Toggle */}
                <div>
                  <label className="block text-sm font-semibold text-primary mb-3 text-subheading flex items-center space-x-2">
                    <Palette className="text-accent-primary" size={16} />
                    <span>{t('profile.appearance')}</span>
                  </label>
                  <p className="text-sm text-tertiary mb-4 text-caption">
                    {t('profile.appearanceDescription')}
                  </p>
                  <ThemeToggle />
                </div>

                {/* Language Toggle */}
                <div>
                  <label className="block text-sm font-semibold text-primary mb-3 text-subheading">
                    {t('profile.language')}
                  </label>
                  <p className="text-sm text-tertiary mb-4 text-caption">
                    {t('profile.languageDescription')}
                  </p>
                  <LanguageToggle />
                </div>
              </div>
            </div>

            {/* Account Actions */}
            <div className="card-modern slide-up stagger-2">
              <h2 className="text-title text-primary mb-6 text-heading flex items-center space-x-3">
                <Settings className="text-accent-primary" size={24} />
                <span>{t('profile.accountActions')}</span>
              </h2>

              <div className="space-y-4">
                <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-red-400 mb-2 text-subheading">
                    {t('profile.signOut')}
                  </h3>
                  <p className="text-sm text-red-300 mb-4 text-caption">
                    {t('profile.signOutDescription')}
                  </p>
                  <Button
                    variant="DANGER"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex items-center space-x-2"
                  >
                    {isLoggingOut ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>{t('auth.signingOut')}</span>
                      </>
                    ) : (
                      <>
                        <LogOut size={16} />
                        <span>{t('auth.logout')}</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
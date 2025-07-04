import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Settings, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

export const Header: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const getWaiterDisplay = (userName: string) => {
    if (userName === 'Player 1') return 'Player 1';
    if (userName === 'Player 2') return 'Player 2';
    return userName;
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleLogoClick = () => {
    navigate('/dashboard');
  };

  return (
    <header className="bg-primary border-b border-primary px-4 sm:px-6 py-4 transition-all duration-300 shadow-strong sticky top-0 z-50 backdrop-blur-sm">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-4 slide-in-left">
          {/* Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group transition-all duration-300 hover:scale-105 gpu-accelerated"
            onClick={handleLogoClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleLogoClick();
              }
            }}
            aria-label="Go to dashboard"
          >
            {/* Logo Image */}
            <div className="relative">
              <img 
                src="https://i.ibb.co/fz4jksJz/image.jpg" 
                alt="Themis Logo" 
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl shadow-lg transition-all duration-300 group-hover:shadow-neon group-hover:scale-110 object-cover border-2 border-primary group-hover:border-accent-primary"
                style={{
                  filter: 'brightness(1.1) contrast(1.1)',
                  imageRendering: 'crisp-edges'
                }}
              />
              {/* Subtle glow effect on hover */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
            
            {/* Brand Text */}
            <div className="flex flex-col">
              <h1 className="text-xl sm:text-2xl font-bold text-primary tracking-tight text-heading group-hover:text-accent-primary transition-colors duration-300">
                Themis
              </h1>
              {user && user.role === 'admin' && (
                <p className="text-xs sm:text-sm text-accent-primary font-medium fade-in stagger-1 text-subheading">
                  {t('dashboard.adminDashboard')}
                </p>
              )}
              {user && user.role === 'waiter' && (
                <p className="text-xs sm:text-sm text-secondary font-medium fade-in stagger-1 text-subheading">
                  <span className="text-primary">{getWaiterDisplay(user.name)}</span>
                  <span className="mx-2 text-tertiary">•</span>
                  <span className="capitalize text-accent-primary">{t('auth.waiter')}</span>
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 slide-in-right">
          {/* Development Mode Indicator */}
          <div className="hidden sm:flex items-center space-x-2 bg-accent-success/20 border border-accent-success/30 rounded-lg px-3 py-2">
            <Settings size={14} className="text-accent-success" />
            <span className="text-accent-success text-xs font-medium text-subheading">{t('auth.devMode')}</span>
          </div>

          {/* Settings Button */}
          {user && (
            <Button
              variant="SECONDARY"
              size="sm"
              onClick={handleProfileClick}
              className="flex items-center justify-center space-x-2 transition-all duration-200 hover:scale-105 gpu-accelerated rounded-lg min-w-[44px] min-h-[44px] px-3 py-2 text-sm hover-glow"
              title="Settings"
            >
              <Settings size={16} className="flex-shrink-0" />
              <span className="hidden sm:inline font-medium whitespace-nowrap">{t('nav.settings')}</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
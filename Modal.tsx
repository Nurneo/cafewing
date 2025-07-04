import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md' 
}) => {
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = 'var(--scrollbar-width, 0px)';
      
      // Calculate scrollbar width to prevent layout shift
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
    } else {
      // Restore body scroll
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.documentElement.style.removeProperty('--scrollbar-width');
    }

    return () => {
      // Cleanup on unmount
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.documentElement.style.removeProperty('--scrollbar-width');
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Focus trap - focus the modal when it opens
      const modalElement = document.querySelector('[data-modal="true"]') as HTMLElement;
      if (modalElement) {
        modalElement.focus();
      }
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'w-[95vw] max-w-sm',
    md: 'w-[95vw] max-w-md',
    lg: 'w-[95vw] max-w-2xl',
    xl: 'w-[95vw] max-w-4xl',
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if clicking the backdrop itself, not the modal content
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop with enhanced blur and proper stacking */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-all duration-300 ease-out"
        style={{ 
          zIndex: 9998,
          animation: 'fadeIn 0.3s ease-out'
        }}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />
      
      {/* Modal Container - Enhanced Mobile Positioning */}
      <div 
        className="fixed inset-0 flex items-center justify-center transition-all duration-300 ease-out"
        style={{ 
          zIndex: 9999,
          animation: 'fadeIn 0.3s ease-out',
          padding: 'env(safe-area-inset-top, 0.5rem) env(safe-area-inset-right, 0.5rem) env(safe-area-inset-bottom, 0.5rem) env(safe-area-inset-left, 0.5rem)'
        }}
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        data-modal="true"
        tabIndex={-1}
      >
        {/* Modal Content - Mobile Optimized */}
        <div 
          className={`
            bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl 
            transition-all duration-300 ease-out
            ${sizeClasses[size]}
            flex flex-col
            relative
          `}
          style={{ 
            animation: 'modalSlideIn 0.3s ease-out',
            // Mobile-specific height constraints
            maxHeight: 'calc(100vh - env(safe-area-inset-top, 1rem) - env(safe-area-inset-bottom, 1rem))',
            minHeight: 'auto'
          }}
          onClick={(e) => e.stopPropagation()} // Prevent backdrop close when clicking modal content
        >
          {/* Header - Sticky */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700 sticky top-0 bg-gray-900 z-10 rounded-t-2xl flex-shrink-0">
            <h2 
              id="modal-title"
              className="text-lg sm:text-xl font-bold text-white truncate pr-4 text-heading"
            >
              {title}
            </h2>
            <Button
              variant="OUTLINE"
              size="sm"
              onClick={onClose}
              className="p-2 hover:bg-gray-800 transition-all duration-200 hover:scale-105 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full flex-shrink-0"
              aria-label="Close modal"
              tabIndex={0}
            >
              <X size={18} />
            </Button>
          </div>
          
          {/* Content - Scrollable with Mobile Safe Area */}
          <div 
            className="flex-1 overflow-y-auto scrollbar-modern"
            style={{ 
              // Better scrolling on mobile devices
              WebkitOverflowScrolling: 'touch',
              // Ensure content can scroll properly
              minHeight: 0,
              // Add bottom padding for mobile safe area
              paddingBottom: 'env(safe-area-inset-bottom, 0)'
            }}
          >
            {children}
          </div>
        </div>
      </div>

      {/* Enhanced CSS Styles for Mobile */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        /* Mobile-specific improvements */
        @media (max-width: 640px) {
          [data-modal="true"] {
            padding: 0.5rem;
          }
        }

        /* Enhanced mobile viewport handling */
        @supports (height: 100dvh) {
          [data-modal="true"] {
            max-height: calc(100dvh - 1rem);
          }
        }

        /* iOS Safari specific fixes */
        @supports (-webkit-touch-callout: none) {
          [data-modal="true"] {
            -webkit-overflow-scrolling: touch;
            /* Fix for iOS viewport issues */
            max-height: calc(100vh - 2rem);
          }
          
          /* Handle notches and safe areas */
          [data-modal="true"] {
            max-height: calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 1rem);
          }
        }

        /* Android Chrome fixes */
        @media screen and (max-width: 640px) {
          [data-modal="true"] {
            /* Account for mobile browser chrome */
            max-height: calc(100vh - 1rem);
            margin-top: 0.5rem;
            margin-bottom: 0.5rem;
          }
        }

        /* Landscape mobile fixes */
        @media screen and (max-height: 500px) and (orientation: landscape) {
          [data-modal="true"] {
            max-height: calc(100vh - 0.5rem);
            margin-top: 0.25rem;
            margin-bottom: 0.25rem;
          }
        }

        /* Ensure proper focus outline for accessibility */
        [data-modal="true"]:focus {
          outline: none;
        }

        /* Fix for small screen height */
        @media screen and (max-height: 600px) {
          [data-modal="true"] .flex-1 {
            max-height: calc(100vh - 8rem);
          }
        }
      `}</style>
    </>
  );
};
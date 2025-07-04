import React from 'react';
import { BUTTON_VARIANTS } from '../../utils/constants';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof BUTTON_VARIANTS;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'PRIMARY',
  size = 'md',
  children,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const variantClasses = BUTTON_VARIANTS[variant];
  const sizeClass = sizeClasses[size];

  return (
    <button
      className={`${variantClasses} ${sizeClass} ${className} focus-modern`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
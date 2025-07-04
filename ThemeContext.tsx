import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeContextType } from '../types';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    // Check for saved theme preference or default to dark
    const savedTheme = localStorage.getItem('themis_theme') as 'light' | 'dark' | null;
    const initialTheme = savedTheme || 'dark';
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  const applyTheme = (newTheme: 'light' | 'dark') => {
    const html = document.documentElement;
    const body = document.body;
    
    // Remove existing theme classes from both html and body
    html.classList.remove('light', 'dark');
    body.classList.remove('light', 'dark');
    
    // Add new theme class to html element (primary)
    html.classList.add(newTheme);
    // Also add to body for compatibility
    body.classList.add(newTheme);
    
    // Set CSS custom properties for the theme
    if (newTheme === 'dark') {
      html.style.setProperty('--bg-primary', '#000000');
      html.style.setProperty('--bg-secondary', '#0A0A0A');
      html.style.setProperty('--bg-tertiary', '#1A1A1A');
      html.style.setProperty('--bg-card', '#111111');
      html.style.setProperty('--text-primary', '#FFFFFF');
      html.style.setProperty('--text-secondary', '#E5E5E5');
      html.style.setProperty('--text-tertiary', '#A9A9A9');
      html.style.setProperty('--text-muted', '#666666');
      html.style.setProperty('--border-primary', '#2E2E2E');
      html.style.setProperty('--border-secondary', '#1A1A1A');
      html.style.setProperty('--accent-primary', '#00FFFF');
      html.style.setProperty('--accent-secondary', '#1F51FF');
      html.style.setProperty('--accent-error', '#FF4C4C');
      html.style.setProperty('--accent-success', '#00FF7F');
      html.style.setProperty('--shadow-light', 'rgba(255, 255, 255, 0.05)');
      html.style.setProperty('--shadow-dark', 'rgba(0, 0, 0, 0.8)');
    } else {
      html.style.setProperty('--bg-primary', '#FFFFFF');
      html.style.setProperty('--bg-secondary', '#F8F9FA');
      html.style.setProperty('--bg-tertiary', '#F1F3F4');
      html.style.setProperty('--bg-card', '#FFFFFF');
      html.style.setProperty('--text-primary', '#111111');
      html.style.setProperty('--text-secondary', '#2C2C2C');
      html.style.setProperty('--text-tertiary', '#5F6368');
      html.style.setProperty('--text-muted', '#9AA0A6');
      html.style.setProperty('--border-primary', '#E0E0E0');
      html.style.setProperty('--border-secondary', '#F1F3F4');
      html.style.setProperty('--accent-primary', '#1F51FF');
      html.style.setProperty('--accent-secondary', '#00BFFF');
      html.style.setProperty('--accent-error', '#FF4C4C');
      html.style.setProperty('--accent-success', '#00C781');
      html.style.setProperty('--shadow-light', 'rgba(0, 0, 0, 0.05)');
      html.style.setProperty('--shadow-dark', 'rgba(0, 0, 0, 0.15)');
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('themis_theme', newTheme);
    applyTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
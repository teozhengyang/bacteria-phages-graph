/**
 * Theme Context - Theme Management
 * 
 * This context provides centralized theme management for the entire application.
 * It handles switching between light and dark themes and persists the preference
 * in localStorage.
 * 
 * Features:
 * - Light/dark theme toggle
 * - localStorage persistence
 * - Theme state management
 */

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme } from '../types';

/**
 * Theme state interface
 */
interface ThemeState {
  theme: Theme;
}

/**
 * Theme actions interface
 */
interface ThemeActions {
  toggleTheme: () => void;
}

/**
 * Combined theme context value interface
 */
interface ThemeContextValue extends ThemeState, ThemeActions {}

/**
 * Create the theme context
 */
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Custom hook to use the theme context
 * 
 * @returns {ThemeContextValue} The theme context
 * @throws {Error} If used outside of ThemeProvider
 */
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

/**
 * Theme Provider Props
 */
interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Theme Context Provider
 * 
 * Manages theme state and provides it to child components.
 * 
 * @param {ThemeProviderProps} props - Provider props containing children
 * @returns {JSX.Element} Context provider wrapping children
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');

  /**
   * Initialize theme from localStorage on mount
   */
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      setTheme(savedTheme);
    }
  }, []);

  /**
   * Toggle between light and dark themes
   */
  const toggleTheme = (): void => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    setTheme(newTheme);
  };

  const contextValue: ThemeContextValue = {
    theme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Theme Management Hook
 * 
 * Provides theme state management and persistence functionality.
 * Handles light/dark mode switching with automatic browser storage
 * to maintain user preferences across sessions.
 */

import { useState, useCallback, useEffect } from 'react';
import { ThemeService } from '../services/themeService';
import { Theme } from '../types';

/**
 * Custom hook for managing application theme
 * 
 * Integrates with ThemeService to provide:
 * - Current theme state
 * - Theme toggle functionality
 * - Direct theme setting capability
 * - Automatic persistence to localStorage
 * 
 * @returns {Object} Theme state and control functions
 */
export function useTheme() {
  // Get singleton instance of theme service for consistent state management
  const themeService = ThemeService.getInstance();
  
  // Initialize theme state from the theme service (which checks localStorage)
  const [theme, setTheme] = useState<Theme>(themeService.getCurrentTheme());

  /**
   * Toggle between light and dark themes
   * Uses useCallback to prevent unnecessary re-renders in dependent components
   */
  const toggleTheme = useCallback(() => {
    // Delegate toggle logic to theme service and update local state
    const newTheme = themeService.toggleTheme();
    setTheme(newTheme);
  }, [themeService]);

  /**
   * Set a specific theme value
   * Allows direct theme setting instead of just toggling
   * 
   * @param {Theme} newTheme - The theme to set ('light' or 'dark')
   */
  const setThemeValue = useCallback((newTheme: Theme) => {
    // Update theme service and local state
    themeService.setTheme(newTheme);
    setTheme(newTheme);
  }, [themeService]);

  /**
   * Sync with theme service on component mount
   * Ensures state is consistent if theme was changed elsewhere
   */
  useEffect(() => {
    setTheme(themeService.getCurrentTheme());
  }, [themeService]);

  return {
    theme,          // Current theme ('light' or 'dark')
    toggleTheme,    // Function to toggle between themes
    setTheme: setThemeValue, // Function to set specific theme
  };
}

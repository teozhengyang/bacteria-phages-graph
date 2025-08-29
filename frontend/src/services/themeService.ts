/**
 * Theme Service - Centralized Theme Management
 * 
 * Singleton service that manages application theme state with persistence.
 * Handles theme switching, localStorage integration, and DOM manipulation
 * for consistent theming across the entire application.
 * 
 * Features:
 * - Automatic theme persistence to localStorage
 * - DOM attribute management for CSS theme switching
 * - SSR-safe theme handling
 * - Singleton pattern for consistent state
 */

import { THEME_STORAGE_KEY, DEFAULT_THEME } from '../constants';
import { Theme } from '../types';

export class ThemeService {
  private static instance: ThemeService; // Singleton instance
  private currentTheme: Theme;           // Current active theme

  /**
   * Private constructor for singleton pattern
   * Initializes theme from localStorage and applies it to the DOM
   */
  private constructor() {
    // Load theme from localStorage or use default
    this.currentTheme = this.getStoredTheme();
    
    // Apply the initial theme to the DOM
    this.applyTheme(this.currentTheme);
  }

  /**
   * Get the singleton instance of ThemeService
   * Creates a new instance if one doesn't exist
   * 
   * @returns {ThemeService} The singleton ThemeService instance
   */
  public static getInstance(): ThemeService {
    if (!ThemeService.instance) {
      ThemeService.instance = new ThemeService();
    }
    return ThemeService.instance;
  }

  /**
   * Retrieve stored theme from localStorage with fallback
   * Safely handles SSR scenarios where localStorage is not available
   * 
   * @returns {Theme} The stored theme or default theme
   */
  private getStoredTheme(): Theme {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      // Return stored theme if valid, otherwise use default
      return (stored as Theme) || DEFAULT_THEME;
    }
    // Return default theme in SSR/non-browser environments
    return DEFAULT_THEME;
  }

  /**
   * Apply theme to DOM and persist to localStorage
   * 
   * Updates the document's data-theme attribute for CSS theming
   * and saves the preference to localStorage for future sessions.
   * 
   * @param {Theme} theme - The theme to apply ('light' or 'dark')
   */
  private applyTheme(theme: Theme): void {
    // Update DOM data attribute for CSS theme targeting
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
    
    // Persist theme preference to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  }

  /**
   * Get the current active theme
   * 
   * @returns {Theme} The currently active theme
   */
  public getCurrentTheme(): Theme {
    return this.currentTheme;
  }

  /**
   * Toggle between light and dark themes
   * 
   * Switches from current theme to the opposite theme,
   * applies the change, and returns the new theme.
   * 
   * @returns {Theme} The new active theme after toggling
   */
  public toggleTheme(): Theme {
    // Switch to opposite theme
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    
    // Apply the new theme
    this.applyTheme(this.currentTheme);
    
    return this.currentTheme;
  }

  /**
   * Set a specific theme
   * 
   * Directly sets the theme to the specified value,
   * useful for programmatic theme setting or user preference restoration.
   * 
   * @param {Theme} theme - The theme to set ('light' or 'dark')
   */
  public setTheme(theme: Theme): void {
    this.currentTheme = theme;
    this.applyTheme(theme);
  }
}

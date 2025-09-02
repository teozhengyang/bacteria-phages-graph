/**
 * Context Module Exports
 * 
 * Centralized exports for all context-related functionality.
 * This provides a clean import interface for components that need
 * to access the application context.
 */

/**
 * Context Exports
 * 
 * Centralized export for all application contexts and their hooks.
 * This provides a single import point for context-related functionality.
 */

// Main App Context (combines all contexts)
export { AppProvider, useTheme, useData } from './AppContext';

// Individual Contexts (for direct access if needed)
export { ThemeProvider, useTheme as useThemeContext } from './ThemeContext';
export { DataProvider, useData as useDataContext } from './DataContext';

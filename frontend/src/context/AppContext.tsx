/**
 * Application Context - Combined Context Provider
 * 
 * This file provides a unified context provider that combines all application
 * contexts (Theme and Data) into a single provider. It also re-exports the
 * individual hooks for convenience.
 * 
 * Features:
 * - Combined context providers (Theme + Data)
 * - Re-exported convenience hooks
 * - Centralized provider setup
 */

'use client';

import React, { ReactNode } from 'react';
import { ThemeProvider } from './ThemeContext';
import { DataProvider } from './DataContext';

// Re-export hooks for convenience
export { useTheme } from './ThemeContext';
export { useData } from './DataContext';

/**
 * App Provider Props
 */
interface AppProviderProps {
  children: ReactNode;
}

/**
 * Application Context Provider
 * 
 * Combines all application contexts into a single provider for easier
 * setup at the app root. This ensures proper nesting and initialization
 * of all context providers.
 * 
 * @param {AppProviderProps} props - Provider props containing children
 * @returns {JSX.Element} Combined context providers wrapping children
 */
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <ThemeProvider>
      <DataProvider>
        {children}
      </DataProvider>
    </ThemeProvider>
  );
};

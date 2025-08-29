/**
 * Theme Toggle Component - Dark/Light Mode Switcher
 * 
 * This component provides a visually appealing toggle button for switching
 * between light and dark themes. It features smooth animations, glassmorphism
 * styling, and contextual icons that change based on the current theme.
 * 
 * Features:
 * - Glassmorphism design with backdrop blur effects
 * - Smooth hover animations and scale transitions
 * - Contextual icons (moon for light mode, sun for dark mode)
 * - Loading state with disabled interaction
 * - Accessible button with proper focus states
 * - Theme-aware visual feedback
 * 
 * The component uses Lucide React icons for clean, consistent iconography
 * and applies modern CSS effects for an engaging user experience.
 */

'use client';

import React from 'react';
import { Moon, Sun } from 'lucide-react';

/**
 * Props interface for the ThemeToggle component
 * 
 * @interface ThemeToggleProps
 * @property {string} theme - Current theme ('light' or 'dark')
 * @property {Function} toggleTheme - Callback function to toggle theme
 * @property {boolean} [isLoading] - Loading state to disable interactions
 */
interface ThemeToggleProps {
  theme: 'light' | 'dark';     // Current theme setting
  toggleTheme: () => void;     // Theme toggle callback function
  isLoading?: boolean;         // Optional loading state
}

/**
 * ThemeToggle Component
 * 
 * Renders a glassmorphism-styled toggle button that switches between light
 * and dark themes. The button displays contextual icons and provides smooth
 * visual feedback during interactions.
 * 
 * @param {ThemeToggleProps} props - Component props
 * @returns {JSX.Element} Rendered theme toggle button
 */
const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  theme, 
  toggleTheme, 
  isLoading = false 
}) => {
  /**
   * Handle theme toggle click
   * 
   * Triggers the theme toggle callback unless the component is in a loading state.
   * This provides a clean separation between UI and state management.
   */
  const handleToggleClick = () => {
    if (!isLoading) {
      toggleTheme();
    }
  };

  /**
   * Get the appropriate icon based on current theme
   * 
   * Returns the contextual icon that represents the action that will be taken
   * when the button is clicked (moon for switching to dark, sun for switching to light).
   * 
   * @returns {JSX.Element} The appropriate icon component
   */
  const getThemeIcon = () => {
    return theme === 'light' ? (
      <Moon size={20} aria-label="Switch to dark mode" />
    ) : (
      <Sun size={20} aria-label="Switch to light mode" />
    );
  };

  return (
    <button
      onClick={handleToggleClick}
      disabled={isLoading}
      className={`
        bg-white/20 backdrop-blur-md rounded-full p-3 text-white 
        hover:bg-white/30 transition-all duration-300 hover:scale-110 
        shadow-lg border border-white/20 
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent
      `}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {getThemeIcon()}
    </button>
  );
};

export default ThemeToggle;

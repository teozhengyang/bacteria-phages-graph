/**
 * Tree Matrix Controls Component - Visualization Control Panel
 * 
 * This component provides control buttons for the TreeMatrix visualization,
 * specifically handling save/export functionality. It's designed as a floating
 * overlay positioned over the visualization for easy access while viewing.
 * 
 * Features:
 * - Floating overlay positioning with high z-index
 * - Save as PNG functionality with download icon
 * - Glassmorphism styling with backdrop blur
 * - Theme-aware colors and hover effects
 * - Smooth transition animations
 * - Accessible button with proper labeling
 * 
 * The component serves as a bridge between user interactions and the
 * underlying save functionality, providing a clean interface for
 * visualization export operations.
 */

'use client';

import React from 'react';

/**
 * Props interface for the TreeMatrixControls component
 * 
 * @interface TreeMatrixControlsProps
 * @property {Function} onSave - Callback function to trigger save operation
 * @property {string} [theme] - Current theme for styling consistency
 */
interface TreeMatrixControlsProps {
  onSave: () => void;              // Save operation callback
  theme?: 'light' | 'dark';       // Theme for consistent styling
}

/**
 * TreeMatrixControls Component
 * 
 * Renders a floating control panel over the visualization with save functionality.
 * The controls are positioned as an overlay and styled with glassmorphism effects
 * for a modern, accessible interface.
 * 
 * @param {TreeMatrixControlsProps} props - Component props
 * @returns {JSX.Element} Rendered control panel overlay
 */
const TreeMatrixControls: React.FC<TreeMatrixControlsProps> = ({
  onSave,
  theme = 'light',
}) => {
  /**
   * Handle save button click
   * 
   * Triggers the save callback to initiate the PNG export process.
   * The actual save logic is handled by the parent component or
   * associated hooks.
   */
  const handleSaveClick = () => {
    onSave();
  };

  return (
    <div className="absolute top-4 left-4 z-10">
      {/* Save as PNG Button */}
      <button
        onClick={handleSaveClick}
        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 backdrop-blur-md ${
          theme === 'dark'
            ? 'bg-gray-800/80 hover:bg-gray-700/80 text-white border border-gray-600'
            : 'bg-white/80 hover:bg-gray-50/80 text-gray-700 border border-gray-300'
        } shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
        title="Save visualization as PNG image"
        aria-label="Save current visualization as PNG file"
      >
        <span className="flex items-center gap-2">
          {/* Download Icon */}
          <svg 
            className="w-4 h-4" 
            fill="currentColor" 
            viewBox="0 0 20 20"
            role="img"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
          
          {/* Button Text */}
          <span>Save PNG</span>
        </span>
      </button>
    </div>
  );
};

export default TreeMatrixControls;

/**
 * Save Controls Component - Visualization Export Interface
 * 
 * This component provides a floating save button that allows users to export
 * the current visualization as a PNG image. It's positioned as an overlay on
 * the visualization with glassmorphism styling for modern aesthetics.
 * 
 * Features:
 * - Floating overlay positioning (top-left corner)
 * - PNG export functionality via callback
 * - Glassmorphism design with backdrop blur
 * - Theme-aware styling for light and dark modes
 * - Hover animations and visual feedback
 * - High z-index for overlay visibility
 * - Accessible button with proper labeling
 * 
 * The component serves as a bridge between the visualization display and
 * the save functionality, providing users with an intuitive way to
 * capture and export their customized visualizations.
 */

'use client';

import React from 'react';

/**
 * Props interface for the SaveControls component
 * 
 * @interface SaveControlsProps
 * @property {Function} onSave - Callback function to trigger save operation
 * @property {string} [theme] - Current theme for styling consistency
 */
interface SaveControlsProps {
  onSave: () => void;              // Save operation callback
  theme?: 'light' | 'dark';       // Theme for consistent styling
}

/**
 * SaveControls Component
 * 
 * Renders a floating save button overlay that allows users to export the
 * current visualization. The button is positioned over the visualization
 * with glassmorphism styling and theme-aware colors.
 * 
 * @param {SaveControlsProps} props - Component props
 * @returns {JSX.Element} Rendered save controls overlay
 */
const SaveControls: React.FC<SaveControlsProps> = ({ 
  onSave, 
  theme = 'light' 
}) => {
  /**
   * Handle save button click
   * 
   * Triggers the save callback function to initiate the PNG export process.
   * The actual save logic is handled by the parent component or hook.
   */
  const handleSaveClick = () => {
    onSave();
  };

  return (
    <div className={`absolute top-4 left-4 z-10`}>
      {/* Save as PNG Button */}
      <button
        onClick={handleSaveClick}
        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 backdrop-blur-md border shadow-sm ${
          theme === 'dark' 
            ? 'bg-gray-800/90 hover:bg-gray-700/90 text-white border-gray-600' 
            : 'bg-white/90 hover:bg-gray-50/90 text-gray-700 border-gray-300'
        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
        aria-label="Save visualization as PNG image"
        title="Export the current visualization as a PNG file"
      >
        <span role="img" aria-label="Download icon">📥</span>
        <span className="ml-2">Save as PNG</span>
      </button>
    </div>
  );
};

export default SaveControls;

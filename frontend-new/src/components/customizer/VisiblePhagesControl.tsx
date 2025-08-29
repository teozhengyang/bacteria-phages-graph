/**
 * Visible Phages Control Component - Phage Visibility Management
 * 
 * This component provides an interface for users to control which phages
 * are visible in the visualization matrix. It displays a list of all
 * available phages with checkbox controls for individual visibility toggle.
 * 
 * Features:
 * - Individual phage visibility toggles with checkboxes
 * - Visual feedback for selected/visible phages
 * - Scrollable list for handling large numbers of phages
 * - Theme-aware styling and hover effects
 * - Accessibility support with proper labeling
 * 
 * The component helps users focus on specific phages by filtering the
 * visualization to show only relevant phage-bacteria interactions.
 */

'use client';

import React from 'react';

/**
 * Props interface for the VisiblePhagesControl component
 * 
 * @interface VisiblePhagesControlProps
 * @property {string[]} headers - Array of all available phage names
 * @property {string[]} visiblePhages - Array of currently visible phage names
 * @property {Function} setVisiblePhages - State setter for visible phages
 * @property {string} [theme] - Current theme for styling consistency
 */
interface VisiblePhagesControlProps {
  headers: string[];                                             // All available phage names
  visiblePhages: string[];                                       // Currently visible phage names
  setVisiblePhages: React.Dispatch<React.SetStateAction<string[]>>; // Visibility state setter
  theme?: 'light' | 'dark';                                     // Theme for consistent styling
}

/**
 * VisiblePhagesControl Component
 * 
 * Renders a control panel for managing phage visibility in the visualization.
 * Provides checkboxes for individual phages with appropriate visual feedback
 * and accessibility features. The list is scrollable to handle large datasets.
 * 
 * @param {VisiblePhagesControlProps} props - Component props
 * @returns {JSX.Element} Rendered phage visibility control interface
 */
const VisiblePhagesControl: React.FC<VisiblePhagesControlProps> = ({
  headers,
  visiblePhages,
  setVisiblePhages,
  theme = 'light',
}) => {
  /**
   * Toggle visibility of a single phage
   * 
   * Adds the phage to visible list if not present, removes it if present.
   * Updates the visibility state to immediately reflect changes in the
   * visualization matrix.
   * 
   * @param {string} phage - Name of the phage to toggle
   */
  const togglePhage = (phage: string) => {
    if (visiblePhages.includes(phage)) {
      // Remove phage from visible list
      setVisiblePhages(prev => prev.filter(p => p !== phage));
    } else {
      // Add phage to visible list
      setVisiblePhages(prev => [...prev, phage]);
    }
  };

  /**
   * Handle checkbox change event
   * 
   * Wrapper function to handle checkbox state changes and trigger
   * the phage visibility toggle. This ensures consistent behavior
   * across different interaction methods.
   * 
   * @param {string} phage - Name of the phage being toggled
   */
  const handleToggleChange = (phage: string) => {
    togglePhage(phage);
  };

  return (
    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} shadow-sm border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
      {/* Section Header */}
      <h2 className={`font-semibold text-lg mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
        Visible Phages
      </h2>
      
      {/* Scrollable Phage List */}
      <div className="max-h-44 overflow-y-auto space-y-2">
        {headers.map(phage => {
          const isVisible = visiblePhages.includes(phage);
          
          return (
            <label
              key={`phage-${phage}`}
              className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer select-none transition-all duration-200 ${
                isVisible
                  ? theme === 'dark'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-900 border border-blue-200'
                  : theme === 'dark'
                    ? 'hover:bg-gray-600 text-gray-200'
                    : 'hover:bg-gray-50 text-gray-700'
              }`}
              title={`Toggle visibility of phage ${phage}`}
            >
              {/* Phage Visibility Checkbox */}
              <input
                type="checkbox"
                className="w-4 h-4 rounded focus:ring-2 focus:ring-blue-500"
                checked={isVisible}
                onChange={() => handleToggleChange(phage)}
                aria-label={`Toggle visibility of phage ${phage}`}
              />
              
              {/* Phage Name Label */}
              <span className="text-sm font-medium truncate flex-1" title={phage}>
                {phage}
              </span>
            </label>
          );
        })}
        
        {/* Empty State Message */}
        {headers.length === 0 && (
          <div className={`text-center py-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            <p className="text-sm">No phages available</p>
            <p className="text-xs mt-1">Upload data to see phages here</p>
          </div>
        )}
      </div>
      
      {/* Summary Information */}
      {headers.length > 0 && (
        <div className={`mt-3 pt-3 border-t text-xs ${
          theme === 'dark' 
            ? 'border-gray-600 text-gray-400' 
            : 'border-gray-200 text-gray-500'
        }`}>
          <span>
            {visiblePhages.length} of {headers.length} phages visible
          </span>
        </div>
      )}
    </div>
  );
};

export default VisiblePhagesControl;

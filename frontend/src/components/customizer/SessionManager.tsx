/**
 * Session Manager Component - User Session Import/Export Control
 * 
 * This component provides interface elements for users to save and restore
 * their visualization sessions. It allows exporting current application state
 * as a JSON file and importing previously saved sessions to restore state.
 * 
 * The component handles:
 * - Session export functionality with user-friendly button
 * - Session import via file selection with automatic file type validation
 * - Theme-aware styling for consistent visual integration
 * - Accessibility features with proper ARIA labels and focus management
 * 
 * Session data typically includes:
 * - Current data configuration
 * - Visualization settings
 * - User customizations and filters
 * - UI state preferences
 */

'use client';

import React from 'react';

/**
 * Props interface for the SessionManager component
 * 
 * @interface SessionManagerProps
 * @property {Function} exportSession - Callback to trigger session export
 * @property {Function} importSession - Callback to handle imported session file
 * @property {string} [theme] - Current theme for styling consistency
 */
interface SessionManagerProps {
  exportSession: () => void;                    // Function to export current session state
  importSession: (file: File) => void;          // Function to import session from file
  theme?: 'light' | 'dark';                   // Theme setting for visual consistency
}

/**
 * SessionManager Component
 * 
 * Renders session management controls allowing users to save their current
 * application state and restore previously saved sessions. Provides a clean
 * interface with theme support and proper accessibility features.
 * 
 * @param {SessionManagerProps} props - Component props
 * @returns {JSX.Element} Rendered session management interface
 */
const SessionManager: React.FC<SessionManagerProps> = ({
  exportSession,
  importSession,
  theme = 'light',
}) => {
  /**
   * Handle file import selection
   * 
   * Processes file selection from the import input, validates the file,
   * and triggers the import callback. Resets the input value to allow
   * importing the same file multiple times if needed.
   * 
   * @param {React.ChangeEvent<HTMLInputElement>} e - File input change event
   */
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importSession(file);        // Process the imported file
      e.target.value = '';        // Reset input for potential re-import
    }
  };

  return (
    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} shadow-sm border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
      {/* Section Header */}
      <h2 className={`font-semibold text-lg mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
        Session Management
      </h2>
      
      {/* Session Control Buttons */}
      <div className="space-y-3">
        {/* Export Session Button */}
        <button
          onClick={exportSession}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
            theme === 'dark' 
              ? 'bg-green-600 hover:bg-green-500 text-white' 
              : 'bg-green-500 hover:bg-green-600 text-white'
          } shadow-sm`}
          aria-label="Export current session to JSON file"
          title="Download your current session configuration"
        >
          <span role="img" aria-label="Export icon">📤</span>
          <span>Export Session</span>
        </button>

        {/* Import Session File Input */}
        <label
          className={`w-full py-3 px-4 rounded-lg font-medium cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 ${
            theme === 'dark' 
              ? 'bg-blue-600 hover:bg-blue-500 text-white' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          } shadow-sm`}
          title="Import a previously saved session configuration"
        >
          <span role="img" aria-label="Import icon">📥</span>
          <span>Import Session</span>
          
          {/* Hidden file input for session import */}
          <input
            type="file"
            accept=".json"                    // Only accept JSON files
            className="hidden"                // Hidden but accessible via label
            onChange={handleFileImport}
            aria-label="Choose session file to import"
          />
        </label>
      </div>
    </div>
  );
};

export default SessionManager;

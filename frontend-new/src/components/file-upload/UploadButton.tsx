/**
 * Upload Button Component - File Upload Action Interface
 * 
 * This component provides a sophisticated upload button with visual feedback
 * for different upload states. It displays loading progress, success states,
 * and appropriate messaging based on the current upload status.
 * 
 * Features:
 * - Dynamic button states (disabled, ready, loading, success)
 * - Gradient styling with hover animations
 * - Loading spinner and progress bar integration
 * - Visual feedback for upload completion
 * - Accessibility support with proper ARIA attributes
 * - Responsive design with smooth transitions
 * 
 * The component serves as the primary action trigger for file uploads,
 * providing clear visual feedback throughout the upload process.
 */

'use client';

import React from 'react';
import { Check } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';

/**
 * Props interface for the UploadButton component
 * 
 * @interface UploadButtonProps
 * @property {File | null} selectedFile - Currently selected file for upload
 * @property {boolean} isUploaded - Whether upload has completed successfully
 * @property {boolean} isLoading - Whether upload is currently in progress
 * @property {number} progress - Upload progress percentage (0-100)
 * @property {Function} onUpload - Callback to trigger upload process
 */
interface UploadButtonProps {
  selectedFile: File | null;    // Selected file for upload
  isUploaded: boolean;          // Upload completion state
  isLoading: boolean;           // Upload in progress state
  progress: number;             // Upload progress percentage
  onUpload: () => void;         // Upload trigger callback
}

/**
 * UploadButton Component
 * 
 * Renders a dynamic upload button that changes appearance and behavior
 * based on the current upload state. Provides visual feedback through
 * colors, animations, and progress indicators.
 * 
 * @param {UploadButtonProps} props - Component props
 * @returns {JSX.Element} Rendered upload button with progress feedback
 */

const UploadButton: React.FC<UploadButtonProps> = ({
  selectedFile,
  isUploaded,
  isLoading,
  progress,
  onUpload,
}) => {
  /**
   * Get button styling classes based on current state
   * 
   * Returns appropriate CSS classes for the button based on the current
   * upload state, including disabled states, loading states, and success states.
   * 
   * @returns {string} CSS classes for the button
   */
  const getButtonClasses = () => {
    let baseClasses = `w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 shadow-lg `;
    
    if (selectedFile && !isUploaded && !isLoading) {
      // Ready to upload state - active button with gradient
      baseClasses += 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:shadow-xl transform hover:scale-105';
    } else if (isUploaded) {
      // Upload completed state - green success button
      baseClasses += 'bg-green-500 cursor-not-allowed';
    } else {
      // Disabled state - gray button
      baseClasses += 'bg-gray-300 cursor-not-allowed';
    }
    
    if (isLoading) {
      baseClasses += ' cursor-not-allowed opacity-70';
    }
    
    return baseClasses;
  };

  /**
   * Get button content based on current state
   * 
   * Returns appropriate button content (text, icons, spinner) based on
   * the current upload state and file selection.
   * 
   * @returns {JSX.Element} Button content
   */
  const getButtonContent = () => {
    if (isLoading) {
      // Loading state - show spinner and processing message
      return (
        <div className="flex items-center justify-center space-x-2">
          <LoadingSpinner size={20} />
          <span>Processing...</span>
        </div>
      );
    } else if (isUploaded) {
      // Success state - show checkmark and success message
      return (
        <div className="flex items-center justify-center">
          <Check size={20} className="mr-2" aria-hidden="true" />
          <span>Uploaded Successfully!</span>
        </div>
      );
    } else if (selectedFile) {
      // Ready state - show upload action
      return 'Upload File';
    } else {
      // No file selected - show instruction
      return 'Select a file first';
    }
  };

  /**
   * Get appropriate ARIA label for accessibility
   * 
   * Returns descriptive ARIA label based on current state for
   * screen readers and accessibility tools.
   * 
   * @returns {string} ARIA label text
   */
  const getAriaLabel = () => {
    if (isLoading) {
      return `Uploading file: ${progress}% complete`;
    } else if (isUploaded) {
      return 'File uploaded successfully';
    } else if (selectedFile) {
      return `Upload selected file: ${selectedFile.name}`;
    } else {
      return 'No file selected for upload';
    }
  };

  return (
    <div>
      {/* Main Upload Button */}
      <button
        onClick={onUpload}
        disabled={!selectedFile || isUploaded || isLoading}
        className={getButtonClasses()}
        aria-label={getAriaLabel()}
        title={getAriaLabel()}
      >
        {getButtonContent()}
      </button>

      {/* Progress Bar */}
      {isLoading && (
        <div className="mt-4 h-2 w-full rounded-full bg-gray-300 overflow-hidden" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div
            className="h-full bg-blue-600 transition-all duration-150"
            style={{ width: `${progress}%` }}
            aria-label={`Upload progress: ${progress}%`}
          />
        </div>
      )}
      
      {/* Progress Text */}
      {isLoading && (
        <div className="mt-2 text-center">
          <span className="text-sm text-gray-600">{progress}% uploaded</span>
        </div>
      )}
    </div>
  );
};

export default UploadButton;

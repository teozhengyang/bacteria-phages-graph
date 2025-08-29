/**
 * Drop Zone Component - Interactive File Drop Area
 * 
 * This component provides a sophisticated drag-and-drop interface for file uploads
 * with visual feedback, file validation, and multiple interaction states. It serves
 * as the primary file selection interface with support for both drag-and-drop and
 * click-to-browse functionality.
 * 
 * Features:
 * - Drag-and-drop file upload with visual feedback
 * - Click-to-browse file selection
 * - Real-time visual state changes (drag over, selected, uploading)
 * - File information display with size formatting
 * - File removal functionality
 * - Loading and success states
 * - Responsive design with smooth animations
 * - Accessibility support with proper ARIA attributes
 * 
 * The component provides rich visual feedback through color changes, animations,
 * and state-specific messaging to guide users through the upload process.
 */

'use client';

import React from 'react';
import { Upload, File, Check } from 'lucide-react';
import { formatFileSize } from '../../utils/fileUtils';

/**
 * Props interface for the DropZone component
 * 
 * @interface DropZoneProps
 * @property {File | null} selectedFile - Currently selected file or null if none
 * @property {boolean} isDragOver - Whether user is currently dragging over the zone
 * @property {boolean} isLoading - Whether file upload is in progress
 * @property {boolean} isUploaded - Whether file has been successfully uploaded
 * @property {Function} onDrop - Handler for file drop events
 * @property {Function} onDragOver - Handler for drag over events
 * @property {Function} onDragLeave - Handler for drag leave events
 * @property {Function} onClick - Handler for click events (browse files)
 * @property {Function} onFileSelect - Handler for file selection/deselection
 */
interface DropZoneProps {
  selectedFile: File | null;                                  // Currently selected file
  isDragOver: boolean;                                        // Drag over state for visual feedback
  isLoading: boolean;                                         // Upload in progress state
  isUploaded: boolean;                                        // Upload completion state
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;      // File drop event handler
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;  // Drag over event handler
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void; // Drag leave event handler
  onClick: () => void;                                        // Click to browse handler
  onFileSelect: (file: File | null) => void;                 // File selection handler
}

/**
 * DropZone Component
 * 
 * Renders an interactive file drop zone with visual feedback for different states.
 * Supports both drag-and-drop and click-to-browse file selection with comprehensive
 * visual feedback and file management capabilities.
 * 
 * @param {DropZoneProps} props - Component props
 * @returns {JSX.Element} Rendered drop zone interface
 */

const DropZone: React.FC<DropZoneProps> = ({
  selectedFile,
  isDragOver,
  isLoading,
  isUploaded,
  onDrop,
  onDragOver,
  onDragLeave,
  onClick,
  onFileSelect,
}) => {
  /**
   * Handle file removal
   * 
   * Removes the currently selected file by calling the file selection
   * handler with null. Prevents event propagation to avoid triggering
   * the file browser.
   * 
   * @param {React.MouseEvent} e - Click event from remove button
   */
  const handleFileRemoval = (e: React.MouseEvent) => {
    e.stopPropagation();  // Prevent triggering file browser
    onFileSelect(null);   // Clear selected file
  };

  /**
   * Get dynamic styling classes based on current state
   * 
   * Returns appropriate CSS classes for the drop zone based on
   * the current interaction state (drag over, file selected, loading).
   * 
   * @returns {string} CSS classes for the drop zone
   */
  const getDropZoneClasses = () => {
    let classes = `relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 mb-6 select-none `;
    
    if (isDragOver) {
      classes += 'border-blue-500 bg-blue-50 scale-105';
    } else if (selectedFile) {
      classes += 'border-green-500 bg-green-50';
    } else {
      classes += 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50';
    }
    
    if (isLoading) {
      classes += ' cursor-not-allowed opacity-60';
    }
    
    return classes;
  };

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={onClick}
      className={getDropZoneClasses()}
      role="button"
      tabIndex={0}
      aria-label={selectedFile ? `Selected file: ${selectedFile.name}` : "Click to select file or drag and drop"}
    >
      {/* File Selected State */}
      {selectedFile ? (
        <div className="space-y-3">
          {/* File Icon */}
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl">
            <File className="w-6 h-6 text-green-600" aria-hidden="true" />
          </div>
          
          {/* File Information */}
          <div>
            <p className="font-semibold text-gray-800 truncate" title={selectedFile.name}>
              {selectedFile.name}
            </p>
            <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
          </div>
          
          {/* Success Indicator */}
          <div className="flex items-center justify-center text-green-600">
            <Check size={16} className="mr-1" aria-hidden="true" />
            <span className="text-sm font-medium">File ready to upload</span>
          </div>
        </div>
      ) : (
        /* Empty State - No File Selected */
        <div className="space-y-3">
          {/* Upload Icon */}
          <div
            className={`inline-flex items-center justify-center w-12 h-12 rounded-xl transition-colors ${
              isDragOver ? 'bg-blue-100' : 'bg-gray-100'
            }`}
          >
            <Upload 
              className={`w-6 h-6 ${isDragOver ? 'text-blue-600' : 'text-gray-500'}`} 
              aria-hidden="true"
            />
          </div>
          
          {/* Instructions */}
          <div>
            <p className="font-medium text-gray-700">
              {isDragOver ? 'Drop your file here' : 'Choose Excel file'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Supports .xlsx and .xls files</p>
          </div>
        </div>
      )}

      {/* Drag Over Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 bg-blue-500/10 rounded-2xl flex items-center justify-center pointer-events-none">
          <div className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium">
            Drop to upload
          </div>
        </div>
      )}

      {/* File Information Panel */}
      {selectedFile && !isUploaded && !isLoading && (
        <div className="mt-4 p-4 bg-blue-50 rounded-xl">
          <div className="flex items-start space-x-3">
            {/* File Icon */}
            <File className="w-5 h-5 text-blue-600 mt-0.5" aria-hidden="true" />
            
            {/* File Details */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-blue-900 truncate" title={selectedFile.name}>
                {selectedFile.name}
              </p>
              <p className="text-xs text-blue-600">
                {formatFileSize(selectedFile.size)} • Excel file
              </p>
            </div>
            
            {/* Remove Button */}
            <button
              onClick={handleFileRemoval}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded"
              aria-label={`Remove file ${selectedFile.name}`}
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DropZone;

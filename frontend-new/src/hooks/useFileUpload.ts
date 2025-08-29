/**
 * File Upload Hook - Manages File Upload State and Interactions
 * 
 * This custom hook encapsulates all the logic for file upload functionality
 * including drag-and-drop interactions, file validation, upload progress
 * simulation, and state management. It provides a clean interface for
 * components to handle file uploads without managing complex state logic.
 * 
 * Features:
 * - File selection via click or drag-and-drop
 * - File validation for Excel formats
 * - Upload progress simulation with visual feedback
 * - Drag state management for visual cues
 * - File input reset functionality
 * - Loading and success state management
 */

import { useState, useRef } from 'react';
import { isValidExcelFile } from '../utils/fileUtils';

/**
 * Custom hook for managing file upload state and interactions
 * 
 * Provides comprehensive file upload functionality with state management
 * for various upload scenarios including drag-and-drop, validation,
 * progress tracking, and completion handling.
 * 
 * @returns {Object} File upload state and handler functions
 */
export function useFileUpload() {
  // Core file upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);  // Currently selected file
  const [isDragOver, setIsDragOver] = useState<boolean>(false);         // Drag-over state for UI feedback
  const [isUploaded, setIsUploaded] = useState<boolean>(false);         // Upload completion state
  const [isLoading, setIsLoading] = useState<boolean>(false);           // Upload in progress state
  const [progress, setProgress] = useState<number>(0);                  // Upload progress percentage
  
  // Ref to the hidden file input element for programmatic access
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Reset the file input element value
   * 
   * Clears the file input to allow selecting the same file again
   * if needed. This is important for user experience when testing
   * or re-uploading the same file.
   */
  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Handle file selection from various sources
   * 
   * Validates the selected file and updates state accordingly.
   * This function is used for both drag-and-drop and click-to-browse
   * file selection methods.
   * 
   * @param {File | null} file - The file to be selected and validated
   */
  const handleFileSelect = (file: File | null) => {
    // Validate file exists and is a valid Excel format
    if (file && isValidExcelFile(file)) {
      setSelectedFile(file);
      setIsUploaded(false);     // Reset uploaded state for new file
      resetFileInput();         // Clear input for potential re-selection
    }
    // Note: Invalid files are silently ignored - could add error handling here
  };

  /**
   * Handle drag-and-drop file drop events
   * 
   * Processes the dropped file and delegates to the standard file
   * selection handler. Prevents default browser behavior and
   * resets drag state.
   * 
   * @param {React.DragEvent} e - The drag event containing file data
   */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();                    // Prevent default browser file handling
    setIsDragOver(false);                  // Reset drag state
    const file = e.dataTransfer.files[0];  // Get the first dropped file
    handleFileSelect(file);                // Process the file through standard selection
  };

  /**
   * Handle drag-over events for visual feedback
   * 
   * Provides visual feedback when user drags a file over the drop zone.
   * Prevents default browser behavior and sets drag state for styling.
   * 
   * @param {React.DragEvent} e - The drag over event
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();     // Prevent default to allow drop
    setIsDragOver(true);    // Set drag state for visual feedback
  };

  /**
   * Handle drag-leave events to reset visual feedback
   * 
   * Resets the drag-over state when user drags away from the drop zone.
   * This ensures proper visual feedback during drag interactions.
   * 
   * @param {React.DragEvent} e - The drag leave event
   */
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);   // Reset drag state
  };

  /**
   * Handle the actual file upload process
   * 
   * Simulates file upload with progress indication and calls the provided
   * callback when complete. This includes visual feedback through loading
   * states and progress updates.
   * 
   * @param {Function} onFile - Callback function to call when upload completes
   */
  const handleUpload = (onFile: (file: File) => void) => {
    if (!selectedFile) return; // Early return if no file selected

    // Initialize upload state
    setIsLoading(true);
    setProgress(0);

    /**
     * Simulate upload progress with timed intervals
     * 
     * Creates a realistic upload experience with progress updates.
     * In a real application, this would be replaced with actual
     * upload progress tracking from the file processing operation.
     */
    const interval = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 100) {
          // Upload complete - cleanup and trigger callbacks
          clearInterval(interval);
          setIsLoading(false);
          setIsUploaded(true);
          
          // Call the provided callback with the selected file
          onFile(selectedFile);
          
          // Auto-reset upload success state after 2 seconds
          setTimeout(() => setIsUploaded(false), 2000);
          
          return 100;
        }
        
        // Increment progress by 10% every interval
        return oldProgress + 10;
      });
    }, 150); // Update every 150ms for smooth progress animation
  };

  // Return all state and handler functions for use by components
  return {
    // State values
    selectedFile,       // Currently selected file
    isDragOver,         // Whether user is dragging over drop zone
    isUploaded,         // Whether upload completed successfully
    isLoading,          // Whether upload is in progress
    progress,           // Upload progress percentage (0-100)
    fileInputRef,       // Ref to hidden file input element
    
    // Handler functions
    handleFileSelect,   // Function to handle file selection
    handleDrop,         // Function to handle drag-and-drop
    handleDragOver,     // Function to handle drag-over events
    handleDragLeave,    // Function to handle drag-leave events
    handleUpload,       // Function to trigger upload process
    resetFileInput,     // Function to reset file input value
  };
}

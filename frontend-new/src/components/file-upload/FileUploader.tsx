/**
 * FileUploader Component - Initial File Upload Interface
 * 
 * This component provides the main file upload interface shown when users
 * first visit the application or need to upload a new Excel file. It features
 * a modern, interactive design with drag-and-drop functionality, progress
 * indication, and theme support.
 * 
 * Key Features:
 * - Drag and drop file upload
 * - Click to browse file selection
 * - Upload progress indication
 * - Theme-aware styling with animated backgrounds
 * - File validation for Excel formats
 * - Responsive design
 * 
 * The component uses a custom hook (useFileUpload) to manage upload state
 * and integrates with various sub-components for a modular architecture.
 */

'use client';

import React from 'react';
import { Upload } from 'lucide-react';
import { FileUploaderProps } from '../../types';
import { useFileUpload } from '../../hooks/useFileUpload';
import ThemeToggle from '../ui/ThemeToggle';
import DropZone from './DropZone';
import UploadButton from './UploadButton';

/**
 * FileUploader - Main file upload interface component
 * 
 * Renders a visually appealing upload interface with gradient backgrounds,
 * animated elements, and comprehensive upload functionality. Handles both
 * drag-and-drop and traditional file selection methods.
 * 
 * @param {FileUploaderProps} props - Component props
 * @param {Function} props.onFile - Callback triggered when file is successfully uploaded
 * @param {string} props.theme - Current theme ('light' or 'dark')
 * @param {Function} props.toggleTheme - Function to switch themes
 * @returns {JSX.Element} The complete file upload interface
 */
const FileUploader: React.FC<FileUploaderProps> = ({ onFile, theme, toggleTheme }) => {
  /**
   * File upload state management
   * 
   * Custom hook that handles all upload-related state including:
   * - File selection and validation
   * - Drag and drop interactions
   * - Upload progress tracking
   * - Loading states and error handling
   */
  const {
    selectedFile,     // Currently selected file
    isDragOver,       // Whether user is dragging a file over the drop zone
    isUploaded,       // Whether file has been successfully uploaded
    isLoading,        // Whether upload is in progress
    progress,         // Upload progress percentage
    fileInputRef,     // Ref to hidden file input element
    handleFileSelect, // Function to handle file selection
    handleDrop,       // Function to handle drag and drop
    handleDragOver,   // Function to handle drag over events
    handleDragLeave,  // Function to handle drag leave events
    handleUpload,     // Function to trigger file upload
  } = useFileUpload();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 transition-all duration-500 relative"
      style={{
        // Dynamic gradient background based on theme
        background:
          theme === 'light'
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' // Light theme: blue to purple
            : 'linear-gradient(135deg, #232526 0%, #414345 100%)', // Dark theme: dark grays
      }}
    >
      {/* Animated Background Elements */}
      {/* These create subtle floating animations for visual appeal */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute -bottom-8 -right-8 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1s' }} // Offset animation for variety
        ></div>
      </div>

      {/* Theme Toggle Button */}
      {/* Positioned in top-right corner for easy access */}
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} isLoading={isLoading} />
      </div>

      {/* Main Upload Card */}
      {/* Central upload interface with glassmorphism effect */}
      <div
        className="relative z-10 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/20"
        style={{ 
          // Disable interactions during upload process
          pointerEvents: isLoading ? 'none' : 'auto', 
          opacity: isLoading ? 0.7 : 1 
        }}
      >
        {/* Header Section */}
        {/* Title, icon, and description */}
        <div className="text-center mb-8">
          {/* Upload Icon with gradient background */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <Upload className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Upload Excel File</h1>
          <p className="text-gray-600 text-sm">Drag and drop your file or click to browse</p>
        </div>

        {/* Drop Zone Component */}
        {/* Handles the visual drop area and file selection interactions */}
        <DropZone
          selectedFile={selectedFile}
          isDragOver={isDragOver}
          isLoading={isLoading}
          isUploaded={isUploaded}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !isLoading && fileInputRef.current?.click()} // Trigger file picker
          onFileSelect={handleFileSelect}
        />

        {/* Hidden File Input */}
        {/* Standard HTML file input for traditional file selection */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"                                    // Only accept Excel files
          onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
          className="hidden"                                     // Hidden, triggered by drop zone click
          disabled={isLoading}                                   // Disable during upload
        />

        {/* Upload Button Component */}
        {/* Handles the actual upload trigger and progress display */}
        <UploadButton
          selectedFile={selectedFile}
          isUploaded={isUploaded}
          isLoading={isLoading}
          progress={progress}
          onUpload={() => handleUpload(onFile)} // Pass the main onFile callback
        />
      </div>

      {/* Footer Information */}
      {/* Privacy and security information */}
      <p className="text-white/70 text-sm mt-6 text-center max-w-md">
        Upload your Excel spreadsheets securely. Files are processed locally and never stored on
        our servers.
      </p>
    </div>
  );
};

export default FileUploader;

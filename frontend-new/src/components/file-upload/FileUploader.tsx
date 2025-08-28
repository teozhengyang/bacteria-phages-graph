'use client';

import React from 'react';
import { Upload } from 'lucide-react';
import { FileUploaderProps } from '../../types';
import { useFileUpload } from '../../hooks/useFileUpload';
import ThemeToggle from '../ui/ThemeToggle';
import DropZone from './DropZone';
import UploadButton from './UploadButton';

const FileUploader: React.FC<FileUploaderProps> = ({ onFile, theme, toggleTheme }) => {
  const {
    selectedFile,
    isDragOver,
    isUploaded,
    isLoading,
    progress,
    fileInputRef,
    handleFileSelect,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleUpload,
  } = useFileUpload();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 transition-all duration-500 relative"
      style={{
        background:
          theme === 'light'
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            : 'linear-gradient(135deg, #232526 0%, #414345 100%)',
      }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute -bottom-8 -right-8 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1s' }}
        ></div>
      </div>

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} isLoading={isLoading} />
      </div>

      {/* Main Upload Card */}
      <div
        className="relative z-10 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/20"
        style={{ pointerEvents: isLoading ? 'none' : 'auto', opacity: isLoading ? 0.7 : 1 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <Upload className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Upload Excel File</h1>
          <p className="text-gray-600 text-sm">Drag and drop your file or click to browse</p>
        </div>

        {/* Drop Zone */}
        <DropZone
          selectedFile={selectedFile}
          isDragOver={isDragOver}
          isLoading={isLoading}
          isUploaded={isUploaded}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !isLoading && fileInputRef.current?.click()}
          onFileSelect={handleFileSelect}
        />

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
          className="hidden"
          disabled={isLoading}
        />

        {/* Upload Button */}
        <UploadButton
          selectedFile={selectedFile}
          isUploaded={isUploaded}
          isLoading={isLoading}
          progress={progress}
          onUpload={() => handleUpload(onFile)}
        />
      </div>

      {/* Footer */}
      <p className="text-white/70 text-sm mt-6 text-center max-w-md">
        Upload your Excel spreadsheets securely. Files are processed locally and never stored on
        our servers.
      </p>
    </div>
  );
};

export default FileUploader;

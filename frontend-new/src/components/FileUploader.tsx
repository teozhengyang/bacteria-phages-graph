'use client';

import React from 'react';
import { Upload, File, Check, Moon, Sun } from 'lucide-react';
import { FileUploaderProps } from '../types';
import { useFileUpload } from '../hooks/useFileUpload';
import { formatFileSize } from '../utils/fileUtils';

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
        <button
          onClick={toggleTheme}
          disabled={isLoading}
          className="bg-white/20 backdrop-blur-md rounded-full p-3 text-white hover:bg-white/30 transition-all duration-300 hover:scale-110 shadow-lg border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
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
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !isLoading && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 mb-6 select-none
            ${
              isDragOver
                ? 'border-blue-500 bg-blue-50 scale-105'
                : selectedFile
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
            }
            ${isLoading ? 'cursor-not-allowed opacity-60' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
            className="hidden"
            disabled={isLoading}
          />

          {selectedFile ? (
            <div className="space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl">
                <File className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 truncate">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
              </div>
              <div className="flex items-center justify-center text-green-600">
                <Check size={16} className="mr-1" />
                <span className="text-sm font-medium">File ready to upload</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div
                className={`inline-flex items-center justify-center w-12 h-12 rounded-xl transition-colors ${
                  isDragOver ? 'bg-blue-100' : 'bg-gray-100'
                }`}
              >
                <Upload className={`w-6 h-6 ${isDragOver ? 'text-blue-600' : 'text-gray-500'}`} />
              </div>
              <div>
                <p className="font-medium text-gray-700">
                  {isDragOver ? 'Drop your file here' : 'Choose Excel file'}
                </p>
                <p className="text-xs text-gray-500 mt-1">Supports .xlsx and .xls files</p>
              </div>
            </div>
          )}

          {isDragOver && (
            <div className="absolute inset-0 bg-blue-500/10 rounded-2xl flex items-center justify-center pointer-events-none">
              <div className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium">Drop to upload</div>
            </div>
          )}
        </div>

        {/* Upload Button */}
        <button
          onClick={() => handleUpload(onFile)}
          disabled={!selectedFile || isUploaded || isLoading}
          className={`
            w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 shadow-lg
            ${
              selectedFile && !isUploaded && !isLoading
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:shadow-xl transform hover:scale-105'
                : isUploaded
                ? 'bg-green-500 cursor-not-allowed'
                : 'bg-gray-300 cursor-not-allowed'
            }
            ${isLoading ? 'cursor-not-allowed opacity-70' : ''}
          `}
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
              <span>Processing...</span>
            </div>
          ) : isUploaded ? (
            <div className="flex items-center justify-center">
              <Check size={20} className="mr-2" />
              Uploaded Successfully!
            </div>
          ) : selectedFile ? (
            'Upload File'
          ) : (
            'Select a file first'
          )}
        </button>

        {/* Progress Bar */}
        {isLoading && (
          <div className="mt-4 h-2 w-full rounded-full bg-gray-300 overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-150"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}

        {/* File Info */}
        {selectedFile && !isUploaded && !isLoading && (
          <div className="mt-4 p-4 bg-blue-50 rounded-xl">
            <div className="flex items-start space-x-3">
              <File className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-blue-900 truncate">{selectedFile.name}</p>
                <p className="text-xs text-blue-600">
                  {formatFileSize(selectedFile.size)} • Excel file
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFileSelect(null);
                }}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Remove
              </button>
            </div>
          </div>
        )}
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

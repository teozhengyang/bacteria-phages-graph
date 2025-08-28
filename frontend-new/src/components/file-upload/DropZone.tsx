'use client';

import React from 'react';
import { Upload, File, Check } from 'lucide-react';
import { formatFileSize } from '../../utils/fileUtils';

interface DropZoneProps {
  selectedFile: File | null;
  isDragOver: boolean;
  isLoading: boolean;
  isUploaded: boolean;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onClick: () => void;
  onFileSelect: (file: File | null) => void;
}

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
  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={onClick}
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

      {/* File Info Section */}
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
                onFileSelect(null);
              }}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
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

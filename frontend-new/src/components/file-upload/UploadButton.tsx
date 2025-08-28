'use client';

import React from 'react';
import { Check } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';

interface UploadButtonProps {
  selectedFile: File | null;
  isUploaded: boolean;
  isLoading: boolean;
  progress: number;
  onUpload: () => void;
}

const UploadButton: React.FC<UploadButtonProps> = ({
  selectedFile,
  isUploaded,
  isLoading,
  progress,
  onUpload,
}) => {
  return (
    <div>
      <button
        onClick={onUpload}
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
            <LoadingSpinner size={20} />
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
    </div>
  );
};

export default UploadButton;

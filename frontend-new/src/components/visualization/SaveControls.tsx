'use client';

import React from 'react';

interface SaveControlsProps {
  onSave: () => void;
  theme?: 'light' | 'dark';
}

const SaveControls: React.FC<SaveControlsProps> = ({ onSave, theme = 'light' }) => {
  return (
    <div className={`absolute top-4 left-4 z-10`}>
      <button
        onClick={onSave}
        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 backdrop-blur-md border shadow-sm ${
          theme === 'dark' 
            ? 'bg-gray-800/90 hover:bg-gray-700/90 text-white border-gray-600' 
            : 'bg-white/90 hover:bg-gray-50/90 text-gray-700 border-gray-300'
        }`}
      >
        📥 Save as PNG
      </button>
    </div>
  );
};

export default SaveControls;

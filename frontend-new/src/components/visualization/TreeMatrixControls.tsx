'use client';

import React from 'react';

interface TreeMatrixControlsProps {
  onSave: () => void;
  theme?: 'light' | 'dark';
}

const TreeMatrixControls: React.FC<TreeMatrixControlsProps> = ({
  onSave,
  theme = 'light',
}) => {
  return (
    <div className="absolute top-4 left-4 z-10">
      <button
        onClick={onSave}
        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 backdrop-blur-md ${
          theme === 'dark'
            ? 'bg-gray-800/80 hover:bg-gray-700/80 text-white border border-gray-600'
            : 'bg-white/80 hover:bg-gray-50/80 text-gray-700 border border-gray-300'
        } shadow-sm`}
        title="Save as PNG"
      >
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
          Save PNG
        </span>
      </button>
    </div>
  );
};

export default TreeMatrixControls;

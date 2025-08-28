'use client';

import React from 'react';

interface SaveControlsProps {
  onSave: () => void;
}

const SaveControls: React.FC<SaveControlsProps> = ({ onSave }) => {
  return (
    <div className="flex gap-2 mt-2 ml-2">
      <button
        onClick={onSave}
        className="px-4 py-1 rounded bg-green-600 hover:bg-green-700 text-white"
      >
        Save as PNG
      </button>
    </div>
  );
};

export default SaveControls;

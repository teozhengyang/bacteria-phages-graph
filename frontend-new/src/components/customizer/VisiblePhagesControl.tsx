'use client';

import React from 'react';

interface VisiblePhagesControlProps {
  headers: string[];
  visiblePhages: string[];
  setVisiblePhages: React.Dispatch<React.SetStateAction<string[]>>;
  theme?: 'light' | 'dark';
}

const VisiblePhagesControl: React.FC<VisiblePhagesControlProps> = ({
  headers,
  visiblePhages,
  setVisiblePhages,
  theme = 'light',
}) => {
  const togglePhage = (phage: string) => {
    if (visiblePhages.includes(phage)) {
      setVisiblePhages(prev => prev.filter(p => p !== phage));
    } else {
      setVisiblePhages(prev => [...prev, phage]);
    }
  };

  return (
    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} shadow-sm border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
      <h2 className={`font-semibold text-lg mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
        Visible Phages
      </h2>
      <div className="max-h-44 overflow-y-auto space-y-2">
        {headers.map(phage => (
          <label
            key={`phage-${phage}`}
            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer select-none transition-all duration-200 ${
              visiblePhages.includes(phage)
                ? theme === 'dark'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-50 text-blue-900 border border-blue-200'
                : theme === 'dark'
                  ? 'hover:bg-gray-600 text-gray-200'
                  : 'hover:bg-gray-50 text-gray-700'
            }`}
            title={`Toggle visibility of phage ${phage}`}
          >
            <input
              type="checkbox"
              className="w-4 h-4 rounded"
              checked={visiblePhages.includes(phage)}
              onChange={() => togglePhage(phage)}
              aria-label={`Toggle phage ${phage}`}
            />
            <span className="text-sm">{phage}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default VisiblePhagesControl;

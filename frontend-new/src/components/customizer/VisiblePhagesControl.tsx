'use client';

import React from 'react';

interface VisiblePhagesControlProps {
  headers: string[];
  visiblePhages: string[];
  setVisiblePhages: React.Dispatch<React.SetStateAction<string[]>>;
}

const VisiblePhagesControl: React.FC<VisiblePhagesControlProps> = ({
  headers,
  visiblePhages,
  setVisiblePhages,
}) => {
  const togglePhage = (phage: string) => {
    if (visiblePhages.includes(phage)) {
      setVisiblePhages(prev => prev.filter(p => p !== phage));
    } else {
      setVisiblePhages(prev => [...prev, phage]);
    }
  };

  return (
    <section className="mb-8 flex flex-col">
      <h2 className="font-semibold text-lg mb-3 border-b border-base-300 pb-1">Visible Phages</h2>
      <div className="max-h-44 overflow-y-auto border rounded p-2 bg-base-100 shadow-inner">
        {headers.map(phage => (
          <label
            key={`phage-${phage}`}
            className="flex items-center gap-3 mb-2 cursor-pointer select-none"
            title={`Toggle visibility of phage ${phage}`}
          >
            <input
              type="checkbox"
              className="checkbox"
              checked={visiblePhages.includes(phage)}
              onChange={() => togglePhage(phage)}
              aria-label={`Toggle phage ${phage}`}
            />
            <span>{phage}</span>
          </label>
        ))}
      </div>
    </section>
  );
};

export default VisiblePhagesControl;

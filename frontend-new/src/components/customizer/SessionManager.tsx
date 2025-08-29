'use client';

import React from 'react';

interface SessionManagerProps {
  exportSession: () => void;
  importSession: (file: File) => void;
  theme?: 'light' | 'dark';
}

const SessionManager: React.FC<SessionManagerProps> = ({
  exportSession,
  importSession,
  theme = 'light',
}) => {
  return (
    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} shadow-sm border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
      <h2 className={`font-semibold text-lg mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
        Session Management
      </h2>
      <div className="space-y-3">
        <button
          onClick={exportSession}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
            theme === 'dark' 
              ? 'bg-green-600 hover:bg-green-500 text-white' 
              : 'bg-green-500 hover:bg-green-600 text-white'
          } shadow-sm`}
          aria-label="Export session"
        >
          <span>📤</span>
          <span>Export Session</span>
        </button>

        <label
          className={`w-full py-3 px-4 rounded-lg font-medium cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 ${
            theme === 'dark' 
              ? 'bg-blue-600 hover:bg-blue-500 text-white' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          } shadow-sm`}
          title="Import session"
        >
          <span>📥</span>
          <span>Import Session</span>
          <input
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                importSession(file);
                e.target.value = '';
              }
            }}
          />
        </label>
      </div>
    </div>
  );
};

export default SessionManager;

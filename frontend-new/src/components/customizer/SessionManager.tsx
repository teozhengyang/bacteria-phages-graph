'use client';

import React from 'react';

interface SessionManagerProps {
  exportSession: () => void;
  importSession: (file: File) => void;
}

const SessionManager: React.FC<SessionManagerProps> = ({
  exportSession,
  importSession,
}) => {
  return (
    <section className="mb-4 flex flex-col gap-3">
      <h2 className="font-semibold text-lg border-b border-base-300 pb-1">Session Management</h2>
      <button
        onClick={exportSession}
        className="btn btn-sm btn-success w-full text-base hover:brightness-110 transition"
        aria-label="Export session"
      >
        📤 Export Session
      </button>

      <label
        className="btn btn-sm btn-info w-full text-base cursor-pointer hover:brightness-110 transition"
        title="Import session"
      >
        📥 Import Session
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
    </section>
  );
};

export default SessionManager;

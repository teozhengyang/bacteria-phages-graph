import React, { useState } from 'react';

const FileUploader = ({ onFile, theme, toggleTheme }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-base-100 text-base-content space-y-4 relative">
      {/* 🌗 Theme Toggle Button */}
      <div className="absolute top-4 right-4">
        <button className="btn btn-sm btn-outline" onClick={toggleTheme}>
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </div>

      <div className="p-6 rounded-lg space-y-4">
        <h1 className="text-lg font-bold">Upload Excel File</h1>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) => setSelectedFile(e.target.files[0])}
          className="file-input"
        />
        <button
          onClick={() => onFile(selectedFile)}
          disabled={!selectedFile}
          className={`btn btn-primary ${!selectedFile ? 'btn-disabled' : ''}`}
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

export default FileUploader;

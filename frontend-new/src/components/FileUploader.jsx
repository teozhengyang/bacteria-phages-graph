import React, { useState } from 'react';

const FileUploader = ({ onFile }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-base-100 space-y-4">
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
          className={`btn btn-primary ${!selectedFile ? "btn-disabled" : ""}`}
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

export default FileUploader;

import { useState, useRef } from 'react';
import { isValidExcelFile } from '../utils/fileUtils';

export function useFileUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [isUploaded, setIsUploaded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = (file: File | null) => {
    if (file && isValidExcelFile(file)) {
      setSelectedFile(file);
      setIsUploaded(false);
      resetFileInput();
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleUpload = (onFile: (file: File) => void) => {
    if (selectedFile) {
      setIsLoading(true);
      setProgress(0);

      // Simulate loading progress
      const interval = setInterval(() => {
        setProgress((oldProgress) => {
          if (oldProgress >= 100) {
            clearInterval(interval);
            setIsLoading(false);
            setIsUploaded(true);
            onFile(selectedFile);
            setTimeout(() => setIsUploaded(false), 2000);
            return 100;
          }
          return oldProgress + 10;
        });
      }, 150);
    }
  };

  return {
    selectedFile,
    isDragOver,
    isUploaded,
    isLoading,
    progress,
    fileInputRef,
    handleFileSelect,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleUpload,
    resetFileInput,
  };
}

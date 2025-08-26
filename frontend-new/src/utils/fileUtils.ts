import { ACCEPTED_FILE_TYPES, ACCEPTED_FILE_EXTENSIONS } from '../constants';

export function isValidExcelFile(file: File): boolean {
  const isValidType = ACCEPTED_FILE_TYPES.some(type => file.type === type);
  const isValidExtension = ACCEPTED_FILE_EXTENSIONS.some(ext => file.name.endsWith(ext));
  
  return isValidType || isValidExtension;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

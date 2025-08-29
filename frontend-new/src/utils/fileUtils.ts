/**
 * File Utilities - File Validation and Processing Functions
 * 
 * This module provides utility functions for file validation and processing,
 * specifically focused on Excel file handling and file size formatting.
 * These functions ensure data integrity and provide user-friendly feedback.
 * 
 * Functions included:
 * - Excel file validation by type and extension
 * - Human-readable file size formatting
 */

import { ACCEPTED_FILE_TYPES, ACCEPTED_FILE_EXTENSIONS } from '../constants';

/**
 * Validate if a file is a valid Excel file
 * 
 * This function checks both the MIME type and file extension to determine
 * if a file is a valid Excel format that can be processed by the application.
 * It provides robust validation by checking both properties to handle
 * cases where one might be missing or incorrect.
 * 
 * @param {File} file - The file object to validate
 * @returns {boolean} True if the file is a valid Excel format, false otherwise
 * 
 * @example
 * const file = new File([''], 'data.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
 * isValidExcelFile(file); // true
 * 
 * const textFile = new File([''], 'data.txt', { type: 'text/plain' });
 * isValidExcelFile(textFile); // false
 */
export function isValidExcelFile(file: File): boolean {
  // Check if the file's MIME type matches accepted Excel types
  const isValidType = ACCEPTED_FILE_TYPES.some(type => file.type === type);
  
  // Check if the file extension matches accepted Excel extensions
  const isValidExtension = ACCEPTED_FILE_EXTENSIONS.some(ext => file.name.endsWith(ext));
  
  // File is valid if either the type or extension matches (handles edge cases)
  return isValidType || isValidExtension;
}

/**
 * Format file size in human-readable format
 * 
 * This function converts a file size in bytes to a human-readable string
 * with appropriate units (Bytes, KB, MB, GB). It provides proper rounding
 * and formatting for display in user interfaces.
 * 
 * @param {number} bytes - The file size in bytes
 * @returns {string} Formatted file size string with appropriate units
 * 
 * @example
 * formatFileSize(1024); // '1 KB'
 * formatFileSize(1536); // '1.5 KB'
 * formatFileSize(1048576); // '1 MB'
 * formatFileSize(0); // '0 Bytes'
 */
export function formatFileSize(bytes: number): string {
  // Handle zero bytes case
  if (bytes === 0) return '0 Bytes';
  
  // Define conversion factor and unit names
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  
  // Calculate the appropriate unit index
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  // Convert to the appropriate unit and format with 2 decimal places
  const convertedSize = bytes / Math.pow(k, i);
  const formattedSize = parseFloat(convertedSize.toFixed(2));
  
  return `${formattedSize} ${sizes[i]}`;
}

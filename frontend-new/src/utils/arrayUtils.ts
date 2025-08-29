/**
 * Array Utilities - Helper Functions for Array Manipulation
 * 
 * This module provides utility functions for common array operations and
 * file name processing. These functions are used throughout the application
 * for data manipulation and string processing tasks.
 * 
 * Functions included:
 * - Array item reordering with immutable operations
 * - File name processing for clean display
 */

/**
 * Move an item from one position to another in an array
 * 
 * This function performs an immutable array reordering operation, moving
 * an element from one index to another while maintaining the integrity
 * of the original array. It's commonly used for drag-and-drop reordering
 * in user interfaces.
 * 
 * @template T - The type of elements in the array
 * @param {T[]} array - The source array to reorder
 * @param {number} fromIndex - The current index of the item to move
 * @param {number} toIndex - The target index where the item should be placed
 * @returns {T[]} A new array with the item moved to the new position
 * 
 * @example
 * const items = ['a', 'b', 'c', 'd'];
 * const reordered = moveArrayItem(items, 1, 3); // ['a', 'c', 'd', 'b']
 */
export function moveArrayItem<T>(array: T[], fromIndex: number, toIndex: number): T[] {
  // Create a shallow copy to avoid mutating the original array
  const newArray = [...array];
  
  // Remove the item from its current position
  const item = newArray.splice(fromIndex, 1)[0];
  
  // Insert the item at the new position
  newArray.splice(toIndex, 0, item);
  
  return newArray;
}

/**
 * Extract file name without extension
 * 
 * This function removes the file extension from a file name, leaving only
 * the base name. It's useful for display purposes or when creating new
 * file names based on the original without the extension.
 * 
 * @param {string} fileName - The complete file name including extension
 * @returns {string} The file name without its extension
 * 
 * @example
 * getFileNameWithoutExtension('data.xlsx'); // 'data'
 * getFileNameWithoutExtension('report.backup.csv'); // 'report.backup'
 * getFileNameWithoutExtension('simple'); // 'simple' (no extension)
 */
export function getFileNameWithoutExtension(fileName: string): string {
  // Use regex to remove the last dot and everything after it
  // Pattern explanation: \. matches literal dot, [^/.]+ matches one or more non-dot/slash chars, $ matches end
  return fileName.replace(/\.[^/.]+$/, '');
}

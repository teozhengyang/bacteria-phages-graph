/**
 * Resizable Sidebar Hook
 * 
 * Provides functionality for a draggable sidebar that users can resize
 * by dragging a resize handle. Includes constraints for minimum and maximum
 * width to ensure usability.
 */

import { useState, useCallback } from 'react';
import { UI_CONSTANTS } from '../constants';

/**
 * Custom hook for managing resizable sidebar functionality
 * 
 * Handles:
 * - Sidebar width state management
 * - Mouse drag event handling for resize operation
 * - Width constraints (min/max bounds)
 * - Smooth resize interaction
 * 
 * @returns {Object} Sidebar width and resize control functions
 */
export function useResizableSidebar() {
  // Current width of the sidebar in pixels (as CSS string)
  const [sidebarWidth, setSidebarWidth] = useState<string>(`${UI_CONSTANTS.SIDEBAR_DEFAULT_WIDTH}px`);
  
  // Track whether user is currently dragging to resize
  const [resizing, setResizing] = useState<boolean>(false);

  /**
   * Initiate resize operation when user clicks on resize handle
   * 
   * @param {React.MouseEvent} e - Mouse event from resize handle click
   */
  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); // Prevent text selection during drag
    setResizing(true);  // Enable resize mode
  }, []);

  /**
   * End resize operation when user releases mouse button
   * Usually called on mouseup event
   */
  const stopResizing = useCallback(() => {
    setResizing(false); // Disable resize mode
  }, []);

  /**
   * Handle mouse movement during resize operation
   * Updates sidebar width based on mouse position with constraints
   * 
   * @param {MouseEvent} e - Mouse move event containing position data
   */
  const handleMouseMove = useCallback((e: MouseEvent) => {
    // Only process if currently in resize mode
    if (!resizing) return;
    
    // Calculate new width based on mouse X position
    // Apply min/max constraints to ensure usability
    const newWidth = Math.min(
      Math.max(e.clientX, UI_CONSTANTS.SIDEBAR_MIN_WIDTH),  // Enforce minimum width
      UI_CONSTANTS.SIDEBAR_MAX_WIDTH                        // Enforce maximum width
    );
    
    // Update sidebar width with new calculated value
    setSidebarWidth(`${newWidth}px`);
  }, [resizing]);

  return {
    sidebarWidth,    // Current sidebar width as CSS string
    resizing,        // Boolean indicating if resize is in progress
    startResizing,   // Function to start resize operation
    stopResizing,    // Function to end resize operation
    handleMouseMove, // Function to handle mouse movement during resize
  };
}

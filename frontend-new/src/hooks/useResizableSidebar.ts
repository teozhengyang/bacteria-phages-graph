import { useState, useCallback } from 'react';
import { UI_CONSTANTS } from '../constants';

export function useResizableSidebar() {
  const [sidebarWidth, setSidebarWidth] = useState<string>(`${UI_CONSTANTS.SIDEBAR_DEFAULT_WIDTH}px`);
  const [resizing, setResizing] = useState<boolean>(false);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setResizing(false);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!resizing) return;
    const newWidth = Math.min(
      Math.max(e.clientX, UI_CONSTANTS.SIDEBAR_MIN_WIDTH), 
      UI_CONSTANTS.SIDEBAR_MAX_WIDTH
    );
    setSidebarWidth(`${newWidth}px`);
  }, [resizing]);

  return {
    sidebarWidth,
    resizing,
    startResizing,
    stopResizing,
    handleMouseMove,
  };
}

/**
 * Main Application Page Component
 * 
 * This is the primary interface for the bacteria-phage visualization application.
 * It orchestrates the file upload flow and main application interface using
 * centralized state management through the app context.
 * 
 * Features:
 * - Context-based state management (no prop drilling)
 * - Dynamic component loading for better performance
 * - Responsive layout with resizable sidebar
 * - Theme-aware styling
 * - Proper error boundaries and loading states
 */

'use client';

import React, { JSX, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useTheme, useData } from '../context';
import { useResizableSidebar } from '../hooks/useResizableSidebar';
import { useBeforeUnload } from '../hooks/useBeforeUnload';

// Dynamically import components to prevent SSR hydration issues
// This ensures proper client-side rendering for complex interactive components
const FileUploader = dynamic(() => import('../components/file-upload'), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-screen">Loading...</div>
});

const TreeMatrix = dynamic(() => import('../components/visualization'), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-screen">Loading visualization...</div>
});

const CustomiserPanel = dynamic(() => import('../components/customizer'), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 w-full h-full"></div>
});

/**
 * Home Component - Main Application Entry Point
 * 
 * Manages the overall layout and coordinates between the file upload flow
 * and the main visualization interface. Uses context for state management
 * instead of prop drilling.
 * 
 * @returns {JSX.Element} The main application interface
 */
export default function Home(): JSX.Element {
  // Get theme from theme context
  const { theme } = useTheme();
  
  // Get data state and actions from data context
  const {
    data,
    showSidebar,
    hasUnsavedChanges,
    visibleClusters,
    visiblePhages,
    clusterBacteriaOrder,
    clusterChildrenOrder,
    setShowSidebar,
    buildTreeData,
  } = useData();
  
  // Resizable sidebar functionality
  const {
    sidebarWidth,
    startResizing,
    stopResizing,
    handleMouseMove,
  } = useResizableSidebar();

  // Prevent accidental data loss when user has unsaved changes
  useBeforeUnload(hasUnsavedChanges);

  // Set up global mouse event listeners for sidebar resizing
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [handleMouseMove, stopResizing]);

  // Show file uploader if no data has been loaded yet
  if (!data) {
    return <FileUploader />;
  }

  // Build the current visualization data based on user configuration
  const treeData = buildTreeData();

  return (
    <div className={`flex h-screen relative ${
      theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
    }`}>
      
      {/* Resizable Sidebar - Customization Panel */}
      {showSidebar && (
        <div className="flex h-full">
          {/* Main sidebar container with dynamic width */}
          <div
            className={`h-full z-20 relative ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
            }`}
            style={{ width: sidebarWidth }}
          >
            <CustomiserPanel />
          </div>

          {/* Resize handle - allows users to drag and adjust sidebar width */}
          <div 
            onMouseDown={startResizing} 
            className={`cursor-col-resize w-2 ${
              theme === 'dark' 
                ? 'bg-gray-700 hover:bg-gray-600' 
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label="Resize sidebar"
          />
        </div>
      )}

      {/* Sidebar toggle button - shown when sidebar is hidden */}
      {!showSidebar && (
        <button
          className={`absolute top-1/2 left-0 z-10 -translate-y-1/2 px-2 py-1 rounded-r cursor-pointer transition-colors ${
            theme === 'dark' 
              ? 'bg-gray-700 hover:bg-gray-600 text-white' 
              : 'bg-gray-300 hover:bg-gray-400 text-gray-900'
          }`}
          onClick={() => setShowSidebar(true)}
          aria-label="Show sidebar"
        >
          ▶
        </button>
      )}

      {/* Main content area - Tree Matrix Visualization */}
      <div className="flex-1 overflow-auto">
        <TreeMatrix
          treeData={treeData}
          visibleClusters={visibleClusters}
          visiblePhages={visiblePhages}
          bacteriaClusterOrderArr={Object.keys(clusterBacteriaOrder)}
          clusterBacteriaOrder={clusterBacteriaOrder}
          clusterChildrenOrder={clusterChildrenOrder}
        />
      </div>
    </div>
  );
}

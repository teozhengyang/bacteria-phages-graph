/**
 * Main application page component
 * Orchestrates the entire bacteria-phage visualization application
 * Handles file upload, data visualization, and user interactions
 */

'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '../hooks/useTheme';
import { useResizableSidebar } from '../hooks/useResizableSidebar';
import { useBeforeUnload } from '../hooks/useBeforeUnload';
import { useAppState } from '../hooks/useAppState';

// Dynamically import components to prevent SSR hydration issues
// This ensures proper client-side rendering for complex interactive components
const FileUploader = dynamic(() => import('../components/file-upload/FileUploader'), { ssr: false });
const TreeMatrix = dynamic(() => import('../components/visualization/TreeMatrix'), { ssr: false });
const CustomiserPanel = dynamic(() => import('../components/customizer/CustomiserPanel'), { ssr: false });

/**
 * Home component - Main application entry point
 * Manages the overall layout and state coordination between components
 * 
 * @returns {JSX.Element} The main application interface
 */
export default function Home() {
  // Sidebar visibility state - controls whether the customization panel is shown
  const [showSidebar, setShowSidebar] = useState(true);
  
  // Theme management hook - handles light/dark mode switching
  const { theme, toggleTheme } = useTheme();
  
  // Resizable sidebar functionality - allows users to adjust panel width
  const {
    sidebarWidth,
    startResizing,
    stopResizing,
    handleMouseMove,
  } = useResizableSidebar();

  // Core application state management - handles all data and user interactions
  const {
    data,                    // Parsed Excel data
    allClusters,            // All user-created clusters
    visibleClusters,        // Currently displayed clusters
    visiblePhages,          // Currently displayed phages
    bacteriaClusters,       // Bacteria-to-cluster assignments
    clusterBacteriaOrder,   // Display order within clusters
    clusterChildrenOrder,   // Nested cluster ordering
    hasUnsavedChanges,      // Tracks if user has unsaved modifications
    setVisibleClusters,
    setVisiblePhages,
    setBacteriaClusters,
    setClusterBacteriaOrder,
    setClusterChildrenOrder,
    handleFile,             // File upload handler
    importSession,          // Session import functionality
    exportSession,          // Session export functionality
    updateClusterParent,    // Cluster hierarchy management
    addCluster,             // Create new clusters
    deleteCluster,          // Remove clusters
    buildTreeData,          // Generate visualization data structure
    getClusterInfoData,     // Aggregate phage-cluster information
  } = useAppState();

  // Prevent accidental data loss when user has unsaved changes
  useBeforeUnload(hasUnsavedChanges);

  // Set up global mouse event listeners for sidebar resizing
  // These listeners allow smooth resizing behavior across the entire window
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
    return <FileUploader onFile={handleFile} theme={theme} toggleTheme={toggleTheme} />;
  }

  // Build the current visualization data based on user configuration
  const treeData = buildTreeData();
  const clusterInfoData = getClusterInfoData();

  return (
    <div className={`flex h-screen relative ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Resizable Sidebar - Customization Panel */}
      {showSidebar && (
        <div className="flex h-full">
          {/* Main sidebar container with dynamic width */}
          <div
            className={`h-full z-20 relative ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}
            style={{ width: sidebarWidth }}
          >
            <CustomiserPanel
              headers={data.headers}
              clusters={allClusters}
              // Extract bacteria names from the data structure, filtering out undefined entries
              bacteria={data.treeData.children?.[0]?.children
                ?.filter(b => b && b.name && b.name !== 'undefined')
                ?.map((b) => b.name) || []}
              visibleClusters={visibleClusters}
              visiblePhages={visiblePhages}
              setVisibleClusters={setVisibleClusters}
              setVisiblePhages={setVisiblePhages}
              bacteriaClusters={bacteriaClusters}
              setBacteriaClusters={setBacteriaClusters}
              clusterBacteriaOrder={clusterBacteriaOrder}
              setClusterBacteriaOrder={setClusterBacteriaOrder}
              addCluster={addCluster}
              deleteCluster={deleteCluster}
              exportSession={exportSession}
              importSession={importSession}
              theme={theme}
              toggleTheme={toggleTheme}
              setShowSidebar={setShowSidebar}
              clusterInfoData={clusterInfoData}
              updateClusterParent={updateClusterParent}
              clusterChildrenOrder={clusterChildrenOrder}
              setClusterChildrenOrder={setClusterChildrenOrder}
            />
          </div>

          {/* Resize handle - allows users to drag and adjust sidebar width */}
          <div 
            onMouseDown={startResizing} 
            className={`cursor-col-resize w-2 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'}`}
          />
        </div>
      )}

      {/* Sidebar toggle button - shown when sidebar is hidden */}
      {!showSidebar && (
        <div
          className={`absolute top-1/2 left-0 z-10 -translate-y-1/2 px-2 py-1 rounded-r cursor-pointer ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-900'}`}
          onClick={() => setShowSidebar(true)}
        >
          ▶
        </div>
      )}

      {/* Main content area - Tree Matrix Visualization */}
      <div className="flex-1 overflow-auto">
        <TreeMatrix
          theme={theme}
          treeData={treeData}
          headers={data.headers}
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

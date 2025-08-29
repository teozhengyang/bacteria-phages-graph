'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '../hooks/useTheme';
import { useResizableSidebar } from '../hooks/useResizableSidebar';
import { useBeforeUnload } from '../hooks/useBeforeUnload';
import { useAppState } from '../hooks/useAppState';

// Dynamically import components to prevent SSR hydration issues
const FileUploader = dynamic(() => import('../components/file-upload/FileUploader'), { ssr: false });
const TreeMatrix = dynamic(() => import('../components/visualization/TreeMatrix'), { ssr: false });
const CustomiserPanel = dynamic(() => import('../components/customizer/CustomiserPanel'), { ssr: false });

export default function Home() {
  const [showSidebar, setShowSidebar] = useState(true);
  
  const { theme, toggleTheme } = useTheme();
  const {
    sidebarWidth,
    startResizing,
    stopResizing,
    handleMouseMove,
  } = useResizableSidebar();

  const {
    data,
    allClusters,
    visibleClusters,
    visiblePhages,
    bacteriaClusters,
    clusterBacteriaOrder,
    clusterChildrenOrder,
    hasUnsavedChanges,
    setVisibleClusters,
    setVisiblePhages,
    setBacteriaClusters,
    setClusterBacteriaOrder,
    setClusterChildrenOrder,
    handleFile,
    importSession,
    exportSession,
    updateClusterParent,
    addCluster,
    deleteCluster,
    buildTreeData,
    getClusterInfoData,
  } = useAppState();

  useBeforeUnload(hasUnsavedChanges);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [handleMouseMove, stopResizing]);

  if (!data) {
    return <FileUploader onFile={handleFile} theme={theme} toggleTheme={toggleTheme} />;
  }

  const treeData = buildTreeData();
  const clusterInfoData = getClusterInfoData();

  return (
    <div className={`flex h-screen relative ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {showSidebar && (
        <div className="flex h-full">
          <div
            className={`h-full z-20 relative ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}
            style={{ width: sidebarWidth }}
          >
            <CustomiserPanel
              headers={data.headers}
              clusters={allClusters}
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

          <div 
            onMouseDown={startResizing} 
            className={`cursor-col-resize w-2 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'}`}
          />
        </div>
      )}

      {!showSidebar && (
        <div
          className={`absolute top-1/2 left-0 z-10 -translate-y-1/2 px-2 py-1 rounded-r cursor-pointer ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-900'}`}
          onClick={() => setShowSidebar(true)}
        >
          ▶
        </div>
      )}

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

'use client';

import React, { useState } from 'react';
import { CustomiserPanelProps } from '../../types';
import VisibleClustersControl from './VisibleClustersControl';
import AddClusterForm from './AddClusterForm';
import ClusterParentManager from './ClusterParentManager';
import ClusterHierarchyManager from './ClusterHierarchyManager';
import BacteriaAssigner from './BacteriaAssigner';
import VisiblePhagesControl from './VisiblePhagesControl';
import SessionManager from './SessionManager';
import PhageClusterInfoModal from '../modals/PhageClusterInfoModal';

const CustomiserPanel: React.FC<CustomiserPanelProps> = ({
  headers,
  clusters,
  visibleClusters,
  visiblePhages,
  setVisibleClusters,
  setVisiblePhages,
  bacteria,
  bacteriaClusters,
  setBacteriaClusters,
  clusterBacteriaOrder,
  setClusterBacteriaOrder,
  addCluster,
  deleteCluster,
  updateClusterParent,
  clusterChildrenOrder,
  setClusterChildrenOrder,
  importSession,
  exportSession,
  theme,
  toggleTheme,
  setShowSidebar,
  clusterInfoData,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const onDeleteCluster = (clusterName: string) => {
    if (clusterName === 'Root') {
      alert('Cannot delete the Root cluster.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete "${clusterName}"?`)) {
      deleteCluster(clusterName);
    }
  };

  const onUpdateClusterParent = (clusterName: string, newParent: string) => {
    if (clusterName === 'Root') {
      alert('Cannot change parent of Root cluster.');
      return;
    }
    
    // Check for circular dependencies
    const wouldCreateCircle = (childName: string, potentialParentName: string): boolean => {
      if (childName === potentialParentName) return true;
      const parent = clusters.find(c => c.name === potentialParentName);
      if (!parent || !parent.parent) return false;
      return wouldCreateCircle(childName, parent.parent);
    };

    if (newParent && wouldCreateCircle(clusterName, newParent)) {
      alert('Cannot create circular dependency between clusters.');
      return;
    }

    updateClusterParent(clusterName, newParent || null);
  };

  return (
    <div className={`flex flex-col h-full ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Modern top bar with glassmorphism effect */}
      <div className={`flex justify-between items-center p-4 sticky top-0 z-10 backdrop-blur-md ${theme === 'dark' ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-gray-200'} border-b`}>
        <button
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
            theme === 'dark' 
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-100 border border-gray-600' 
              : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm'
          }`}
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          <span className="text-sm">{theme === 'light' ? '🌙' : '☀️'}</span>
          <span className="text-sm">{theme === 'light' ? 'Dark' : 'Light'}</span>
        </button>

        <button
          className={`w-8 h-8 rounded-lg font-bold transition-all duration-200 flex items-center justify-center ${
            theme === 'dark' 
              ? 'bg-red-600 hover:bg-red-500 text-white' 
              : 'bg-red-500 hover:bg-red-600 text-white'
          } shadow-sm`}
          onClick={() => setShowSidebar(false)}
          aria-label="Close Sidebar"
          title="Close Sidebar"
        >
          ×
        </button>
      </div>

      {/* Scrollable main content with modern spacing */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <VisibleClustersControl
          clusters={clusters}
          visibleClusters={visibleClusters}
          setVisibleClusters={setVisibleClusters}
          onDeleteCluster={onDeleteCluster}
          theme={theme}
        />

        <AddClusterForm
          clusters={clusters}
          onAddCluster={addCluster}
          theme={theme}
        />

        <ClusterParentManager
          clusters={clusters}
          onUpdateClusterParent={onUpdateClusterParent}
          theme={theme}
        />

        <ClusterHierarchyManager
          clusters={clusters}
          clusterBacteriaOrder={clusterBacteriaOrder}
          clusterChildrenOrder={clusterChildrenOrder}
          setClusterChildrenOrder={setClusterChildrenOrder}
          setClusterBacteriaOrder={setClusterBacteriaOrder}
          theme={theme}
        />

        <BacteriaAssigner
          bacteria={bacteria}
          clusters={clusters}
          bacteriaClusters={bacteriaClusters}
          clusterBacteriaOrder={clusterBacteriaOrder}
          setBacteriaClusters={setBacteriaClusters}
          setClusterBacteriaOrder={setClusterBacteriaOrder}
          setVisibleClusters={setVisibleClusters}
          visibleClusters={visibleClusters}
          theme={theme}
        />

        <VisiblePhagesControl
          headers={headers}
          visiblePhages={visiblePhages}
          setVisiblePhages={setVisiblePhages}
          theme={theme}
        />

        <SessionManager
          exportSession={exportSession}
          importSession={importSession}
          theme={theme}
        />

        {/* PhageClusterInfoModal Trigger with modern styling */}
        <div className="pt-2">
          <button
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
              theme === 'dark' 
                ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            } shadow-sm`}
            onClick={() => setIsModalOpen(true)}
          >
            Show Phage Info
          </button>
        </div>

        <PhageClusterInfoModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          data={clusterInfoData}
        />
      </div>
    </div>
  );
};

export default CustomiserPanel;

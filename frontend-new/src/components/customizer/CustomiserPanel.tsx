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
    <div className="flex flex-col h-full text-base-content bg-base-200 rounded shadow-lg overflow-hidden">
      {/* Sticky top bar */}
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-base-200 z-10 py-2 px-1 border-b border-base-300">
        <button
          className="btn btn-sm btn-outline transition hover:bg-base-300"
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
        </button>

        <button
          className="btn btn-sm btn-error text-lg font-bold px-3 hover:bg-error/90 transition"
          onClick={() => setShowSidebar(false)}
          aria-label="Close Sidebar"
          title="Close Sidebar"
        >
          ×
        </button>
      </div>

      {/* Scrollable main content */}
      <div className="flex-grow overflow-y-auto">
        <VisibleClustersControl
          clusters={clusters}
          visibleClusters={visibleClusters}
          setVisibleClusters={setVisibleClusters}
          onDeleteCluster={onDeleteCluster}
        />

        <AddClusterForm
          clusters={clusters}
          onAddCluster={addCluster}
        />

        <ClusterParentManager
          clusters={clusters}
          onUpdateClusterParent={onUpdateClusterParent}
        />

        <ClusterHierarchyManager
          clusters={clusters}
          clusterBacteriaOrder={clusterBacteriaOrder}
          clusterChildrenOrder={clusterChildrenOrder}
          setClusterChildrenOrder={setClusterChildrenOrder}
          setClusterBacteriaOrder={setClusterBacteriaOrder}
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
        />

        <VisiblePhagesControl
          headers={headers}
          visiblePhages={visiblePhages}
          setVisiblePhages={setVisiblePhages}
        />

        <SessionManager
          exportSession={exportSession}
          importSession={importSession}
        />

        {/* PhageClusterInfoModal Trigger */}
        <div className="mt-4">
          <button
            className="btn btn-sm btn-primary w-full text-base"
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

/**
 * CustomiserPanel Component - Main Sidebar Configuration Interface
 * 
 * This component serves as the central control panel for all user customizations
 * including cluster management, visibility controls, bacteria assignments, 
 * session management, and phage cluster information display.
 * 
 * The panel is organized into collapsible sections for better user experience
 * and includes validation to prevent invalid operations. Uses context-based
 * state management for cleaner architecture.
 */

'use client';

import React, { useState } from 'react';
import { useTheme, useData } from '../../context';
import VisibleClustersControl from './VisibleClustersControl';
import AddClusterForm from './AddClusterForm';
import ClusterParentManager from './ClusterParentManager';
import ClusterHierarchyManager from './ClusterHierarchyManager';
import BacteriaAssigner from './BacteriaAssigner';
import VisiblePhagesControl from './VisiblePhagesControl';
import SessionManager from './SessionManager';
import PhageClusterInfoModal from '../modals/PhageClusterInfoModal';

/**
 * CustomiserPanel - Comprehensive sidebar for application configuration
 * 
 * Provides all the tools users need to customize their visualization:
 * - Create and manage clusters
 * - Assign bacteria to clusters
 * - Control visibility of clusters and phages
 * - Import/export session configurations
 * - View detailed phage cluster information
 * 
 * @returns {JSX.Element} The complete customization sidebar
 */
const CustomiserPanel: React.FC = () => {
  // Get theme from theme context
  const { theme, toggleTheme } = useTheme();
  
  // Get data state and actions from data context
  const {
    data,
    allClusters,
    visibleClusters,
    visiblePhages,
    bacteriaClusters,
    clusterBacteriaOrder,
    clusterChildrenOrder,
    setVisibleClusters,
    setVisiblePhages,
    setBacteriaClusters,
    setClusterBacteriaOrder,
    setClusterChildrenOrder,
    addCluster,
    deleteCluster,
    updateClusterParent,
    importSession,
    exportSession,
    setShowSidebar,
    getClusterInfoData,
    getBacteriaList,
  } = useData();

  // State for controlling the phage cluster information modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get computed data
  const headers = data?.headers || [];
  const bacteria = getBacteriaList();
  const clusterInfoData = getClusterInfoData();

  /**
   * Handle cluster deletion with validation and confirmation
   * Prevents deletion of the Root cluster and confirms user intent
   * 
   * @param {string} clusterName - Name of the cluster to delete
   */
  const onDeleteCluster = (clusterName: string) => {
    // Prevent deletion of the essential Root cluster
    if (clusterName === 'Root') {
      alert('Cannot delete the Root cluster.');
      return;
    }
    
    // Confirm deletion to prevent accidental data loss
    if (window.confirm(`Are you sure you want to delete "${clusterName}"?`)) {
      deleteCluster(clusterName);
    }
  };

  /**
   * Handle cluster parent updates with validation
   * Prevents invalid parent assignments for the Root cluster
   * 
   * @param {string} clusterName - Name of the cluster to modify
   * @param {string} newParent - Name of the new parent cluster
   */
  const onUpdateClusterParent = (clusterName: string, newParent: string) => {
    // Root cluster cannot have its parent changed
    if (clusterName === 'Root') {
      alert('Cannot change parent of Root cluster.');
      return;
    }
    
    // Check for circular dependencies
    const wouldCreateCircle = (childName: string, potentialParentName: string): boolean => {
      if (childName === potentialParentName) return true;
      const parent = allClusters.find(c => c.name === potentialParentName);
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
          clusters={allClusters}
          visibleClusters={visibleClusters}
          setVisibleClusters={setVisibleClusters}
          onDeleteCluster={onDeleteCluster}
          theme={theme}
        />

        <AddClusterForm
          clusters={allClusters}
          onAddCluster={addCluster}
          theme={theme}
        />

        <ClusterParentManager
          clusters={allClusters}
          onUpdateClusterParent={onUpdateClusterParent}
          theme={theme}
        />

        <ClusterHierarchyManager
          clusters={allClusters}
          clusterBacteriaOrder={clusterBacteriaOrder}
          clusterChildrenOrder={clusterChildrenOrder}
          setClusterChildrenOrder={setClusterChildrenOrder}
          setClusterBacteriaOrder={setClusterBacteriaOrder}
          theme={theme}
        />

        <BacteriaAssigner
          bacteria={bacteria}
          clusters={allClusters}
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

/**
 * Visible Clusters Control Component - Cluster Visibility Management
 * 
 * This component provides an interface for users to control which clusters
 * are visible in the visualization. It offers individual cluster toggle
 * controls, bulk show/hide all functionality, and cluster deletion options.
 * 
 * Features:
 * - Individual cluster visibility toggles with checkboxes
 * - Bulk show/hide all clusters functionality
 * - Cluster deletion with confirmation
 * - Visual feedback for selected/visible clusters
 * - Scrollable list for handling many clusters
 * - Theme-aware styling and accessibility support
 * 
 * The component helps users focus on specific clusters by hiding irrelevant
 * ones and provides management tools for organizing their cluster data.
 */

'use client';

import React from 'react';
import { Cluster } from '../../types';

/**
 * Props interface for the VisibleClustersControl component
 * 
 * @interface VisibleClustersControlProps
 * @property {Cluster[]} clusters - Array of all available clusters
 * @property {string[]} visibleClusters - Array of currently visible cluster names
 * @property {Function} setVisibleClusters - State setter for visible clusters
 * @property {Function} onDeleteCluster - Callback for cluster deletion
 * @property {string} [theme] - Current theme for styling consistency
 */
interface VisibleClustersControlProps {
  clusters: Cluster[];                                             // All available clusters
  visibleClusters: string[];                                       // Currently visible cluster names
  setVisibleClusters: React.Dispatch<React.SetStateAction<string[]>>; // Visibility state setter
  onDeleteCluster: (clusterName: string) => void;                 // Cluster deletion handler
  theme?: 'light' | 'dark';                                       // Theme for consistent styling
}

/**
 * VisibleClustersControl Component
 * 
 * Renders a control panel for managing cluster visibility in the visualization.
 * Provides checkboxes for individual clusters, bulk controls, and deletion
 * options with appropriate visual feedback and accessibility features.
 * 
 * @param {VisibleClustersControlProps} props - Component props
 * @returns {JSX.Element} Rendered cluster visibility control interface
 */
const VisibleClustersControl: React.FC<VisibleClustersControlProps> = ({
  clusters,
  visibleClusters,
  setVisibleClusters,
  onDeleteCluster,
  theme = 'light',
}) => {
  /**
   * Toggle visibility of a single cluster
   * 
   * Adds the cluster to visible list if not present, removes it if present.
   * Updates the visibility state to immediately reflect changes in the
   * visualization.
   * 
   * @param {string} cluster - Name of the cluster to toggle
   */
  const toggleCluster = (cluster: string) => {
    if (visibleClusters.includes(cluster)) {
      // Remove cluster from visible list
      setVisibleClusters(prev => prev.filter(c => c !== cluster));
    } else {
      // Add cluster to visible list
      setVisibleClusters(prev => [...prev, cluster]);
    }
  };

  /**
   * Toggle visibility of all clusters at once
   * 
   * If all clusters are currently visible, hides all clusters.
   * If some or no clusters are visible, shows all clusters.
   * Provides efficient bulk control for large datasets.
   */
  const toggleAll = () => {
    const clusterNames = clusters.map(c => c.name);
    
    if (visibleClusters.length === clusterNames.length) {
      // All clusters visible - hide all
      setVisibleClusters([]);
    } else {
      // Some or no clusters visible - show all
      setVisibleClusters(clusterNames);
    }
  };

  /**
   * Handle cluster deletion
   * 
   * Triggers the deletion callback for the specified cluster.
   * The parent component handles the actual deletion logic and
   * state updates.
   * 
   * @param {string} clusterName - Name of the cluster to delete
   */
  const handleDeleteCluster = (clusterName: string) => {
    onDeleteCluster(clusterName);
  };

  return (
    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} shadow-sm border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
      {/* Header with Title and Bulk Toggle */}
      <div className="flex items-center justify-between mb-4">
        <h2 className={`font-semibold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
          Visible Clusters
        </h2>
        
        {/* Bulk Show/Hide All Button */}
        <button
          onClick={toggleAll}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
            theme === 'dark'
              ? 'bg-blue-600 hover:bg-blue-500 text-white'
              : 'bg-blue-100 hover:bg-blue-200 text-blue-800'
          }`}
          aria-label={`${visibleClusters.length === clusters.length ? 'Hide' : 'Show'} all clusters`}
        >
          {visibleClusters.length === clusters.length ? 'Hide All' : 'Show All'}
        </button>
      </div>
      
      {/* Scrollable Cluster List */}
      <div className="max-h-44 overflow-y-auto space-y-2">
        {clusters.map(cluster => {
          const isVisible = visibleClusters.includes(cluster.name);
          
          return (
            <div
              key={`cluster-${cluster.name}`}
              className={`flex items-center justify-between p-2 rounded-lg transition-all duration-200 ${
                isVisible
                  ? theme === 'dark'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-900 border border-blue-200'
                  : theme === 'dark'
                    ? 'bg-gray-600 text-gray-200'
                    : 'bg-gray-50 text-gray-700'
              }`}
            >
              {/* Cluster Visibility Toggle */}
              <label className="flex items-center gap-3 cursor-pointer select-none flex-1">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded focus:ring-2 focus:ring-blue-500"
                  checked={isVisible}
                  onChange={() => toggleCluster(cluster.name)}
                  aria-label={`Toggle visibility of cluster ${cluster.name}`}
                />
                <span className="text-sm font-medium">{cluster.name}</span>
              </label>
              
              {/* Cluster Delete Button */}
              <button
                onClick={() => handleDeleteCluster(cluster.name)}
                className={`ml-2 p-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  theme === 'dark'
                    ? 'hover:bg-red-600 text-red-300'
                    : 'hover:bg-red-100 text-red-600'
                }`}
                title={`Delete cluster ${cluster.name}`}
                aria-label={`Delete cluster ${cluster.name}`}
              >
                {/* Delete Icon (X) */}
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" role="img" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          );
        })}
        
        {/* Empty State Message */}
        {clusters.length === 0 && (
          <div className={`text-center py-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            <p className="text-sm">No clusters available</p>
            <p className="text-xs mt-1">Upload data to see clusters here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisibleClustersControl;

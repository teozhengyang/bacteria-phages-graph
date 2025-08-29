/**
 * Bacteria Assigner Component - Bacteria-Cluster Assignment Interface
 * 
 * This component provides an interface for users to assign bacteria to clusters
 * in the hierarchical structure. It displays all available bacteria with dropdown
 * selectors for cluster assignment, automatically managing cluster visibility
 * and ordering when assignments are made.
 * 
 * Features:
 * - Individual bacteria assignment to clusters via dropdowns
 * - Automatic cluster visibility management when bacteria are assigned
 * - Real-time updates to cluster-bacteria ordering
 * - Visual feedback for current assignments
 * - Filtered display of valid bacteria (excludes null/empty values)
 * - Scrollable interface for handling large datasets
 * - Theme-aware styling and accessibility support
 * 
 * The component ensures data integrity by updating multiple related state
 * objects when assignments change and provides a clean interface for
 * managing complex hierarchical relationships.
 */

'use client';

import React from 'react';
import { 
  Cluster, 
  BacteriaClusters, 
  ClusterBacteriaOrder 
} from '../../types';

/**
 * Props interface for the BacteriaAssigner component
 * 
 * @interface BacteriaAssignerProps
 * @property {string[]} bacteria - Array of all available bacteria names
 * @property {Cluster[]} clusters - Array of all available clusters
 * @property {BacteriaClusters} bacteriaClusters - Current bacteria-cluster assignments
 * @property {ClusterBacteriaOrder} clusterBacteriaOrder - Current ordering of bacteria within clusters
 * @property {Function} setBacteriaClusters - State setter for bacteria assignments
 * @property {Function} setClusterBacteriaOrder - State setter for bacteria ordering
 * @property {Function} setVisibleClusters - State setter for visible clusters
 * @property {string[]} visibleClusters - Array of currently visible cluster names
 * @property {string} [theme] - Current theme for styling consistency
 */
interface BacteriaAssignerProps {
  bacteria: string[];                                                               // All available bacteria
  clusters: Cluster[];                                                              // All available clusters
  bacteriaClusters: BacteriaClusters;                                               // Current bacteria assignments
  clusterBacteriaOrder: ClusterBacteriaOrder;                                       // Bacteria ordering within clusters
  setBacteriaClusters: React.Dispatch<React.SetStateAction<BacteriaClusters>>;      // Assignment state setter
  setClusterBacteriaOrder: React.Dispatch<React.SetStateAction<ClusterBacteriaOrder>>; // Ordering state setter
  setVisibleClusters: React.Dispatch<React.SetStateAction<string[]>>;              // Visibility state setter
  visibleClusters: string[];                                                        // Currently visible clusters
  theme?: 'light' | 'dark';                                                        // Theme for consistent styling
}

/**
 * BacteriaAssigner Component
 * 
 * Renders an interface for assigning bacteria to clusters with real-time updates
 * to related state objects. Provides dropdown selectors for each bacteria and
 * handles the complex state management required for hierarchical data.
 * 
 * @param {BacteriaAssignerProps} props - Component props
 * @returns {JSX.Element} Rendered bacteria assignment interface
 */
const BacteriaAssigner: React.FC<BacteriaAssignerProps> = ({
  bacteria,
  clusters,
  bacteriaClusters,
  clusterBacteriaOrder,
  setBacteriaClusters,
  setClusterBacteriaOrder,
  setVisibleClusters,
  visibleClusters,
  theme = 'light',
}) => {
  /**
   * Update bacteria cluster assignment
   * 
   * Handles the complex state updates required when a bacteria is assigned
   * to a new cluster. This includes updating the assignment mapping, managing
   * bacteria ordering within clusters, and ensuring cluster visibility.
   * 
   * @param {string} bacteriaName - Name of the bacteria being assigned
   * @param {string} clusterName - Name of the target cluster
   */
  const updateBacteriaCluster = (bacteriaName: string, clusterName: string) => {
    // Update the bacteria-cluster assignment mapping
    setBacteriaClusters(prev => ({ ...prev, [bacteriaName]: clusterName }));
    
    // Update cluster-bacteria ordering
    setClusterBacteriaOrder(prev => {
      const updated = { ...prev };
      
      // Remove bacteria from previous cluster
      const oldCluster = bacteriaClusters[bacteriaName];
      if (oldCluster && updated[oldCluster]) {
        updated[oldCluster] = updated[oldCluster].filter(b => b !== bacteriaName);
      }
      
      // Add bacteria to new cluster
      if (!updated[clusterName]) updated[clusterName] = [];
      if (!updated[clusterName].includes(bacteriaName)) {
        updated[clusterName].push(bacteriaName);
      }
      
      return updated;
    });
    
    // Ensure the target cluster is visible when bacteria is assigned
    if (!visibleClusters.includes(clusterName)) {
      setVisibleClusters(prev => [...prev, clusterName]);
    }
  };

  /**
   * Handle cluster selection change
   * 
   * Wrapper function to handle dropdown selection changes and trigger
   * the bacteria assignment update.
   * 
   * @param {string} bacteriaName - Name of the bacteria
   * @param {string} clusterName - Selected cluster name
   */
  const handleClusterSelection = (bacteriaName: string, clusterName: string) => {
    updateBacteriaCluster(bacteriaName, clusterName);
  };

  /**
   * Get clusters that currently have bacteria assigned
   * 
   * Filters clusters to show only those that have at least one valid
   * bacteria assignment. This helps prioritize active clusters in the
   * selection dropdown.
   */
  const clustersWithBacteria = clusters.filter(
    c => (clusterBacteriaOrder[c.name] || []).filter(b => b != null && b !== '').length > 0
  );

  /**
   * Filter valid bacteria names
   * 
   * Removes null, empty, or undefined bacteria names from the display
   * to ensure a clean interface with only valid data.
   */
  const filteredBacteria = bacteria.filter(b => b != null && b !== '' && b !== 'undefined');

  return (
    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} shadow-sm border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
      {/* Section Header */}
      <h2 className={`font-semibold text-lg mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
        Assign Bacteria
      </h2>
      
      {/* Scrollable Bacteria Assignment List */}
      <div className="max-h-44 overflow-y-auto space-y-2">
        {filteredBacteria.map((bacterium, index) => (
          <div 
            key={`bact-${bacterium}-${index}`} 
            className={`flex items-center gap-3 p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-50'} border ${theme === 'dark' ? 'border-gray-500' : 'border-gray-200'}`}
          >
            {/* Bacteria Name Display */}
            <span 
              className={`flex-[2] truncate text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`} 
              title={bacterium}                    // Tooltip for full name
            >
              {bacterium}
            </span>
            
            {/* Cluster Assignment Dropdown */}
            <select
              className={`flex-[1] min-w-[90px] max-w-[140px] px-3 py-1.5 text-sm rounded-md border transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-500 text-white focus:border-blue-400'
                  : 'bg-white border-gray-300 text-gray-700 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20`}
              value={bacteriaClusters[bacterium] || ''}                    // Current assignment
              onChange={e => handleClusterSelection(bacterium, e.target.value)}
              aria-label={`Assign cluster for bacteria ${bacterium}`}
            >
              <option value="">Select cluster</option>
              
              {/* Clusters with existing bacteria (prioritized) */}
              {clustersWithBacteria.map(cluster => (
                <option key={`opt1-${bacterium}-${cluster.name}`} value={cluster.name}>
                  {cluster.name}
                </option>
              ))}
              
              {/* Empty clusters (secondary options) */}
              {clusters
                .filter(c => !clustersWithBacteria.includes(c))
                .map(cluster => (
                  <option key={`opt2-${bacterium}-${cluster.name}`} value={cluster.name}>
                    {cluster.name}
                  </option>
                ))}
            </select>
          </div>
        ))}
        
        {/* Empty State Message */}
        {filteredBacteria.length === 0 && (
          <div className={`text-center py-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            <p className="text-sm">No bacteria available</p>
            <p className="text-xs mt-1">Upload data to see bacteria here</p>
          </div>
        )}
      </div>
      
      {/* Assignment Summary */}
      {filteredBacteria.length > 0 && (
        <div className={`mt-3 pt-3 border-t text-xs ${
          theme === 'dark' 
            ? 'border-gray-600 text-gray-400' 
            : 'border-gray-200 text-gray-500'
        }`}>
          <span>
            {Object.keys(bacteriaClusters).filter(b => bacteriaClusters[b]).length} of {filteredBacteria.length} bacteria assigned
          </span>
        </div>
      )}
    </div>
  );
};

export default BacteriaAssigner;

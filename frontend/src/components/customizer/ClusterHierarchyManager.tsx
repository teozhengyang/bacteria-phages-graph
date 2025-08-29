/**
 * ClusterHierarchyManager Component
 * 
 * A sophisticated interface for managing hierarchical cluster relationships and ordering.
 * This component provides drag-free reordering controls for:
 * - Child cluster order within parent clusters
 * - Bacteria order within each cluster
 * 
 * Features:
 * - Hierarchical visualization of parent-child cluster relationships
 * - Up/down arrow controls for reordering elements
 * - Real-time order state management
 * - Theme-aware styling with light/dark mode support
 * - Accessibility features with ARIA labels and disabled states
 * - Scrollable interface for large datasets
 * 
 * Technical Implementation:
 * - Uses controlled component pattern for order state management
 * - Filters and orders data based on current state
 * - Provides visual feedback for disabled controls
 * - Integrates with array utility functions for safe reordering
 * 
 * @component
 * @example
 * ```tsx
 * <ClusterHierarchyManager
 *   clusters={clusterData}
 *   clusterBacteriaOrder={bacteriaOrder}
 *   clusterChildrenOrder={childrenOrder}
 *   setClusterChildrenOrder={setChildrenOrder}
 *   setClusterBacteriaOrder={setBacteriaOrder}
 *   theme="dark"
 * />
 * ```
 */

'use client';

import React from 'react';
import { 
  Cluster, 
  ClusterBacteriaOrder, 
  ClusterChildrenOrder 
} from '../../types';
import { moveArrayItem } from '../../utils/arrayUtils';

/**
 * Props interface for ClusterHierarchyManager component
 * 
 * @interface ClusterHierarchyManagerProps
 * @property {Cluster[]} clusters - Array of all cluster objects with hierarchical relationships
 * @property {ClusterBacteriaOrder} clusterBacteriaOrder - Current ordering of bacteria within each cluster
 * @property {ClusterChildrenOrder} clusterChildrenOrder - Current ordering of child clusters within parent clusters
 * @property {React.Dispatch<React.SetStateAction<ClusterChildrenOrder>>} setClusterChildrenOrder - State setter for child cluster ordering
 * @property {React.Dispatch<React.SetStateAction<ClusterBacteriaOrder>>} setClusterBacteriaOrder - State setter for bacteria ordering
 * @property {'light' | 'dark'} [theme='light'] - Theme mode for component styling
 */
interface ClusterHierarchyManagerProps {
  clusters: Cluster[];
  clusterBacteriaOrder: ClusterBacteriaOrder;
  clusterChildrenOrder: ClusterChildrenOrder;
  setClusterChildrenOrder: React.Dispatch<React.SetStateAction<ClusterChildrenOrder>>;
  setClusterBacteriaOrder: React.Dispatch<React.SetStateAction<ClusterBacteriaOrder>>;
  theme?: 'light' | 'dark';
}

const ClusterHierarchyManager: React.FC<ClusterHierarchyManagerProps> = ({
  clusters,
  clusterBacteriaOrder,
  clusterChildrenOrder,
  setClusterChildrenOrder,
  setClusterBacteriaOrder,
  theme = 'light',
}) => {
  /**
   * Helper function to retrieve child clusters for a given parent cluster
   * 
   * @param {string} parentName - Name of the parent cluster
   * @returns {Cluster[]} Array of child clusters that have the specified parent
   */
  const getClusterChildren = (parentName: string) => {
    return clusters.filter(c => c.parent === parentName);
  };

  /**
   * Moves a child cluster up or down within its parent's children order
   * 
   * This function handles the reordering of child clusters within a parent cluster.
   * It maintains the current order state and safely moves items using array utilities.
   * 
   * @param {string} parentName - Name of the parent cluster containing the child
   * @param {string} childName - Name of the child cluster to move
   * @param {'up' | 'down'} direction - Direction to move the child cluster
   */
  const moveChildCluster = (parentName: string, childName: string, direction: 'up' | 'down') => {
    // Get current order or fall back to natural cluster order
    const currentOrder = clusterChildrenOrder[parentName] || getClusterChildren(parentName).map(c => c.name);
    const currentIndex = currentOrder.indexOf(childName);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    // Ensure the new index is within valid bounds
    if (newIndex >= 0 && newIndex < currentOrder.length) {
      const newOrder = moveArrayItem(currentOrder, currentIndex, newIndex);
      setClusterChildrenOrder(prev => ({ ...prev, [parentName]: newOrder }));
    }
  };

  /**
   * Moves a bacteria up or down within its cluster's bacteria order
   * 
   * This function handles the reordering of bacteria within a specific cluster.
   * It maintains the current bacteria order state and safely moves items.
   * 
   * @param {string} clusterName - Name of the cluster containing the bacteria
   * @param {string} bacteriaName - Name of the bacteria to move
   * @param {'up' | 'down'} direction - Direction to move the bacteria
   */
  const moveBacteria = (clusterName: string, bacteriaName: string, direction: 'up' | 'down') => {
    const currentOrder = clusterBacteriaOrder[clusterName] || [];
    const currentIndex = currentOrder.indexOf(bacteriaName);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    // Ensure the new index is within valid bounds
    if (newIndex >= 0 && newIndex < currentOrder.length) {
      const newOrder = moveArrayItem(currentOrder, currentIndex, newIndex);
      setClusterBacteriaOrder(prev => ({ ...prev, [clusterName]: newOrder }));
    }
  };

  return (
    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} shadow-sm border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
      {/* Component header */}
      <h2 className={`font-semibold text-lg mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
        Cluster Hierarchy & Children Order
      </h2>
      
      {/* Scrollable content area for large datasets */}
      <div className="max-h-56 overflow-y-auto space-y-4">
        {clusters
          .filter(parent => getClusterChildren(parent.name).length > 0) /* Only show clusters that have children */
          .map(parent => {
            const children = getClusterChildren(parent.name);
            /* Use custom order if available, otherwise use natural order */
            const orderedChildren = clusterChildrenOrder[parent.name] 
              ? clusterChildrenOrder[parent.name].filter(name => children.some(c => c.name === name))
              : children.map(c => c.name);
            
            return (
              /* Parent cluster container */
              <div key={`hierarchy-${parent.name}`} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-50'} border ${theme === 'dark' ? 'border-gray-500' : 'border-gray-200'}`}>
                {/* Parent cluster title */}
                <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`}>
                  {parent.name} (Parent)
                </h3>
                
                {/* Children container with indentation */}
                <div className="ml-4 space-y-3">
                  {orderedChildren.map((childName, idx) => {
                    /* Get bacteria assigned to this child cluster */
                    const bacteriaInChild = (clusterBacteriaOrder[childName] || []).filter(b => b != null && b !== '');
                    
                    return (
                      /* Individual child cluster container */
                      <div 
                        key={`child-${childName}`} 
                        className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} border`}
                      >
                        {/* Child cluster header with move controls */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`font-medium flex-grow ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                            {childName}
                          </span>
                          
                          {/* Move up button - disabled if already at top */}
                          <button
                            disabled={idx === 0}
                            onClick={() => moveChildCluster(parent.name, childName, 'up')}
                            className={`p-1 rounded transition-colors ${
                              idx === 0
                                ? theme === 'dark'
                                  ? 'text-gray-500 cursor-not-allowed'
                                  : 'text-gray-400 cursor-not-allowed'
                                : theme === 'dark'
                                  ? 'text-blue-400 hover:bg-gray-600'
                                  : 'text-blue-600 hover:bg-blue-50'
                            }`}
                            aria-label={`Move ${childName} up`}
                            title="Move cluster up"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                          
                          {/* Move down button - disabled if already at bottom */}
                          <button
                            disabled={idx === orderedChildren.length - 1}
                            onClick={() => moveChildCluster(parent.name, childName, 'down')}
                            className={`p-1 rounded transition-colors ${
                              idx === orderedChildren.length - 1
                                ? theme === 'dark'
                                  ? 'text-gray-500 cursor-not-allowed'
                                  : 'text-gray-400 cursor-not-allowed'
                                : theme === 'dark'
                                  ? 'text-blue-400 hover:bg-gray-600'
                                  : 'text-blue-600 hover:bg-blue-50'
                            }`}
                            aria-label={`Move ${childName} down`}
                            title="Move cluster down"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                        
                        {/* Bacteria list for this child cluster */}
                        {bacteriaInChild.length > 0 && (
                          <div className="ml-4 space-y-2">
                            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-green-300' : 'text-green-600'}`}>
                              Bacteria:
                            </p>
                            {bacteriaInChild.map((bacteria, bIdx) => (
                              /* Individual bacteria item with move controls */
                              <div 
                                key={`bacteria-${childName}-${bacteria}`} 
                                className={`flex items-center gap-2 text-sm p-2 rounded ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}
                              >
                                <span className={`flex-grow truncate ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                                  {bacteria}
                                </span>
                                
                                {/* Move bacteria up button */}
                                <button
                                  disabled={bIdx === 0}
                                  onClick={() => moveBacteria(childName, bacteria, 'up')}
                                  className={`p-1 rounded transition-colors ${
                                    bIdx === 0
                                      ? theme === 'dark'
                                        ? 'text-gray-500 cursor-not-allowed'
                                        : 'text-gray-400 cursor-not-allowed'
                                      : theme === 'dark'
                                        ? 'text-green-400 hover:bg-gray-700'
                                        : 'text-green-600 hover:bg-green-50'
                                  }`}
                                  aria-label={`Move ${bacteria} up`}
                                  title="Move bacteria up"
                                >
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                  </svg>
                                </button>
                                
                                {/* Move bacteria down button */}
                                <button
                                  disabled={bIdx === bacteriaInChild.length - 1}
                                  onClick={() => moveBacteria(childName, bacteria, 'down')}
                                  className={`p-1 rounded transition-colors ${
                                    bIdx === bacteriaInChild.length - 1
                                      ? theme === 'dark'
                                        ? 'text-gray-500 cursor-not-allowed'
                                        : 'text-gray-400 cursor-not-allowed'
                                      : theme === 'dark'
                                        ? 'text-green-400 hover:bg-gray-700'
                                        : 'text-green-600 hover:bg-green-50'
                                  }`}
                                  aria-label={`Move ${bacteria} down`}
                                  title="Move bacteria down"
                                >
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default ClusterHierarchyManager;

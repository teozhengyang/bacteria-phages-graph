/**
 * Central application state management hook
 * 
 * This hook manages all the core application state including:
 * - Uploaded data from Excel files
 * - User-created clusters and their hierarchy
 * - Visibility settings for clusters and phages
 * - Bacteria-to-cluster assignments and ordering
 * - Session import/export functionality
 * - Tree data building for visualization
 * 
 * @returns {Object} Complete application state and actions
 */

import { useState, useEffect } from 'react';
import {
  ParsedExcelData,
  Cluster,
  BacteriaClusters,
  ClusterBacteriaOrder,
  ClusterChildrenOrder,
  SessionData,
  TreeNode,
} from '../types';
import { DataService } from '../services/dataService';
import { aggregatePhageClusterInfo } from '../utils/aggregatePhageClusterInfo';

export const useAppState = () => {
  // Core data state - holds the parsed Excel file data
  const [data, setData] = useState<ParsedExcelData | null>(null);
  
  // Cluster management state - all clusters start with a Root cluster
  const [allClusters, setAllClusters] = useState<Cluster[]>([{ name: 'Root', parent: null }]);
  
  // Visibility controls - determine what's shown in the visualization
  const [visibleClusters, setVisibleClusters] = useState<string[]>(['Root']);
  const [visiblePhages, setVisiblePhages] = useState<string[]>([]);
  
  // Organization state - how bacteria are grouped and ordered
  const [bacteriaClusters, setBacteriaClusters] = useState<BacteriaClusters>({});
  const [clusterBacteriaOrder, setClusterBacteriaOrder] = useState<ClusterBacteriaOrder>({});
  const [clusterChildrenOrder, setClusterChildrenOrder] = useState<ClusterChildrenOrder>({});
  
  // Application state tracking
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalFileName, setOriginalFileName] = useState('');

  /**
   * Track changes for unsaved changes warning
   * Monitors key state changes that would constitute user modifications
   */
  useEffect(() => {
    if (data) setHasUnsavedChanges(true);
  }, [visibleClusters, visiblePhages, bacteriaClusters, data]);

  /**
   * Handle Excel file upload and initial data processing
   * Processes the uploaded file and sets up initial application state
   * 
   * @param {File} file - The uploaded Excel file
   */
  const handleFile = async (file: File) => {
    try {
      // Process the uploaded file through the data service
      const result = await DataService.handleFileUpload(file);
      
      // Update all related state with the processed data
      setData(result.data);
      setBacteriaClusters(result.initialState.bacteriaClusters);
      setClusterBacteriaOrder(result.initialState.clusterBacteriaOrder);
      setAllClusters(result.initialState.allClusters);
      setVisibleClusters(result.initialState.visibleClusters);
      setVisiblePhages(result.initialState.visiblePhages);
      setOriginalFileName(result.initialState.originalFileName);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error handling file:', error);
      alert('Failed to process the uploaded file.');
    }
  };

  /**
   * Import a previously saved session configuration
   * Restores all user customizations from a saved session file
   * 
   * @param {File} file - The session JSON file to import
   */
  const importSession = async (file: File) => {
    try {
      // Process the session file through the data service
      const session = await DataService.handleSessionImport(file);
      
      // Restore all session state
      setAllClusters(session.allClusters);
      setVisibleClusters(session.visibleClusters);
      setVisiblePhages(session.visiblePhages);
      setBacteriaClusters(session.bacteriaClusters);
      setClusterBacteriaOrder(session.clusterBacteriaOrder);
      
      // Handle optional cluster children ordering (for backward compatibility)
      if (session.clusterChildrenOrder) {
        setClusterChildrenOrder(session.clusterChildrenOrder);
      }
      
      setHasUnsavedChanges(false);
      alert('Session imported successfully.');
    } catch (err) {
      console.error(err);
      alert('Failed to import session.');
    }
  };

  /**
   * Export current session configuration to a downloadable file
   * Saves all user customizations for future restoration
   */
  const exportSession = () => {
    // Compile current session state
    const session: SessionData = {
      allClusters,
      visibleClusters,
      visiblePhages,
      bacteriaClusters,
      clusterBacteriaOrder,
      clusterChildrenOrder,
    };

    // Trigger download through data service
    DataService.handleSessionExport(session, originalFileName);
  };

  /**
   * Update the parent relationship of a cluster
   * Handles cluster hierarchy management with validation
   * 
   * @param {string} clusterName - Name of the cluster to modify
   * @param {string | null} newParent - New parent cluster name or null for root level
   */
  const updateClusterParent = (clusterName: string, newParent: string | null) => {
    // Validate the operation to prevent circular dependencies
    const validation = DataService.validateClusterOperation('updateParent', clusterName, allClusters, newParent || undefined);
    
    if (!validation.isValid) {
      alert(validation.errorMessage);
      return;
    }

    // Update the cluster's parent relationship
    setAllClusters(prev =>
      prev.map(c =>
        c.name === clusterName ? { ...c, parent: newParent } : c
      )
    );
    setHasUnsavedChanges(true);
  };

  /**
   * Create a new cluster in the hierarchy
   * Adds a new cluster and sets up its initial configuration
   * 
   * @param {string} clusterName - Name for the new cluster
   * @param {string | null} parentName - Parent cluster name or null for root level
   */
  const addCluster = (clusterName: string, parentName: string | null = null) => {
    // Check if cluster name is already in use
    if (!allClusters.some((c) => c.name === clusterName)) {
      // Add the new cluster to the clusters list
      setAllClusters((prev) => [...prev, { name: clusterName, parent: parentName }]);
      
      // Make the new cluster visible by default
      setVisibleClusters((prev) => [...prev, clusterName]);
      
      // Initialize empty bacteria order for the new cluster
      setClusterBacteriaOrder((prev) => ({ ...prev, [clusterName]: [] }));
      
      setHasUnsavedChanges(true);
    }
  };

  /**
   * Delete a cluster and handle all related cleanup
   * Removes cluster and reassigns any contained bacteria to Root
   * 
   * @param {string} clusterName - Name of the cluster to delete
   */
  const deleteCluster = (clusterName: string) => {
    // Validate deletion operation (e.g., can't delete Root)
    const validation = DataService.validateClusterOperation('delete', clusterName, allClusters);
    
    if (!validation.isValid) {
      alert(validation.errorMessage);
      return;
    }

    // Collect all clusters that need to be removed (including descendants)
    const clustersToRemove = new Set<string>();
    const collectDescendants = (name: string) => {
      clustersToRemove.add(name);
      // Recursively find all child clusters
      allClusters.forEach((c) => {
        if (c.parent === name) collectDescendants(c.name);
      });
    };
    collectDescendants(clusterName);

    // Reassign bacteria from deleted clusters to Root
    setBacteriaClusters((prev) => {
      const updated: BacteriaClusters = {};
      for (const [bacteria, cluster] of Object.entries(prev)) {
        updated[bacteria] = clustersToRemove.has(cluster) ? 'Root' : cluster;
      }
      return updated;
    });

    // Clean up cluster bacteria order configurations
    setClusterBacteriaOrder((prev) => {
      const updated = { ...prev };
      for (const name of clustersToRemove) {
        delete updated[name];
      }
      return updated;
    });

    // Remove the clusters from the main clusters list
    setAllClusters((prev) => prev.filter((c) => !clustersToRemove.has(c.name)));
    
    // Remove from visible clusters
    setVisibleClusters((prev) => prev.filter((c) => !clustersToRemove.has(c)));
    
    setHasUnsavedChanges(true);
  };

  /**
   * Build the tree data structure for visualization
   * Transforms the flat cluster/bacteria data into a hierarchical structure
   * 
   * @returns {TreeNode | null} The hierarchical tree structure or null if no data
   */
  const buildTreeData = (): TreeNode | null => {
    return DataService.buildTreeData(
      data,
      allClusters,
      bacteriaClusters,
      clusterBacteriaOrder,
      clusterChildrenOrder,
      visibleClusters
    );
  };

  /**
   * Generate aggregated phage cluster information for modal display
   * Processes the tree data to create summary statistics for phage-cluster interactions
   * 
   * @returns {PhageClusterData | null} Aggregated cluster information or null
   */
  const getClusterInfoData = () => {
    const treeData = buildTreeData();
    return aggregatePhageClusterInfo(treeData, data?.headers || []);
  };

  // Return all state and actions for use by components
  return {
    // Current state values
    data,
    allClusters,
    visibleClusters,
    visiblePhages,
    bacteriaClusters,
    clusterBacteriaOrder,
    clusterChildrenOrder,
    hasUnsavedChanges,
    originalFileName,

    // State modification functions
    setVisibleClusters,
    setVisiblePhages,
    setBacteriaClusters,
    setClusterBacteriaOrder,
    setClusterChildrenOrder,

    // File and session management actions
    handleFile,
    importSession,
    exportSession,
    
    // Cluster management actions
    updateClusterParent,
    addCluster,
    deleteCluster,

    // Computed data generators
    buildTreeData,
    getClusterInfoData,
  };
};

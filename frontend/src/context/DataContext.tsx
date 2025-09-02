/**
 * Data Context - Bacteria-Phages Data Management
 * 
 * This context provides centralized state management for the bacteria-phages
 * data and related operations. It handles file upload, session management,
 * cluster operations, and data visualization.
 * 
 * Features:
 * - Centralized data management for uploaded Excel files
 * - Cluster hierarchy and organization state
 * - Visibility controls for clusters and phages
 * - Session management (import/export)
 * - Unsaved changes tracking
 */

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  ParsedExcelData,
  Cluster,
  BacteriaClusters,
  ClusterBacteriaOrder,
  ClusterChildrenOrder,
  SessionData,
  TreeNode,
  PhageClusterData,
} from '../types';
import { DataService } from '../services/dataService';
import { aggregatePhageClusterInfo } from '../utils/aggregatePhageClusterInfo';

/**
 * Data state interface - defines all centrally managed data state
 */
interface DataState {
  // Core data
  data: ParsedExcelData | null;
  originalFileName: string;
  
  // Cluster management
  allClusters: Cluster[];
  visibleClusters: string[];
  bacteriaClusters: BacteriaClusters;
  clusterBacteriaOrder: ClusterBacteriaOrder;
  clusterChildrenOrder: ClusterChildrenOrder;
  
  // Phage management
  visiblePhages: string[];
  
  // UI state
  hasUnsavedChanges: boolean;
  showSidebar: boolean;
}

/**
 * Data actions interface - defines all state modification functions
 */
interface DataActions {
  // File management
  handleFile: (file: File) => Promise<void>;
  importSession: (file: File) => Promise<void>;
  exportSession: () => void;
  
  // Cluster management
  addCluster: (clusterName: string, parentName?: string | null) => void;
  deleteCluster: (clusterName: string) => void;
  updateClusterParent: (clusterName: string, newParent: string | null) => void;
  setVisibleClusters: React.Dispatch<React.SetStateAction<string[]>>;
  setBacteriaClusters: React.Dispatch<React.SetStateAction<BacteriaClusters>>;
  setClusterBacteriaOrder: React.Dispatch<React.SetStateAction<ClusterBacteriaOrder>>;
  setClusterChildrenOrder: React.Dispatch<React.SetStateAction<ClusterChildrenOrder>>;
  
  // Phage management
  setVisiblePhages: React.Dispatch<React.SetStateAction<string[]>>;
  
  // UI actions
  setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>;
  
  // Computed data
  buildTreeData: () => TreeNode | null;
  getClusterInfoData: () => PhageClusterData | null;
  getBacteriaList: () => string[];
}

/**
 * Combined context value interface
 */
interface DataContextValue extends DataState, DataActions {}

/**
 * Create the context with undefined default (will be provided by provider)
 */
const DataContext = createContext<DataContextValue | undefined>(undefined);

/**
 * Custom hook to use the data context
 * Provides type-safe access to the data context
 * 
 * @returns {DataContextValue} The complete data context
 * @throws {Error} If used outside of DataProvider
 */
export const useData = (): DataContextValue => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

/**
 * Data Provider Props
 */
interface DataProviderProps {
  children: ReactNode;
}

/**
 * Data Context Provider
 * 
 * Manages all data state and provides it to child components.
 * Handles state initialization, persistence, and synchronization.
 * 
 * @param {DataProviderProps} props - Provider props containing children
 * @returns {JSX.Element} Context provider wrapping children
 */
export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  // Initialize state with default values
  const [state, setState] = useState<DataState>({
    data: null,
    originalFileName: '',
    allClusters: [{ name: 'Root', parent: null }],
    visibleClusters: ['Root'],
    bacteriaClusters: {},
    clusterBacteriaOrder: {},
    clusterChildrenOrder: {},
    visiblePhages: [],
    hasUnsavedChanges: false,
    showSidebar: true,
  });

  /**
   * Track changes for unsaved changes warning
   * Monitors key state changes that would constitute user modifications
   */
  useEffect(() => {
    if (state.data) {
      setState(prev => ({ ...prev, hasUnsavedChanges: true }));
    }
  }, [state.visibleClusters, state.visiblePhages, state.bacteriaClusters, state.data]);

  /**
   * Update a specific part of the state
   */
  const updateState = (updates: Partial<DataState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  /**
   * Handle Excel file upload and initial data processing
   */
  const handleFile = async (file: File): Promise<void> => {
    try {
      const result = await DataService.handleFileUpload(file);
      
      updateState({
        data: result.data,
        bacteriaClusters: result.initialState.bacteriaClusters,
        clusterBacteriaOrder: result.initialState.clusterBacteriaOrder,
        allClusters: result.initialState.allClusters,
        visibleClusters: result.initialState.visibleClusters,
        visiblePhages: result.initialState.visiblePhages,
        originalFileName: result.initialState.originalFileName,
        hasUnsavedChanges: false,
      });
    } catch (error) {
      console.error('Error handling file:', error);
      throw new Error('Failed to process the uploaded file.');
    }
  };

  /**
   * Import a previously saved session configuration
   */
  const importSession = async (file: File): Promise<void> => {
    try {
      const session = await DataService.handleSessionImport(file);
      
      updateState({
        allClusters: session.allClusters,
        visibleClusters: session.visibleClusters,
        visiblePhages: session.visiblePhages,
        bacteriaClusters: session.bacteriaClusters,
        clusterBacteriaOrder: session.clusterBacteriaOrder,
        clusterChildrenOrder: session.clusterChildrenOrder || {},
        hasUnsavedChanges: false,
      });
    } catch (err) {
      console.error(err);
      throw new Error('Failed to import session.');
    }
  };

  /**
   * Export current session configuration
   */
  const exportSession = (): void => {
    const session: SessionData = {
      allClusters: state.allClusters,
      visibleClusters: state.visibleClusters,
      visiblePhages: state.visiblePhages,
      bacteriaClusters: state.bacteriaClusters,
      clusterBacteriaOrder: state.clusterBacteriaOrder,
      clusterChildrenOrder: state.clusterChildrenOrder,
    };

    DataService.handleSessionExport(session, state.originalFileName);
  };

  /**
   * Create a new cluster in the hierarchy
   */
  const addCluster = (clusterName: string, parentName: string | null = null): void => {
    if (!state.allClusters.some((c) => c.name === clusterName)) {
      updateState({
        allClusters: [...state.allClusters, { name: clusterName, parent: parentName }],
        visibleClusters: [...state.visibleClusters, clusterName],
        clusterBacteriaOrder: { ...state.clusterBacteriaOrder, [clusterName]: [] },
        hasUnsavedChanges: true,
      });
    }
  };

  /**
   * Delete a cluster and handle cleanup
   */
  const deleteCluster = (clusterName: string): void => {
    const validation = DataService.validateClusterOperation('delete', clusterName, state.allClusters);
    
    if (!validation.isValid) {
      throw new Error(validation.errorMessage);
    }

    const clustersToRemove = new Set<string>();
    const collectDescendants = (name: string) => {
      clustersToRemove.add(name);
      state.allClusters.forEach((c) => {
        if (c.parent === name) collectDescendants(c.name);
      });
    };
    collectDescendants(clusterName);

    // Reassign bacteria to Root
    const updatedBacteriaClusters: BacteriaClusters = {};
    for (const [bacteria, cluster] of Object.entries(state.bacteriaClusters)) {
      updatedBacteriaClusters[bacteria] = clustersToRemove.has(cluster) ? 'Root' : cluster;
    }

    // Clean up cluster bacteria order
    const updatedClusterBacteriaOrder = { ...state.clusterBacteriaOrder };
    for (const name of clustersToRemove) {
      delete updatedClusterBacteriaOrder[name];
    }

    updateState({
      allClusters: state.allClusters.filter((c) => !clustersToRemove.has(c.name)),
      visibleClusters: state.visibleClusters.filter((c) => !clustersToRemove.has(c)),
      bacteriaClusters: updatedBacteriaClusters,
      clusterBacteriaOrder: updatedClusterBacteriaOrder,
      hasUnsavedChanges: true,
    });
  };

  /**
   * Update cluster parent relationship
   */
  const updateClusterParent = (clusterName: string, newParent: string | null): void => {
    const validation = DataService.validateClusterOperation(
      'updateParent',
      clusterName,
      state.allClusters,
      newParent || undefined
    );
    
    if (!validation.isValid) {
      throw new Error(validation.errorMessage);
    }

    updateState({
      allClusters: state.allClusters.map(c =>
        c.name === clusterName ? { ...c, parent: newParent } : c
      ),
      hasUnsavedChanges: true,
    });
  };

  /**
   * Build tree data for visualization
   */
  const buildTreeData = (): TreeNode | null => {
    return DataService.buildTreeData(
      state.data,
      state.allClusters,
      state.bacteriaClusters,
      state.clusterBacteriaOrder,
      state.clusterChildrenOrder,
      state.visibleClusters
    );
  };

  /**
   * Get cluster information data for modals
   */
  const getClusterInfoData = (): PhageClusterData | null => {
    const treeData = buildTreeData();
    return aggregatePhageClusterInfo(treeData, state.data?.headers || []);
  };

  /**
   * Get list of bacteria from the data
   */
  const getBacteriaList = (): string[] => {
    if (!state.data) return [];
    
    return state.data.treeData.children?.[0]?.children
      ?.filter(b => b && b.name && b.name !== 'undefined')
      ?.map((b) => b.name) || [];
  };

  // State setters for direct access
  const setVisibleClusters: React.Dispatch<React.SetStateAction<string[]>> = (action) => {
    const newValue = typeof action === 'function' ? action(state.visibleClusters) : action;
    updateState({ visibleClusters: newValue });
  };

  const setVisiblePhages: React.Dispatch<React.SetStateAction<string[]>> = (action) => {
    const newValue = typeof action === 'function' ? action(state.visiblePhages) : action;
    updateState({ visiblePhages: newValue });
  };

  const setBacteriaClusters: React.Dispatch<React.SetStateAction<BacteriaClusters>> = (action) => {
    const newValue = typeof action === 'function' ? action(state.bacteriaClusters) : action;
    updateState({ bacteriaClusters: newValue });
  };

  const setClusterBacteriaOrder: React.Dispatch<React.SetStateAction<ClusterBacteriaOrder>> = (action) => {
    const newValue = typeof action === 'function' ? action(state.clusterBacteriaOrder) : action;
    updateState({ clusterBacteriaOrder: newValue });
  };

  const setClusterChildrenOrder: React.Dispatch<React.SetStateAction<ClusterChildrenOrder>> = (action) => {
    const newValue = typeof action === 'function' ? action(state.clusterChildrenOrder) : action;
    updateState({ clusterChildrenOrder: newValue });
  };

  const setShowSidebar: React.Dispatch<React.SetStateAction<boolean>> = (action) => {
    const newValue = typeof action === 'function' ? action(state.showSidebar) : action;
    updateState({ showSidebar: newValue });
  };

  // Combine state and actions for context value
  const contextValue: DataContextValue = {
    // State
    ...state,
    
    // Actions
    handleFile,
    importSession,
    exportSession,
    addCluster,
    deleteCluster,
    updateClusterParent,
    setVisibleClusters,
    setVisiblePhages,
    setBacteriaClusters,
    setClusterBacteriaOrder,
    setClusterChildrenOrder,
    setShowSidebar,
    buildTreeData,
    getClusterInfoData,
    getBacteriaList,
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

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
  const [data, setData] = useState<ParsedExcelData | null>(null);
  const [allClusters, setAllClusters] = useState<Cluster[]>([{ name: 'Root', parent: null }]);
  const [visibleClusters, setVisibleClusters] = useState<string[]>(['Root']);
  const [visiblePhages, setVisiblePhages] = useState<string[]>([]);
  const [bacteriaClusters, setBacteriaClusters] = useState<BacteriaClusters>({});
  const [clusterBacteriaOrder, setClusterBacteriaOrder] = useState<ClusterBacteriaOrder>({});
  const [clusterChildrenOrder, setClusterChildrenOrder] = useState<ClusterChildrenOrder>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalFileName, setOriginalFileName] = useState('');

  // Track changes for unsaved changes
  useEffect(() => {
    if (data) setHasUnsavedChanges(true);
  }, [visibleClusters, visiblePhages, bacteriaClusters, data]);

  const handleFile = async (file: File) => {
    try {
      const result = await DataService.handleFileUpload(file);
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

  const importSession = async (file: File) => {
    try {
      const session = await DataService.handleSessionImport(file);
      setAllClusters(session.allClusters);
      setVisibleClusters(session.visibleClusters);
      setVisiblePhages(session.visiblePhages);
      setBacteriaClusters(session.bacteriaClusters);
      setClusterBacteriaOrder(session.clusterBacteriaOrder);
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

  const exportSession = () => {
    const session: SessionData = {
      allClusters,
      visibleClusters,
      visiblePhages,
      bacteriaClusters,
      clusterBacteriaOrder,
      clusterChildrenOrder,
    };

    DataService.handleSessionExport(session, originalFileName);
  };

  const updateClusterParent = (clusterName: string, newParent: string | null) => {
    const validation = DataService.validateClusterOperation('updateParent', clusterName, allClusters, newParent || undefined);
    
    if (!validation.isValid) {
      alert(validation.errorMessage);
      return;
    }

    setAllClusters(prev =>
      prev.map(c =>
        c.name === clusterName ? { ...c, parent: newParent } : c
      )
    );
    setHasUnsavedChanges(true);
  };

  const addCluster = (clusterName: string, parentName: string | null = null) => {
    if (!allClusters.some((c) => c.name === clusterName)) {
      setAllClusters((prev) => [...prev, { name: clusterName, parent: parentName }]);
      setVisibleClusters((prev) => [...prev, clusterName]);
      setClusterBacteriaOrder((prev) => ({ ...prev, [clusterName]: [] }));
      setHasUnsavedChanges(true);
    }
  };

  const deleteCluster = (clusterName: string) => {
    const validation = DataService.validateClusterOperation('delete', clusterName, allClusters);
    
    if (!validation.isValid) {
      alert(validation.errorMessage);
      return;
    }

    const clustersToRemove = new Set<string>();
    const collectDescendants = (name: string) => {
      clustersToRemove.add(name);
      allClusters.forEach((c) => {
        if (c.parent === name) collectDescendants(c.name);
      });
    };
    collectDescendants(clusterName);

    setBacteriaClusters((prev) => {
      const updated: BacteriaClusters = {};
      for (const [bacteria, cluster] of Object.entries(prev)) {
        updated[bacteria] = clustersToRemove.has(cluster) ? 'Root' : cluster;
      }
      return updated;
    });

    setClusterBacteriaOrder((prev) => {
      const updated = { ...prev };
      for (const name of clustersToRemove) {
        delete updated[name];
      }
      return updated;
    });

    setAllClusters((prev) => prev.filter((c) => !clustersToRemove.has(c.name)));
    setVisibleClusters((prev) => prev.filter((c) => !clustersToRemove.has(c)));
    setHasUnsavedChanges(true);
  };

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

  const getClusterInfoData = () => {
    const treeData = buildTreeData();
    return aggregatePhageClusterInfo(treeData, data?.headers || []);
  };

  return {
    // State
    data,
    allClusters,
    visibleClusters,
    visiblePhages,
    bacteriaClusters,
    clusterBacteriaOrder,
    clusterChildrenOrder,
    hasUnsavedChanges,
    originalFileName,

    // State setters
    setVisibleClusters,
    setVisiblePhages,
    setBacteriaClusters,
    setClusterBacteriaOrder,
    setClusterChildrenOrder,

    // Actions
    handleFile,
    importSession,
    exportSession,
    updateClusterParent,
    addCluster,
    deleteCluster,

    // Computed values
    buildTreeData,
    getClusterInfoData,
  };
};

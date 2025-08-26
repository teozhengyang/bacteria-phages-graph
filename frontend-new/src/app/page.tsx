'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { parseExcelFile } from '../utils/excelParser';
import { aggregatePhageClusterInfo } from '../utils/aggregatePhageClusterInfo';
import { exportSessionData, importSessionData } from '../utils/sessionUtils';
import { getFileNameWithoutExtension } from '../utils/arrayUtils';
import { useTheme } from '../hooks/useTheme';
import { useResizableSidebar } from '../hooks/useResizableSidebar';
import { useBeforeUnload } from '../hooks/useBeforeUnload';
import {
  ParsedExcelData,
  Cluster,
  BacteriaClusters,
  ClusterBacteriaOrder,
  ClusterChildrenOrder,
  SessionData,
  TreeNode,
} from '../types';

// Dynamically import components to prevent SSR hydration issues
const FileUploader = dynamic(() => import('../components/FileUploader'), { ssr: false });
const TreeMatrix = dynamic(() => import('../components/TreeMatrix'), { ssr: false });
const CustomiserPanel = dynamic(() => import('../components/CustomiserPanel'), { ssr: false });

export default function Home() {
  const [data, setData] = useState<ParsedExcelData | null>(null);
  const [allClusters, setAllClusters] = useState<Cluster[]>([{ name: 'Root', parent: null }]);
  const [visibleClusters, setVisibleClusters] = useState<string[]>(['Root']);
  const [visiblePhages, setVisiblePhages] = useState<string[]>([]);
  const [bacteriaClusters, setBacteriaClusters] = useState<BacteriaClusters>({});
  const [clusterBacteriaOrder, setClusterBacteriaOrder] = useState<ClusterBacteriaOrder>({});
  const [clusterChildrenOrder, setClusterChildrenOrder] = useState<ClusterChildrenOrder>({});
  const [showSidebar, setShowSidebar] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalFileName, setOriginalFileName] = useState('');

  const { theme, toggleTheme } = useTheme();
  const {
    sidebarWidth,
    startResizing,
    stopResizing,
    handleMouseMove,
  } = useResizableSidebar();

  useBeforeUnload(hasUnsavedChanges);

  const updateClusterParent = (clusterName: string, newParent: string | null) => {
    setAllClusters(prev =>
      prev.map(c =>
        c.name === clusterName ? { ...c, parent: newParent } : c
      )
    );
    setHasUnsavedChanges(true);
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [handleMouseMove, stopResizing]);

  const buildTreeData = (): TreeNode | null => {
    if (!data) return null;

    interface ClusterMapNode extends TreeNode {
      parent: string | null;
      __bacteria?: TreeNode[];
    }

    const clusterMap: { [key: string]: ClusterMapNode } = {};
    allClusters.forEach((c) => {
      clusterMap[c.name] = { name: c.name, parent: c.parent, children: [] };
    });

    const allBacteria = data.treeData?.children?.[0]?.children || [];

    Object.entries(bacteriaClusters).forEach(([bacteriaName, clusterName]) => {
      const key = clusterName || 'Root';
      if (!clusterMap[key]) return;
      const bacteriaInfo = allBacteria.find((b) => b.name === bacteriaName);
      if (bacteriaInfo) {
        if (!clusterMap[key].__bacteria) clusterMap[key].__bacteria = [];
        clusterMap[key].__bacteria!.push(bacteriaInfo);
      }
    });

    Object.entries(clusterMap).forEach(([clusterName, clusterNode]) => {
      const ordered = clusterBacteriaOrder[clusterName] || [];
      const bacteriaInCluster = clusterNode.__bacteria || [];
      const sorted = ordered
        .map(name => bacteriaInCluster.find(b => b.name === name))
        .filter(Boolean) as TreeNode[];
      clusterNode.children = [...(clusterNode.children || []), ...sorted];
      delete clusterNode.__bacteria;
    });

    const rootClusters: ClusterMapNode[] = [];
    Object.values(clusterMap).forEach((clusterNode: ClusterMapNode) => {
      if (clusterNode.parent && clusterMap[clusterNode.parent]) {
        clusterMap[clusterNode.parent].children!.push(clusterNode);
      } else {
        rootClusters.push(clusterNode);
      }
    });

    const filterVisibleClusters = (node: ClusterMapNode): TreeNode | null => {
      if (!visibleClusters.includes(node.name)) return null;
      const filtered = (node.children || [])
        .map((child: TreeNode) => {
          const childNode = child as ClusterMapNode;
          return childNode.parent !== undefined ? filterVisibleClusters(childNode) : child;
        })
        .filter(Boolean) as TreeNode[];
      return { ...node, children: filtered };
    };

    const visibleRoots = rootClusters.map(filterVisibleClusters).filter(Boolean) as TreeNode[];
    return { name: 'Bacteria', children: visibleRoots };
  };

  const treeData = buildTreeData();

  const handleFile = async (file: File) => {
    const parsed = await parseExcelFile(file);
    setData(parsed);

    const nameWithoutExt = getFileNameWithoutExtension(file.name);
    setOriginalFileName(nameWithoutExt);

    const initialClusters: BacteriaClusters = {};
    const bacteriaChildren = parsed.treeData.children?.[0]?.children || [];
    bacteriaChildren
      .filter(b => b && b.name && b.name !== 'undefined') // Filter out undefined bacteria
      .forEach((b) => {
        initialClusters[b.name] = 'Root';
      });
    setBacteriaClusters(initialClusters);

    setClusterBacteriaOrder({ 
      Root: bacteriaChildren
        .filter(b => b && b.name && b.name !== 'undefined') // Filter out undefined bacteria
        .map((b) => b.name) 
    });

    setAllClusters([{ name: 'Root', parent: null }]);
    setVisibleClusters(['Root']);
    setVisiblePhages(parsed.headers);
    setHasUnsavedChanges(false);
  };

  const importSession = async (file: File) => {
    try {
      const session: SessionData = await importSessionData(file);
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

    exportSessionData(session, originalFileName);
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
    if (clusterName === 'Root') {
      alert('Cannot delete the Root cluster.');
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

  useEffect(() => {
    if (data) setHasUnsavedChanges(true);
  }, [visibleClusters, visiblePhages, bacteriaClusters, data]);

  if (!data)
    return <FileUploader onFile={handleFile} theme={theme} toggleTheme={toggleTheme} />;

  const clusterInfoData = aggregatePhageClusterInfo(treeData, data.headers);

  return (
    <div className={`flex h-screen relative ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {showSidebar && (
        <div className="flex h-full">
          <div
            className={`h-full z-20 relative p-4 overflow-y-auto ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}
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

import React, { useState, useEffect } from 'react';
import FileUploader from './components/FileUploader';
import TreeMatrix from './components/TreeMatrix';
import CustomiserPanel from './components/CustomiserPanel';
import PhageClusterInfoModal from './components/PhageClusterInfoModal';
import { parseExcelFile } from './utils/excelParser';
import { aggregatePhageClusterInfo } from './utils/aggregatePhageClusterInfo';

function App() {
  const [data, setData] = useState(null);
  const [allClusters, setAllClusters] = useState([{ name: 'Root', parent: null }]);
  const [visibleClusters, setVisibleClusters] = useState(['Root']);
  const [visiblePhages, setVisiblePhages] = useState([]); // Just phages visible
  const [bacteriaClusters, setBacteriaClusters] = useState({});
  const [clusterBacteriaOrder, setClusterBacteriaOrder] = useState({});

  const [showSidebar, setShowSidebar] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClusters, setSelectedClusters] = useState([]);
  const [selectedPhages, setSelectedPhages] = useState([]);

  const buildTreeData = () => {
    if (!data) return null;

    const clusterMap = {};
    allClusters.forEach(c => {
      clusterMap[c.name] = { name: c.name, parent: c.parent, children: [] };
    });

    Object.entries(bacteriaClusters).forEach(([bacteriaName, clusterName]) => {
      const key = clusterName || 'Root';
      if (!clusterMap[key]) return;
      const bacteriaInfo = data.treeData.children[0].children.find(b => b.name === bacteriaName);
      if (bacteriaInfo) {
        if (!clusterMap[key].__bacteria) clusterMap[key].__bacteria = [];
        clusterMap[key].__bacteria.push(bacteriaInfo);
      }
    });

    Object.entries(clusterMap).forEach(([clusterName, clusterNode]) => {
      const ordered = clusterBacteriaOrder[clusterName] || [];
      const bacteriaInCluster = clusterNode.__bacteria || [];
      const sorted = ordered.map(name => bacteriaInCluster.find(b => b.name === name)).filter(Boolean);
      clusterNode.children = [...(clusterNode.children || []), ...sorted];
      delete clusterNode.__bacteria;
    });

    const rootClusters = [];
    Object.values(clusterMap).forEach(clusterNode => {
      if (clusterNode.parent && clusterMap[clusterNode.parent]) {
        clusterMap[clusterNode.parent].children.push(clusterNode);
      } else {
        rootClusters.push(clusterNode);
      }
    });

    const filterVisibleClusters = (node) => {
      if (!visibleClusters.includes(node.name)) return null;
      const filtered = (node.children || [])
        .map(child => (child.parent !== undefined ? filterVisibleClusters(child) : child))
        .filter(Boolean);
      return { ...node, children: filtered };
    };

    const visibleRoots = rootClusters.map(filterVisibleClusters).filter(Boolean);

    return { name: 'Bacteria', children: visibleRoots };
  };

  const treeData = buildTreeData();

  const handleFile = async (file) => {
    const parsed = await parseExcelFile(file);
    setData(parsed);

    // Default bacteria cluster assignment
    const initialClusters = {};
    parsed.treeData.children[0].children.forEach(b => {
      initialClusters[b.name] = 'Root';
    });
    setBacteriaClusters(initialClusters);

    setClusterBacteriaOrder({ Root: parsed.treeData.children[0].children.map(b => b.name) });

    setAllClusters([{ name: 'Root', parent: null }]);
    setVisibleClusters(['Root']);

    // Initialize visible phages to all headers
    setVisiblePhages(parsed.headers);

    setSelectedClusters([]);
    setSelectedPhages([]);
    setHasUnsavedChanges(false);
  };

  const addCluster = (clusterName, parentName = null) => {
    if (!allClusters.some(c => c.name === clusterName)) {
      setAllClusters(prev => [...prev, { name: clusterName, parent: parentName }]);
      setVisibleClusters(prev => [...prev, clusterName]);
      setClusterBacteriaOrder(prev => ({ ...prev, [clusterName]: [] }));
      setHasUnsavedChanges(true);
    }
  };

  const deleteCluster = (clusterName) => {
    if (clusterName === 'Root') {
      alert('Cannot delete the Root cluster.');
      return;
    }

    const clustersToRemove = new Set();
    const collectDescendants = (name) => {
      clustersToRemove.add(name);
      allClusters.forEach(c => {
        if (c.parent === name) collectDescendants(c.name);
      });
    };
    collectDescendants(clusterName);

    setBacteriaClusters(prev => {
      const updated = {};
      for (const [bacteria, cluster] of Object.entries(prev)) {
        updated[bacteria] = clustersToRemove.has(cluster) ? 'Root' : cluster;
      }
      return updated;
    });

    setClusterBacteriaOrder(prev => {
      const updated = { ...prev };
      for (const name of clustersToRemove) {
        delete updated[name];
      }
      return updated;
    });

    setAllClusters(prev => prev.filter(c => !clustersToRemove.has(c.name)));
    setVisibleClusters(prev => prev.filter(c => !clustersToRemove.has(c)));
    setHasUnsavedChanges(true);
  };

  useEffect(() => {
    if (data) setHasUnsavedChanges(true);
  }, [visibleClusters, visiblePhages, bacteriaClusters]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!hasUnsavedChanges) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  if (!data) return <FileUploader onFile={handleFile} />;

  const clusterInfoData = aggregatePhageClusterInfo(treeData, data.headers);

  return (
    <div className="flex h-screen relative bg-base-100 text-white">
      {showSidebar && (
        <div className="w-80 p-4 overflow-y-auto bg-base-200 h-full z-20 relative">
          <button
            onClick={() => setShowSidebar(false)}
            className="absolute top-2 right-2 btn btn-sm btn-outline"
          >
            ×
          </button>

          <CustomiserPanel
            headers={data.headers}
            clusters={allClusters}
            bacteria={data.treeData.children[0].children.map(b => b.name)}
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
          />

          <div className="mt-4">
            <button className="btn btn-sm btn-primary w-full" onClick={() => setIsModalOpen(true)}>
              Show Phage Info
            </button>
          </div>
        </div>
      )}

      {!showSidebar && (
        <div
          className="absolute top-1/2 left-0 z-10 -translate-y-1/2 bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded-r cursor-pointer"
          onClick={() => setShowSidebar(true)}
        >
          ▶
        </div>
      )}

      <div className="flex-1 overflow-auto">
        <TreeMatrix
          treeData={treeData}
          headers={data.headers}
          visibleClusters={visibleClusters}
          visiblePhages={visiblePhages}
          bacteriaClusterOrderArr={Object.keys(clusterBacteriaOrder)}
        />
      </div>

      <PhageClusterInfoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={clusterInfoData}
        selectedClusters={selectedClusters}
        setSelectedClusters={setSelectedClusters}
        selectedPhages={selectedPhages}
        setSelectedPhages={setSelectedPhages}
      />
    </div>
  );
}

export default App;

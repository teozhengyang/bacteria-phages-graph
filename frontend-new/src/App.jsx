import React, { useState, useEffect } from 'react';
import FileUploader from './components/FileUploader';
import TreeMatrix from './components/TreeMatrix';
import CustomiserPanel from './components/CustomiserPanel';
import { parseExcelFile } from './utils/excelParser';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [data, setData] = useState(null);
  const [visibleClusters, setVisibleClusters] = useState([]);
  const [visiblePhages, setVisiblePhages] = useState([]);
  const [allClusters, setAllClusters] = useState(['Default']);
  const [bacteriaClusters, setBacteriaClusters] = useState({});
  const [showSidebar, setShowSidebar] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const buildTreeData = () => {
    if (!data) return null;
    const clustersMap = {};

    Object.entries(bacteriaClusters).forEach(([bacteria, cluster]) => {
      const clusterName = cluster || 'Default';
      if (!clustersMap[clusterName]) clustersMap[clusterName] = [];
      const bacteriaInfo = data.treeData.children[0].children.find(b => b.name === bacteria);
      if (bacteriaInfo) {
        clustersMap[clusterName].push(bacteriaInfo);
      }
    });

    allClusters.forEach(c => {
      if (!clustersMap[c]) clustersMap[c] = [];
    });

    const children = Object.entries(clustersMap).map(([clusterName, bacteriaList]) => ({
      name: clusterName,
      children: bacteriaList,
    }));

    return {
      name: 'Bacteria',
      children,
    };
  };

  const treeData = buildTreeData();

  const handleFile = async (file) => {
    const parsed = await parseExcelFile(file);
    setData(parsed);

    const initialClusters = {};
    parsed.treeData.children[0].children.forEach(b => {
      initialClusters[b.name] = 'Default';
    });
    setBacteriaClusters(initialClusters);

    const clustersFromData = [...new Set(Object.values(initialClusters))];
    setAllClusters(clustersFromData.length ? clustersFromData : ['Default']);
    setVisibleClusters(clustersFromData.length ? clustersFromData : ['Default']);
    setVisiblePhages(parsed.headers);
    setHasUnsavedChanges(false);
  };

  const addCluster = (clusterName) => {
    if (!allClusters.includes(clusterName)) {
      setAllClusters(prev => [...prev, clusterName]);
      setVisibleClusters(prev => [...prev, clusterName]);
      setHasUnsavedChanges(true);
    }
  };

  useEffect(() => {
    if (data) {
      setHasUnsavedChanges(true);
    }
  }, [visibleClusters, visiblePhages, bacteriaClusters]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!hasUnsavedChanges) return;
      e.preventDefault();
      e.returnValue = '';
      toast.warning('You have unsaved changes! Reloading or leaving will lose your work.', {
        position: "top-right",
        autoClose: 5000,
        pauseOnHover: true,
        draggable: true,
      });
      return '';
    };

    if (hasUnsavedChanges) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    } else {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  if (!data) {
    return <FileUploader onFile={handleFile} />;
  }

  return (
    <div className="flex h-screen relative bg-base-100 text-white">
      {showSidebar && (
        <div className="w-80 p-4 overflow-y-auto bg-base-200 h-full z-20 relative">
          <button
            onClick={() => setShowSidebar(false)}
            className="absolute top-2 right-2 btn btn-sm btn-outline"
            aria-label="Hide sidebar"
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
            addCluster={addCluster}
          />
        </div>
      )}

      {!showSidebar && (
        <div
          className="absolute top-1/2 left-0 z-10 -translate-y-1/2 bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded-r cursor-pointer transition-all"
          onClick={() => setShowSidebar(true)}
          title="Show Panel"
          style={{ userSelect: 'none' }}
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
        />
      </div>

      <ToastContainer />
    </div>
  );
}

export default App;

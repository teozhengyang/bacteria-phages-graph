import React, { useState, useEffect } from 'react';
import FileUploader from './components/FileUploader';
import TreeMatrix from './components/TreeMatrix';
import CustomiserPanel from './components/CustomiserPanel';
import { parseExcelFile } from './utils/excelParser';
import { aggregatePhageClusterInfo } from './utils/aggregatePhageClusterInfo';

function App() {
  const [data, setData] = useState(null);
  const [allClusters, setAllClusters] = useState([{ name: 'Root', parent: null }]);
  const [visibleClusters, setVisibleClusters] = useState(['Root']);
  const [visiblePhages, setVisiblePhages] = useState([]);
  const [bacteriaClusters, setBacteriaClusters] = useState({});
  const [clusterBacteriaOrder, setClusterBacteriaOrder] = useState({});
  const [clusterChildrenOrder, setClusterChildrenOrder] = useState({});
  const [showSidebar, setShowSidebar] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalFileName, setOriginalFileName] = useState('');

  const [sidebarWidth, setSidebarWidth] = useState('320px');
  const [resizing, setResizing] = useState(false);

  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  const startResizing = (e) => {
    e.preventDefault();
    setResizing(true);
  };

  const updateClusterParent = (clusterName, newParent) => {
  setAllClusters(prev =>
    prev.map(c =>
      c.name === clusterName ? { ...c, parent: newParent } : c
    )
  );
  setHasUnsavedChanges(true);
};


  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!resizing) return;
      const newWidth = Math.min(Math.max(e.clientX, 200), 600);
      setSidebarWidth(`${newWidth}px`);
    };

    const handleMouseUp = () => setResizing(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing, theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const buildTreeData = () => {
    if (!data) return null;

    const clusterMap = {};
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
        clusterMap[key].__bacteria.push(bacteriaInfo);
      }
    });

    Object.entries(clusterMap).forEach(([clusterName, clusterNode]) => {
      const ordered = clusterBacteriaOrder[clusterName] || [];
      const bacteriaInCluster = clusterNode.__bacteria || [];
      const sorted = ordered
        .map((name) => bacteriaInCluster.find((b) => b?.name === name))
        .filter(Boolean);
      clusterNode.children = [...(clusterNode.children || []), ...sorted];
      delete clusterNode.__bacteria;
    });

    const rootClusters = [];
    Object.values(clusterMap).forEach((clusterNode) => {
      if (clusterNode.parent && clusterMap[clusterNode.parent]) {
        clusterMap[clusterNode.parent].children.push(clusterNode);
      } else {
        rootClusters.push(clusterNode);
      }
    });

    const filterVisibleClusters = (node) => {
      if (!visibleClusters.includes(node.name)) return null;
      const filtered = (node.children || [])
        .map((child) => (child.parent !== undefined ? filterVisibleClusters(child) : child))
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

    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
    setOriginalFileName(nameWithoutExt);

    const initialClusters = {};
    parsed.treeData.children[0].children.forEach((b) => {
      initialClusters[b.name] = 'Root';
    });
    setBacteriaClusters(initialClusters);

    setClusterBacteriaOrder({ Root: parsed.treeData.children[0].children.map((b) => b.name) });

    setAllClusters([{ name: 'Root', parent: null }]);
    setVisibleClusters(['Root']);
    setVisiblePhages(parsed.headers);
    setHasUnsavedChanges(false);
  };

  const importSession = async (file) => {
    try {
      const text = await file.text();
      const session = JSON.parse(text);
      if (
        session.allClusters &&
        session.visibleClusters &&
        session.visiblePhages &&
        session.bacteriaClusters &&
        session.clusterBacteriaOrder
      ) {
        setAllClusters(session.allClusters);
        setVisibleClusters(session.visibleClusters);
        setVisiblePhages(session.visiblePhages);
        setBacteriaClusters(session.bacteriaClusters);
        setClusterBacteriaOrder(session.clusterBacteriaOrder);
        setHasUnsavedChanges(false);
        alert('Session imported successfully.');
      } else {
        alert('Invalid session file.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to import session.');
    }
  };

  const exportSession = () => {
    const session = {
      allClusters,
      visibleClusters,
      visiblePhages,
      bacteriaClusters,
      clusterBacteriaOrder,
    };

    const blob = new Blob([JSON.stringify(session, null, 2)], {
      type: 'application/json',
    });

    const fileName = originalFileName ? `${originalFileName}-session.json` : 'session.json';
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const addCluster = (clusterName, parentName = null) => {
    if (!allClusters.some((c) => c.name === clusterName)) {
      setAllClusters((prev) => [...prev, { name: clusterName, parent: parentName }]);
      setVisibleClusters((prev) => [...prev, clusterName]);
      setClusterBacteriaOrder((prev) => ({ ...prev, [clusterName]: [] }));
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
      allClusters.forEach((c) => {
        if (c.parent === name) collectDescendants(c.name);
      });
    };
    collectDescendants(clusterName);

    setBacteriaClusters((prev) => {
      const updated = {};
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

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!hasUnsavedChanges) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  if (!data)
    return <FileUploader onFile={handleFile} theme={theme} toggleTheme={toggleTheme} />;

  const clusterInfoData = aggregatePhageClusterInfo(treeData, data.headers);

  return (
    <div className="flex h-screen relative bg-base-100 text-white">
      {showSidebar && (
        <div className="flex h-full">
          <div
            className="bg-base-200 h-full z-20 relative p-4 overflow-y-auto"
            style={{ width: sidebarWidth }}
          >
            <CustomiserPanel
              headers={data.headers}
              clusters={allClusters}
              bacteria={data.treeData.children[0].children.map((b) => b.name)}
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

          <div onMouseDown={startResizing} className="cursor-col-resize w-2 bg-gray-700 hover:bg-gray-600" />
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

export default App;
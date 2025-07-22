import React, { useState } from 'react';
import PhageClusterInfoModal from './PhageClusterInfoModal';

const CustomiserPanel = ({
  headers,
  clusters,
  visibleClusters,
  visiblePhages,
  setVisibleClusters,
  setVisiblePhages,
  bacteria,
  bacteriaClusters,
  setBacteriaClusters,
  clusterBacteriaOrder,
  setClusterBacteriaOrder,
  addCluster,
  deleteCluster,
  importSession,
  exportSession,
  theme,
  toggleTheme,
  setShowSidebar,
  clusterInfoData,
}) => {
  const [newClusterName, setNewClusterName] = useState('');
  const [parentCluster, setParentCluster] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClusters, setSelectedClusters] = useState([]);
  const [selectedPhages, setSelectedPhages] = useState([]);

  const onAddCluster = () => {
    const trimmed = newClusterName.trim();
    if (trimmed && !clusters.some(c => c.name === trimmed)) {
      addCluster(trimmed, parentCluster || null);
      setNewClusterName('');
      setParentCluster('');
    }
  };

  const updateBacteriaCluster = (bacteriaName, clusterName) => {
    setBacteriaClusters(prev => ({ ...prev, [bacteriaName]: clusterName }));
    setClusterBacteriaOrder(prev => {
      const updated = { ...prev };
      const oldCluster = bacteriaClusters[bacteriaName];
      if (oldCluster && updated[oldCluster]) {
        updated[oldCluster] = updated[oldCluster].filter(b => b !== bacteriaName);
      }
      if (!updated[clusterName]) updated[clusterName] = [];
      if (!updated[clusterName].includes(bacteriaName)) {
        updated[clusterName].push(bacteriaName);
      }
      return updated;
    });
    if (!visibleClusters.includes(clusterName)) {
      setVisibleClusters(prev => [...prev, clusterName]);
    }
  };

  const onDeleteCluster = (clusterName) => {
    if (clusterName === 'Root') {
      alert('Cannot delete the Root cluster.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete "${clusterName}"?`)) {
      deleteCluster(clusterName);
    }
  };

  const clustersWithBacteria = clusters.filter(
    c => (clusterBacteriaOrder[c.name] || []).filter(b => b != null && b !== '').length > 0
  );

  const filteredBacteria = bacteria.filter(b => b != null && b !== '');

  const togglePhage = (phage) => {
    if (visiblePhages.includes(phage)) {
      setVisiblePhages(prev => prev.filter(p => p !== phage));
    } else {
      setVisiblePhages(prev => [...prev, phage]);
    }
  };

  return (
    <div className="flex flex-col h-full text-base-content bg-base-200 rounded shadow-lg overflow-hidden">

      {/* Sticky top bar */}
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-base-200 z-10 py-2 px-1 border-b border-base-300">
        <button
          className="btn btn-sm btn-outline transition hover:bg-base-300"
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
        </button>

        <button
          className="btn btn-sm btn-error text-lg font-bold px-3 hover:bg-error/90 transition"
          onClick={() => setShowSidebar(false)}
          aria-label="Close Sidebar"
          title="Close Sidebar"
        >
          ×
        </button>
      </div>

      {/* Scrollable main content */}
      <div className="flex-grow overflow-y-auto pr-2">
        {/* Visible Clusters */}
        <section className="mb-6">
          <h2 className="font-semibold text-lg mb-3 border-b border-base-300 pb-1">Visible Clusters</h2>
          <div className="flex flex-wrap gap-3 max-h-36 overflow-y-auto pr-2">
            {clusters.map(c => (
              <label
                key={`cluster-${c.name}`}
                className="flex items-center gap-2 px-3 py-1 rounded cursor-pointer select-none bg-base-300 hover:bg-base-400 transition"
                title={`Toggle visibility of cluster ${c.name}`}
              >
                <input
                  type="checkbox"
                  className="toggle toggle-sm"
                  checked={visibleClusters.includes(c.name)}
                  onChange={() =>
                    setVisibleClusters(prev =>
                      prev.includes(c.name)
                        ? prev.filter(i => i !== c.name)
                        : [...prev, c.name]
                    )
                  }
                />
                <span>{c.name}</span>
                {c.name !== 'Root' && (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onDeleteCluster(c.name);
                    }}
                    className="btn btn-xs btn-error ml-2 hover:bg-error/90"
                    title={`Delete cluster ${c.name}`}
                  >
                    ×
                  </button>
                )}
              </label>
            ))}
          </div>
        </section>

        {/* Add Cluster */}
        <section className="mb-8">
          <h2 className="font-semibold text-lg mb-3 border-b border-base-300 pb-1">Add New Cluster</h2>
          <div className="flex gap-3 items-center flex-wrap">
            <input
              type="text"
              placeholder="New cluster name"
              value={newClusterName}
              onChange={e => setNewClusterName(e.target.value)}
              className="input input-sm input-bordered flex-grow min-w-[120px] focus:outline-none focus:ring-2 focus:ring-primary transition"
              onKeyDown={e => {
                if (e.key === 'Enter') onAddCluster();
              }}
              aria-label="New cluster name"
            />
            <select
              className="select select-sm select-bordered min-w-[130px] focus:outline-none focus:ring-2 focus:ring-primary transition"
              value={parentCluster}
              onChange={e => setParentCluster(e.target.value)}
              aria-label="Select parent cluster"
            >
              <option value="">No Parent</option>
              {clusters.map(c => (
                <option key={`parent-${c.name}`} value={c.name}>{c.name}</option>
              ))}
            </select>
            <button
              onClick={onAddCluster}
              className="btn btn-sm btn-primary flex-shrink-0 hover:brightness-110 transition"
              aria-label="Add new cluster"
            >
              Add
            </button>
          </div>
        </section>

        {/* Assign Bacteria */}
        <section className="mb-8 flex flex-col">
          <h2 className="font-semibold text-lg mb-3 border-b border-base-300 pb-1">Assign Bacteria</h2>
          <div className="max-h-44 overflow-y-auto border rounded p-2 bg-base-100 shadow-inner">
            {filteredBacteria.map(b => (
              <div key={`bact-${b}`} className="flex items-center gap-3 mb-2">
                {/* Widen bacteria name span, shrink dropdown */}
                <span className="flex-[2] truncate" title={b}>{b}</span>
                <select
                  className="select select-sm select-bordered flex-[1] min-w-[90px] max-w-[140px] focus:outline-none focus:ring-2 focus:ring-primary transition"
                  value={bacteriaClusters[b] || ''}
                  onChange={e => updateBacteriaCluster(b, e.target.value)}
                  aria-label={`Assign cluster for bacteria ${b}`}
                >
                  {clustersWithBacteria.map(c => (
                    <option key={`opt1-${b}-${c.name}`} value={c.name}>{c.name}</option>
                  ))}
                  {clusters
                    .filter(c => !clustersWithBacteria.includes(c))
                    .map(c => (
                      <option key={`opt2-${b}-${c.name}`} value={c.name}>{c.name}</option>
                    ))}
                </select>
              </div>
            ))}
          </div>
        </section>

        {/* Bacteria Order */}
        <section className="mb-8 flex flex-col">
          <h2 className="font-semibold text-lg mb-3 border-b border-base-300 pb-1">Bacteria Order in Clusters</h2>
          <div className="max-h-44 overflow-y-auto border rounded p-2 bg-base-100 shadow-inner space-y-4">
            {clustersWithBacteria.map(c => {
              const list = (clusterBacteriaOrder[c.name] || []).filter(b => b != null && b !== '');
              return (
                <div key={c.name}>
                  <h3 className="font-semibold mb-1">{c.name}</h3>
                  {list.map((bact, idx) => (
                    <div key={`order-${c.name}-${bact}`} className="flex items-center gap-3">
                      <span className="flex-grow truncate">{bact}</span>
                      <button
                        disabled={idx === 0}
                        onClick={() => {
                          const newList = [...list];
                          [newList[idx - 1], newList[idx]] = [newList[idx], newList[idx - 1]];
                          setClusterBacteriaOrder(prev => ({ ...prev, [c.name]: newList }));
                        }}
                        className="btn btn-xs btn-secondary"
                        aria-label={`Move ${bact} up`}
                      >↑</button>
                      <button
                        disabled={idx === list.length - 1}
                        onClick={() => {
                          const newList = [...list];
                          [newList[idx], newList[idx + 1]] = [newList[idx + 1], newList[idx]];
                          setClusterBacteriaOrder(prev => ({ ...prev, [c.name]: newList }));
                        }}
                        className="btn btn-xs btn-secondary"
                        aria-label={`Move ${bact} down`}
                      >↓</button>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </section>

        {/* Visible Phages */}
        <section className="mb-8 flex flex-col">
          <h2 className="font-semibold text-lg mb-3 border-b border-base-300 pb-1">Visible Phages</h2>
          <div className="max-h-44 overflow-y-auto border rounded p-2 bg-base-100 shadow-inner">
            {headers.map(phage => (
              <label
                key={`phage-${phage}`}
                className="flex items-center gap-3 mb-2 cursor-pointer select-none"
                title={`Toggle visibility of phage ${phage}`}
              >
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={visiblePhages.includes(phage)}
                  onChange={() => togglePhage(phage)}
                  aria-label={`Toggle phage ${phage}`}
                />
                <span>{phage}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Session Management */}
        <section className="mb-4 flex flex-col gap-3">
          <h2 className="font-semibold text-lg border-b border-base-300 pb-1">Session Management</h2>
          <button
            onClick={exportSession}
            className="btn btn-sm btn-success w-full text-base hover:brightness-110 transition"
            aria-label="Export session"
          >
            📤 Export Session
          </button>

          <label
            className="btn btn-sm btn-info w-full text-base cursor-pointer hover:brightness-110 transition"
            title="Import session"
          >
            📥 Import Session
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  importSession(file);
                  e.target.value = '';
                }
              }}
            />
          </label>
        </section>

        {/* PhageClusterInfoModal Trigger & Modal */}
        <div className="mt-4">
          <button
            className="btn btn-sm btn-primary w-full text-base"
            onClick={() => setIsModalOpen(true)}
          >
            Show Phage Info
          </button>
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
    </div>
  );
};

export default CustomiserPanel;

'use client';

import React, { useState } from 'react';
import PhageClusterInfoModal from './PhageClusterInfoModal';
import { CustomiserPanelProps } from '../types';
import { moveArrayItem } from '../utils/arrayUtils';

const CustomiserPanel: React.FC<CustomiserPanelProps> = ({
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
  updateClusterParent,
  clusterChildrenOrder,
  setClusterChildrenOrder,
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

  const onAddCluster = () => {
    const trimmed = newClusterName.trim();
    if (trimmed && !clusters.some(c => c.name === trimmed)) {
      addCluster(trimmed, parentCluster || null);
      setNewClusterName('');
      setParentCluster('');
    }
  };

  const updateBacteriaCluster = (bacteriaName: string, clusterName: string) => {
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

  const onDeleteCluster = (clusterName: string) => {
    if (clusterName === 'Root') {
      alert('Cannot delete the Root cluster.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete "${clusterName}"?`)) {
      deleteCluster(clusterName);
    }
  };

  const onUpdateClusterParent = (clusterName: string, newParent: string) => {
    if (clusterName === 'Root') {
      alert('Cannot change parent of Root cluster.');
      return;
    }
    
    // Check for circular dependencies
    const wouldCreateCircle = (childName: string, potentialParentName: string): boolean => {
      if (childName === potentialParentName) return true;
      const parent = clusters.find(c => c.name === potentialParentName);
      if (!parent || !parent.parent) return false;
      return wouldCreateCircle(childName, parent.parent);
    };

    if (newParent && wouldCreateCircle(clusterName, newParent)) {
      alert('Cannot create circular dependency between clusters.');
      return;
    }

    updateClusterParent(clusterName, newParent || null);
  };

  const clustersWithBacteria = clusters.filter(
    c => (clusterBacteriaOrder[c.name] || []).filter(b => b != null && b !== '').length > 0
  );

  const filteredBacteria = bacteria.filter(b => b != null && b !== '' && b !== 'undefined');

  const togglePhage = (phage: string) => {
    if (visiblePhages.includes(phage)) {
      setVisiblePhages(prev => prev.filter(p => p !== phage));
    } else {
      setVisiblePhages(prev => [...prev, phage]);
    }
  };

  // Helper function to get children of a cluster
  const getClusterChildren = (parentName: string) => {
    return clusters.filter(c => c.parent === parentName);
  };

  // Move child cluster up/down in parent's children order
  const moveChildCluster = (parentName: string, childName: string, direction: 'up' | 'down') => {
    const currentOrder = clusterChildrenOrder[parentName] || getClusterChildren(parentName).map(c => c.name);
    const currentIndex = currentOrder.indexOf(childName);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex >= 0 && newIndex < currentOrder.length) {
      const newOrder = moveArrayItem(currentOrder, currentIndex, newIndex);
      setClusterChildrenOrder(prev => ({ ...prev, [parentName]: newOrder }));
    }
  };

  // Move bacteria up/down in cluster's bacteria order
  const moveBacteria = (clusterName: string, bacteriaName: string, direction: 'up' | 'down') => {
    const currentOrder = clusterBacteriaOrder[clusterName] || [];
    const currentIndex = currentOrder.indexOf(bacteriaName);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex >= 0 && newIndex < currentOrder.length) {
      const newOrder = moveArrayItem(currentOrder, currentIndex, newIndex);
      setClusterBacteriaOrder(prev => ({ ...prev, [clusterName]: newOrder }));
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
      <div className="flex-grow overflow-y-auto">
        {/* Visible Clusters */}
        <section className="mb-6">
          <h2 className="font-semibold text-lg mb-3 border-b border-base-300 pb-1">Visible Clusters</h2>
          <div className="flex flex-wrap gap-3 max-h-36 overflow-y-auto">
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

        {/* Manage Cluster Parents */}
        <section className="mb-8">
          <h2 className="font-semibold text-lg mb-3 border-b border-base-300 pb-1">Manage Cluster Parents</h2>
          <div className="max-h-44 overflow-y-auto border rounded p-2 bg-base-100 shadow-inner">
            {clusters.filter(c => c.name !== 'Root').map(cluster => (
              <div key={`parent-${cluster.name}`} className="flex items-center gap-3 mb-2">
                <span className="flex-[2] truncate" title={cluster.name}>{cluster.name}</span>
                <select
                  className="select select-sm select-bordered flex-[1] min-w-[90px] max-w-[140px] focus:outline-none focus:ring-2 focus:ring-primary transition"
                  value={cluster.parent || ''}
                  onChange={e => onUpdateClusterParent(cluster.name, e.target.value)}
                  aria-label={`Change parent of cluster ${cluster.name}`}
                >
                  <option value="">No Parent</option>
                  {clusters
                    .filter(c => c.name !== cluster.name) // Can't be parent of itself
                    .map(c => (
                      <option key={`parent-opt-${c.name}`} value={c.name}>{c.name}</option>
                    ))}
                </select>
              </div>
            ))}
          </div>
        </section>

        {/* Cluster Hierarchy and Children Order */}
        <section className="mb-8">
          <h2 className="font-semibold text-lg mb-3 border-b border-base-300 pb-1">Cluster Hierarchy & Children Order</h2>
          <div className="max-h-56 overflow-y-auto border rounded p-2 bg-base-100 shadow-inner space-y-4">
            {clusters
              .filter(parent => getClusterChildren(parent.name).length > 0)
              .map(parent => {
                const children = getClusterChildren(parent.name);
                const orderedChildren = clusterChildrenOrder[parent.name] 
                  ? clusterChildrenOrder[parent.name].filter(name => children.some(c => c.name === name))
                  : children.map(c => c.name);
                
                return (
                  <div key={`hierarchy-${parent.name}`}>
                    <h3 className="font-semibold mb-2 text-primary">{parent.name} (Parent)</h3>
                    <div className="ml-4 space-y-2">
                      {orderedChildren.map((childName, idx) => {
                        const bacteriaInChild = (clusterBacteriaOrder[childName] || []).filter(b => b != null && b !== '');
                        return (
                          <div key={`child-${childName}`} className="border border-base-300 rounded p-2 bg-base-50">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium flex-grow">{childName}</span>
                              <button
                                disabled={idx === 0}
                                onClick={() => moveChildCluster(parent.name, childName, 'up')}
                                className="btn btn-xs btn-secondary disabled:opacity-30"
                                aria-label={`Move ${childName} up`}
                                title="Move cluster up"
                              >↑</button>
                              <button
                                disabled={idx === orderedChildren.length - 1}
                                onClick={() => moveChildCluster(parent.name, childName, 'down')}
                                className="btn btn-xs btn-secondary disabled:opacity-30"
                                aria-label={`Move ${childName} down`}
                                title="Move cluster down"
                              >↓</button>
                            </div>
                            
                            {/* Bacteria in this child cluster */}
                            {bacteriaInChild.length > 0 && (
                              <div className="ml-4 space-y-1">
                                <p className="text-sm font-medium text-secondary">Bacteria:</p>
                                {bacteriaInChild.map((bacteria, bIdx) => (
                                  <div key={`bacteria-${childName}-${bacteria}`} className="flex items-center gap-2 text-sm">
                                    <span className="flex-grow truncate">{bacteria}</span>
                                    <button
                                      disabled={bIdx === 0}
                                      onClick={() => moveBacteria(childName, bacteria, 'up')}
                                      className="btn btn-xs btn-accent disabled:opacity-30"
                                      aria-label={`Move ${bacteria} up`}
                                      title="Move bacteria up"
                                    >↑</button>
                                    <button
                                      disabled={bIdx === bacteriaInChild.length - 1}
                                      onClick={() => moveBacteria(childName, bacteria, 'down')}
                                      className="btn btn-xs btn-accent disabled:opacity-30"
                                      aria-label={`Move ${bacteria} down`}
                                      title="Move bacteria down"
                                    >↓</button>
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
        </section>

        {/* Assign Bacteria */}
        <section className="mb-8 flex flex-col">
          <h2 className="font-semibold text-lg mb-3 border-b border-base-300 pb-1">Assign Bacteria</h2>
          <div className="max-h-44 overflow-y-auto border rounded p-2 bg-base-100 shadow-inner">
            {filteredBacteria.map((b, index) => (
              <div key={`bact-${b}-${index}`} className="flex items-center gap-3 mb-2">
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
                const file = e.target.files?.[0];
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
        />
      </div>
    </div>
  );
};

export default CustomiserPanel;

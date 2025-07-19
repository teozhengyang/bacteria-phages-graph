import React, { useState } from 'react';

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
}) => {
  const [newClusterName, setNewClusterName] = useState('');
  const [parentCluster, setParentCluster] = useState('');

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

  // Clusters that have at least one bacteria assigned
  const clustersWithBacteria = clusters.filter(
    c => (clusterBacteriaOrder[c.name] || []).length > 0
  );

  const togglePhage = (phage) => {
    if (visiblePhages.includes(phage)) {
      setVisiblePhages(prev => prev.filter(p => p !== phage));
    } else {
      setVisiblePhages(prev => [...prev, phage]);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="font-bold text-md">Visible Clusters</h2>
      <div className="flex flex-wrap gap-2">
        {clusters.map(c => (
          <label key={c.name} className="flex items-center gap-1 rounded px-2 py-1">
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
                className="btn btn-xs btn-error ml-1"
              >
                ×
              </button>
            )}
          </label>
        ))}
      </div>

      <div className="flex gap-2 items-center">
        <input
          type="text"
          placeholder="New cluster name"
          value={newClusterName}
          onChange={e => setNewClusterName(e.target.value)}
          className="input input-sm input-bordered flex-grow"
          onKeyDown={e => {
            if (e.key === 'Enter') onAddCluster();
          }}
        />
        <select
          className="select select-sm select-bordered"
          value={parentCluster}
          onChange={e => setParentCluster(e.target.value)}
        >
          <option value="">No Parent</option>
          {clusters.map(c => (
            <option key={c.name} value={c.name}>{c.name}</option>
          ))}
        </select>
        <button onClick={onAddCluster} className="btn btn-sm btn-primary">Add</button>
      </div>

      <h2 className="font-bold text-md">Assign Bacteria</h2>
      <div className="max-h-64 overflow-auto border p-2 rounded">
        {bacteria.map(b => (
          <div key={b} className="flex items-center gap-2 mb-1">
            <span className="flex-grow">{b}</span>
            <select
              className="select select-sm select-bordered"
              value={bacteriaClusters[b] || ''}
              onChange={e => updateBacteriaCluster(b, e.target.value)}
            >
              {clustersWithBacteria.map(c => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
              {clusters
                .filter(c => !clustersWithBacteria.includes(c))
                .map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
            </select>
          </div>
        ))}
      </div>

      <h2 className="font-bold text-md mt-4">Bacteria Order in Clusters</h2>
      <div className="max-h-64 overflow-auto border p-2 rounded space-y-4">
        {clustersWithBacteria.map(c => {
          const list = clusterBacteriaOrder[c.name] || [];
          return (
            <div key={c.name}>
              <h3 className="font-semibold">{c.name}</h3>
              {list.map((bact, idx) => (
                <div key={bact} className="flex items-center gap-2">
                  <span className="flex-grow">{bact}</span>
                  <button
                    disabled={idx === 0}
                    onClick={() => {
                      const newList = [...list];
                      [newList[idx - 1], newList[idx]] = [newList[idx], newList[idx - 1]];
                      setClusterBacteriaOrder(prev => ({ ...prev, [c.name]: newList }));
                    }}
                    className="btn btn-xs"
                  >↑</button>
                  <button
                    disabled={idx === list.length - 1}
                    onClick={() => {
                      const newList = [...list];
                      [newList[idx], newList[idx + 1]] = [newList[idx + 1], newList[idx]];
                      setClusterBacteriaOrder(prev => ({ ...prev, [c.name]: newList }));
                    }}
                    className="btn btn-xs"
                  >↓</button>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <h2 className="font-bold text-md mt-4">Visible Phages</h2>
      <div className="max-h-64 overflow-auto border p-2 rounded">
        {headers.map(phage => (
          <label key={phage} className="flex items-center gap-2 mb-1 cursor-pointer">
            <input
              type="checkbox"
              className="checkbox"
              checked={visiblePhages.includes(phage)}
              onChange={() => togglePhage(phage)}
            />
            <span>{phage}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default CustomiserPanel;

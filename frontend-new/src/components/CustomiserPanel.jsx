import React, { useState } from 'react';

const CustomiserPanel = ({
  headers,
  clusters,           // array of { name, parent }
  visibleClusters,    // array of cluster names (strings)
  visiblePhages,
  setVisibleClusters,
  setVisiblePhages,
  bacteria,
  bacteriaClusters,   // object { bacteriaName: clusterName }
  setBacteriaClusters,
  addCluster,         // function(newClusterName, parentName|null)
  deleteCluster,      // function(clusterName)
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
    setBacteriaClusters(prev => ({
      ...prev,
      [bacteriaName]: clusterName,
    }));
    if (!visibleClusters.includes(clusterName)) {
      setVisibleClusters(prev => [...prev, clusterName]);
    }
  };

  const onDeleteCluster = (clusterName) => {
    if (clusterName === 'Default') {
      alert('Cannot delete the Default cluster.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete the cluster "${clusterName}"? This will reassign any bacteria in it to "Default".`)) {
      deleteCluster(clusterName);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="font-bold text-md">Visible Clusters</h2>
      <div className="flex flex-wrap gap-2">
        {clusters.map((c, i) => (
          <label
            key={`${c.name}-${i}`}
            className="flex items-center gap-1 cursor-pointer bg-gray-700 rounded px-2 py-1"
          >
            <input
              type="checkbox"
              className="toggle toggle-sm"
              checked={visibleClusters.includes(c.name)}
              onChange={() => {
                setVisibleClusters(prev =>
                  prev.includes(c.name) ? prev.filter(i => i !== c.name) : [...prev, c.name]
                );
              }}
            />
            <span className="select-none">{c.name}</span>
            {/* Delete button */}
            {c.name !== 'Default' && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  onDeleteCluster(c.name);
                }}
                className="btn btn-xs btn-error ml-1"
                title={`Delete cluster ${c.name}`}
                type="button"
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
        />
        <select
          className="select select-sm select-bordered"
          value={parentCluster}
          onChange={e => setParentCluster(e.target.value)}
        >
          <option value="">No Parent</option>
          {clusters.map((c, i) => (
            <option key={i} value={c.name}>{c.name}</option>
          ))}
        </select>
        <button onClick={onAddCluster} className="btn btn-sm btn-primary">Add</button>
      </div>

      <h2 className="font-bold text-md">Assign Bacteria to Clusters</h2>
      <div className="max-h-64 overflow-auto border p-2 rounded">
        {bacteria.map((b, i) => (
          <div key={`${b}-${i}`} className="flex items-center gap-2 mb-1">
            <span className="flex-grow">{b}</span>
            <select
              className="select select-sm select-bordered"
              value={bacteriaClusters[b] || ''}
              onChange={e => updateBacteriaCluster(b, e.target.value)}
            >
              {clusters.map((c, j) => (
                <option key={`${c.name}-${j}`} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <h2 className="font-bold text-md">Visible Phages</h2>
      <div className="flex flex-wrap gap-2">
        {headers.map((h, i) => (
          <label key={`${h}-${i}`} className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={visiblePhages.includes(h)}
              onChange={() => {
                setVisiblePhages(prev =>
                  prev.includes(h) ? prev.filter(i => i !== h) : [...prev, h]
                );
              }}
              className="checkbox checkbox-sm"
            />
            {h}
          </label>
        ))}
      </div>
    </div>
  );
};

export default CustomiserPanel;

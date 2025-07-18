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
  addCluster,
}) => {
  const [newClusterName, setNewClusterName] = useState('');

  const onAddCluster = () => {
    const trimmed = newClusterName.trim();
    if (trimmed && !clusters.includes(trimmed)) {
      addCluster(trimmed);
      setNewClusterName('');
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

  return (
    <div className="space-y-4">
      {/* Visible Clusters toggles */}
      <h2 className="font-bold text-md">Visible Clusters</h2>
      <div className="flex flex-wrap gap-2">
        {clusters.map((c, i) => (
          <label key={`${c}-${i}`} className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              className="toggle toggle-sm"
              checked={visibleClusters.includes(c)}
              onChange={() => {
                setVisibleClusters(prev => prev.includes(c) ? prev.filter(i => i !== c) : [...prev, c]);
              }}
            />
            {c}
          </label>
        ))}
      </div>

      {/* Add new cluster */}
      <div className="flex gap-2 items-center">
        <input
          type="text"
          placeholder="New cluster name"
          value={newClusterName}
          onChange={e => setNewClusterName(e.target.value)}
          className="input input-sm input-bordered flex-grow"
        />
        <button onClick={onAddCluster} className="btn btn-sm btn-primary">Add Cluster</button>
      </div>

      {/* Assign bacteria to clusters */}
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
                <option key={`${c}-${j}`} value={c}>{c}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Visible Phages toggles */}
      <h2 className="font-bold text-md">Visible Phages</h2>
      <div className="flex flex-wrap gap-2">
        {headers.map((h, i) => (
          <label key={`${h}-${i}`} className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={visiblePhages.includes(h)}
              onChange={() => {
                setVisiblePhages(prev => prev.includes(h) ? prev.filter(i => i !== h) : [...prev, h]);
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

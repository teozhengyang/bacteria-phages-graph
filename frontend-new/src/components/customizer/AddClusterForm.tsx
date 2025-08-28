'use client';

import React, { useState } from 'react';
import { Cluster } from '../../types';

interface AddClusterFormProps {
  clusters: Cluster[];
  onAddCluster: (clusterName: string, parentName: string | null) => void;
}

const AddClusterForm: React.FC<AddClusterFormProps> = ({ clusters, onAddCluster }) => {
  const [newClusterName, setNewClusterName] = useState('');
  const [parentCluster, setParentCluster] = useState('');

  const handleAddCluster = () => {
    const trimmed = newClusterName.trim();
    if (trimmed && !clusters.some(c => c.name === trimmed)) {
      onAddCluster(trimmed, parentCluster || null);
      setNewClusterName('');
      setParentCluster('');
    }
  };

  return (
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
            if (e.key === 'Enter') handleAddCluster();
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
          onClick={handleAddCluster}
          className="btn btn-sm btn-primary flex-shrink-0 hover:brightness-110 transition"
          aria-label="Add new cluster"
        >
          Add
        </button>
      </div>
    </section>
  );
};

export default AddClusterForm;

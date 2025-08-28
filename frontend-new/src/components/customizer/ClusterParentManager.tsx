'use client';

import React from 'react';
import { Cluster } from '../../types';

interface ClusterParentManagerProps {
  clusters: Cluster[];
  onUpdateClusterParent: (clusterName: string, newParent: string) => void;
}

const ClusterParentManager: React.FC<ClusterParentManagerProps> = ({
  clusters,
  onUpdateClusterParent,
}) => {
  return (
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
  );
};

export default ClusterParentManager;

'use client';

import React from 'react';
import { Cluster } from '../../types';

interface VisibleClustersControlProps {
  clusters: Cluster[];
  visibleClusters: string[];
  setVisibleClusters: React.Dispatch<React.SetStateAction<string[]>>;
  onDeleteCluster: (clusterName: string) => void;
}

const VisibleClustersControl: React.FC<VisibleClustersControlProps> = ({
  clusters,
  visibleClusters,
  setVisibleClusters,
  onDeleteCluster,
}) => {
  return (
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
  );
};

export default VisibleClustersControl;

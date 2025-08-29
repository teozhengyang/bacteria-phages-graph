'use client';

import React from 'react';
import { Cluster } from '../../types';

interface VisibleClustersControlProps {
  clusters: Cluster[];
  visibleClusters: string[];
  setVisibleClusters: React.Dispatch<React.SetStateAction<string[]>>;
  onDeleteCluster: (clusterName: string) => void;
  theme?: 'light' | 'dark';
}

const VisibleClustersControl: React.FC<VisibleClustersControlProps> = ({
  clusters,
  visibleClusters,
  setVisibleClusters,
  onDeleteCluster,
  theme = 'light',
}) => {
  const toggleCluster = (cluster: string) => {
    if (visibleClusters.includes(cluster)) {
      setVisibleClusters(prev => prev.filter(c => c !== cluster));
    } else {
      setVisibleClusters(prev => [...prev, cluster]);
    }
  };

  const toggleAll = () => {
    const clusterNames = clusters.map(c => c.name);
    if (visibleClusters.length === clusterNames.length) {
      setVisibleClusters([]);
    } else {
      setVisibleClusters(clusterNames);
    }
  };

  return (
    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} shadow-sm border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`font-semibold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
          Visible Clusters
        </h2>
        <button
          onClick={toggleAll}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
            theme === 'dark'
              ? 'bg-blue-600 hover:bg-blue-500 text-white'
              : 'bg-blue-100 hover:bg-blue-200 text-blue-800'
          }`}
        >
          {visibleClusters.length === clusters.length ? 'Hide All' : 'Show All'}
        </button>
      </div>
      
      <div className="max-h-44 overflow-y-auto space-y-2">
        {clusters.map(cluster => (
          <div
            key={`cluster-${cluster.name}`}
            className={`flex items-center justify-between p-2 rounded-lg transition-all duration-200 ${
              visibleClusters.includes(cluster.name)
                ? theme === 'dark'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-50 text-blue-900 border border-blue-200'
                : theme === 'dark'
                  ? 'bg-gray-600 text-gray-200'
                  : 'bg-gray-50 text-gray-700'
            }`}
          >
            <label className="flex items-center gap-3 cursor-pointer select-none flex-1">
              <input
                type="checkbox"
                className="w-4 h-4 rounded"
                checked={visibleClusters.includes(cluster.name)}
                onChange={() => toggleCluster(cluster.name)}
                aria-label={`Toggle cluster ${cluster.name}`}
              />
              <span className="text-sm">{cluster.name}</span>
            </label>
            <button
              onClick={() => onDeleteCluster(cluster.name)}
              className={`ml-2 p-1 rounded transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-red-600 text-red-300'
                  : 'hover:bg-red-100 text-red-600'
              }`}
              title={`Delete cluster ${cluster.name}`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VisibleClustersControl;

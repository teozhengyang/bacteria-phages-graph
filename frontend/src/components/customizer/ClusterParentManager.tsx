'use client';

import React from 'react';
import { Cluster } from '../../types';

interface ClusterParentManagerProps {
  clusters: Cluster[];
  onUpdateClusterParent: (clusterName: string, newParent: string) => void;
  theme?: 'light' | 'dark';
}

const ClusterParentManager: React.FC<ClusterParentManagerProps> = ({
  clusters,
  onUpdateClusterParent,
  theme = 'light',
}) => {
  const getAvailableParents = (clusterName: string) => {
    return clusters.filter(c => c.name !== clusterName).map(c => c.name);
  };

  return (
    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} shadow-sm border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
      <h2 className={`font-semibold text-lg mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
        Cluster Hierarchy
      </h2>
      <div className="space-y-3">
        {clusters.map(cluster => (
          <div
            key={`parent-${cluster.name}`}
            className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-50'} border ${theme === 'dark' ? 'border-gray-500' : 'border-gray-200'}`}
          >
            <div className="flex items-center justify-between gap-3">
              <label className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                {cluster.name}
              </label>
              <select
                value={cluster.parent || ''}
                onChange={(e) => onUpdateClusterParent(cluster.name, e.target.value)}
                className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-500 text-white focus:border-blue-400'
                    : 'bg-white border-gray-300 text-gray-700 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20`}
                aria-label={`Select parent for cluster ${cluster.name}`}
              >
                <option value="">No Parent</option>
                {getAvailableParents(cluster.name).map(parentName => (
                  <option key={parentName} value={parentName}>
                    {parentName}
                  </option>
                ))}
              </select>
            </div>
            {cluster.parent && (
              <div className={`mt-2 text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                Parent: {cluster.parent}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClusterParentManager;

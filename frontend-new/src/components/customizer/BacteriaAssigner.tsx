'use client';

import React from 'react';
import { 
  Cluster, 
  BacteriaClusters, 
  ClusterBacteriaOrder 
} from '../../types';

interface BacteriaAssignerProps {
  bacteria: string[];
  clusters: Cluster[];
  bacteriaClusters: BacteriaClusters;
  clusterBacteriaOrder: ClusterBacteriaOrder;
  setBacteriaClusters: React.Dispatch<React.SetStateAction<BacteriaClusters>>;
  setClusterBacteriaOrder: React.Dispatch<React.SetStateAction<ClusterBacteriaOrder>>;
  setVisibleClusters: React.Dispatch<React.SetStateAction<string[]>>;
  visibleClusters: string[];
  theme?: 'light' | 'dark';
}

const BacteriaAssigner: React.FC<BacteriaAssignerProps> = ({
  bacteria,
  clusters,
  bacteriaClusters,
  clusterBacteriaOrder,
  setBacteriaClusters,
  setClusterBacteriaOrder,
  setVisibleClusters,
  visibleClusters,
  theme = 'light',
}) => {
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

  const clustersWithBacteria = clusters.filter(
    c => (clusterBacteriaOrder[c.name] || []).filter(b => b != null && b !== '').length > 0
  );

  const filteredBacteria = bacteria.filter(b => b != null && b !== '' && b !== 'undefined');

  return (
    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} shadow-sm border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
      <h2 className={`font-semibold text-lg mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
        Assign Bacteria
      </h2>
      <div className="max-h-44 overflow-y-auto space-y-2">
        {filteredBacteria.map((b, index) => (
          <div 
            key={`bact-${b}-${index}`} 
            className={`flex items-center gap-3 p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-50'} border ${theme === 'dark' ? 'border-gray-500' : 'border-gray-200'}`}
          >
            <span 
              className={`flex-[2] truncate text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`} 
              title={b}
            >
              {b}
            </span>
            <select
              className={`flex-[1] min-w-[90px] max-w-[140px] px-3 py-1.5 text-sm rounded-md border transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-500 text-white focus:border-blue-400'
                  : 'bg-white border-gray-300 text-gray-700 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20`}
              value={bacteriaClusters[b] || ''}
              onChange={e => updateBacteriaCluster(b, e.target.value)}
              aria-label={`Assign cluster for bacteria ${b}`}
            >
              <option value="">Select cluster</option>
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
    </div>
  );
};

export default BacteriaAssigner;

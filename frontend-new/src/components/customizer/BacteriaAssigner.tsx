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
  );
};

export default BacteriaAssigner;

'use client';

import React from 'react';
import { 
  Cluster, 
  ClusterBacteriaOrder, 
  ClusterChildrenOrder 
} from '../../types';
import { moveArrayItem } from '../../utils/arrayUtils';

interface ClusterHierarchyManagerProps {
  clusters: Cluster[];
  clusterBacteriaOrder: ClusterBacteriaOrder;
  clusterChildrenOrder: ClusterChildrenOrder;
  setClusterChildrenOrder: React.Dispatch<React.SetStateAction<ClusterChildrenOrder>>;
  setClusterBacteriaOrder: React.Dispatch<React.SetStateAction<ClusterBacteriaOrder>>;
}

const ClusterHierarchyManager: React.FC<ClusterHierarchyManagerProps> = ({
  clusters,
  clusterBacteriaOrder,
  clusterChildrenOrder,
  setClusterChildrenOrder,
  setClusterBacteriaOrder,
}) => {
  // Helper function to get children of a cluster
  const getClusterChildren = (parentName: string) => {
    return clusters.filter(c => c.parent === parentName);
  };

  // Move child cluster up/down in parent's children order
  const moveChildCluster = (parentName: string, childName: string, direction: 'up' | 'down') => {
    const currentOrder = clusterChildrenOrder[parentName] || getClusterChildren(parentName).map(c => c.name);
    const currentIndex = currentOrder.indexOf(childName);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex >= 0 && newIndex < currentOrder.length) {
      const newOrder = moveArrayItem(currentOrder, currentIndex, newIndex);
      setClusterChildrenOrder(prev => ({ ...prev, [parentName]: newOrder }));
    }
  };

  // Move bacteria up/down in cluster's bacteria order
  const moveBacteria = (clusterName: string, bacteriaName: string, direction: 'up' | 'down') => {
    const currentOrder = clusterBacteriaOrder[clusterName] || [];
    const currentIndex = currentOrder.indexOf(bacteriaName);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex >= 0 && newIndex < currentOrder.length) {
      const newOrder = moveArrayItem(currentOrder, currentIndex, newIndex);
      setClusterBacteriaOrder(prev => ({ ...prev, [clusterName]: newOrder }));
    }
  };

  return (
    <section className="mb-8">
      <h2 className="font-semibold text-lg mb-3 border-b border-base-300 pb-1">Cluster Hierarchy & Children Order</h2>
      <div className="max-h-56 overflow-y-auto border rounded p-2 bg-base-100 shadow-inner space-y-4">
        {clusters
          .filter(parent => getClusterChildren(parent.name).length > 0)
          .map(parent => {
            const children = getClusterChildren(parent.name);
            const orderedChildren = clusterChildrenOrder[parent.name] 
              ? clusterChildrenOrder[parent.name].filter(name => children.some(c => c.name === name))
              : children.map(c => c.name);
            
            return (
              <div key={`hierarchy-${parent.name}`}>
                <h3 className="font-semibold mb-2 text-primary">{parent.name} (Parent)</h3>
                <div className="ml-4 space-y-2">
                  {orderedChildren.map((childName, idx) => {
                    const bacteriaInChild = (clusterBacteriaOrder[childName] || []).filter(b => b != null && b !== '');
                    return (
                      <div key={`child-${childName}`} className="border border-base-300 rounded p-2 bg-base-50">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium flex-grow">{childName}</span>
                          <button
                            disabled={idx === 0}
                            onClick={() => moveChildCluster(parent.name, childName, 'up')}
                            className="btn btn-xs btn-secondary disabled:opacity-30"
                            aria-label={`Move ${childName} up`}
                            title="Move cluster up"
                          >↑</button>
                          <button
                            disabled={idx === orderedChildren.length - 1}
                            onClick={() => moveChildCluster(parent.name, childName, 'down')}
                            className="btn btn-xs btn-secondary disabled:opacity-30"
                            aria-label={`Move ${childName} down`}
                            title="Move cluster down"
                          >↓</button>
                        </div>
                        
                        {/* Bacteria in this child cluster */}
                        {bacteriaInChild.length > 0 && (
                          <div className="ml-4 space-y-1">
                            <p className="text-sm font-medium text-secondary">Bacteria:</p>
                            {bacteriaInChild.map((bacteria, bIdx) => (
                              <div key={`bacteria-${childName}-${bacteria}`} className="flex items-center gap-2 text-sm">
                                <span className="flex-grow truncate">{bacteria}</span>
                                <button
                                  disabled={bIdx === 0}
                                  onClick={() => moveBacteria(childName, bacteria, 'up')}
                                  className="btn btn-xs btn-accent disabled:opacity-30"
                                  aria-label={`Move ${bacteria} up`}
                                  title="Move bacteria up"
                                >↑</button>
                                <button
                                  disabled={bIdx === bacteriaInChild.length - 1}
                                  onClick={() => moveBacteria(childName, bacteria, 'down')}
                                  className="btn btn-xs btn-accent disabled:opacity-30"
                                  aria-label={`Move ${bacteria} down`}
                                  title="Move bacteria down"
                                >↓</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>
    </section>
  );
};

export default ClusterHierarchyManager;

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
  theme?: 'light' | 'dark';
}

const ClusterHierarchyManager: React.FC<ClusterHierarchyManagerProps> = ({
  clusters,
  clusterBacteriaOrder,
  clusterChildrenOrder,
  setClusterChildrenOrder,
  setClusterBacteriaOrder,
  theme = 'light',
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
    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} shadow-sm border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
      <h2 className={`font-semibold text-lg mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
        Cluster Hierarchy & Children Order
      </h2>
      <div className="max-h-56 overflow-y-auto space-y-4">
        {clusters
          .filter(parent => getClusterChildren(parent.name).length > 0)
          .map(parent => {
            const children = getClusterChildren(parent.name);
            const orderedChildren = clusterChildrenOrder[parent.name] 
              ? clusterChildrenOrder[parent.name].filter(name => children.some(c => c.name === name))
              : children.map(c => c.name);
            
            return (
              <div key={`hierarchy-${parent.name}`} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-50'} border ${theme === 'dark' ? 'border-gray-500' : 'border-gray-200'}`}>
                <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`}>
                  {parent.name} (Parent)
                </h3>
                <div className="ml-4 space-y-3">
                  {orderedChildren.map((childName, idx) => {
                    const bacteriaInChild = (clusterBacteriaOrder[childName] || []).filter(b => b != null && b !== '');
                    return (
                      <div 
                        key={`child-${childName}`} 
                        className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} border`}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`font-medium flex-grow ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                            {childName}
                          </span>
                          <button
                            disabled={idx === 0}
                            onClick={() => moveChildCluster(parent.name, childName, 'up')}
                            className={`p-1 rounded transition-colors ${
                              idx === 0
                                ? theme === 'dark'
                                  ? 'text-gray-500 cursor-not-allowed'
                                  : 'text-gray-400 cursor-not-allowed'
                                : theme === 'dark'
                                  ? 'text-blue-400 hover:bg-gray-600'
                                  : 'text-blue-600 hover:bg-blue-50'
                            }`}
                            aria-label={`Move ${childName} up`}
                            title="Move cluster up"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button
                            disabled={idx === orderedChildren.length - 1}
                            onClick={() => moveChildCluster(parent.name, childName, 'down')}
                            className={`p-1 rounded transition-colors ${
                              idx === orderedChildren.length - 1
                                ? theme === 'dark'
                                  ? 'text-gray-500 cursor-not-allowed'
                                  : 'text-gray-400 cursor-not-allowed'
                                : theme === 'dark'
                                  ? 'text-blue-400 hover:bg-gray-600'
                                  : 'text-blue-600 hover:bg-blue-50'
                            }`}
                            aria-label={`Move ${childName} down`}
                            title="Move cluster down"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                        
                        {/* Bacteria in this child cluster */}
                        {bacteriaInChild.length > 0 && (
                          <div className="ml-4 space-y-2">
                            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-green-300' : 'text-green-600'}`}>
                              Bacteria:
                            </p>
                            {bacteriaInChild.map((bacteria, bIdx) => (
                              <div 
                                key={`bacteria-${childName}-${bacteria}`} 
                                className={`flex items-center gap-2 text-sm p-2 rounded ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}
                              >
                                <span className={`flex-grow truncate ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                                  {bacteria}
                                </span>
                                <button
                                  disabled={bIdx === 0}
                                  onClick={() => moveBacteria(childName, bacteria, 'up')}
                                  className={`p-1 rounded transition-colors ${
                                    bIdx === 0
                                      ? theme === 'dark'
                                        ? 'text-gray-500 cursor-not-allowed'
                                        : 'text-gray-400 cursor-not-allowed'
                                      : theme === 'dark'
                                        ? 'text-green-400 hover:bg-gray-700'
                                        : 'text-green-600 hover:bg-green-50'
                                  }`}
                                  aria-label={`Move ${bacteria} up`}
                                  title="Move bacteria up"
                                >
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                  </svg>
                                </button>
                                <button
                                  disabled={bIdx === bacteriaInChild.length - 1}
                                  onClick={() => moveBacteria(childName, bacteria, 'down')}
                                  className={`p-1 rounded transition-colors ${
                                    bIdx === bacteriaInChild.length - 1
                                      ? theme === 'dark'
                                        ? 'text-gray-500 cursor-not-allowed'
                                        : 'text-gray-400 cursor-not-allowed'
                                      : theme === 'dark'
                                        ? 'text-green-400 hover:bg-gray-700'
                                        : 'text-green-600 hover:bg-green-50'
                                  }`}
                                  aria-label={`Move ${bacteria} down`}
                                  title="Move bacteria down"
                                >
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </button>
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
    </div>
  );
};

export default ClusterHierarchyManager;

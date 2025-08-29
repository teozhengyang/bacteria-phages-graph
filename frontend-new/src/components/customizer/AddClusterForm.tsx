'use client';

import React, { useState } from 'react';
import { Cluster } from '../../types';

interface AddClusterFormProps {
  clusters: Cluster[];
  onAddCluster: (clusterName: string, parentName: string | null) => void;
  theme?: 'light' | 'dark';
}

const AddClusterForm: React.FC<AddClusterFormProps> = ({
  clusters,
  onAddCluster,
  theme = 'light',
}) => {
  const [name, setName] = useState('');
  const [parent, setParent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (name.trim() && !clusters.some(c => c.name === name.trim())) {
      onAddCluster(name.trim(), parent || null);
      setName('');
      setParent('');
    }
  };

  const isNameTaken = name.trim() && clusters.some(c => c.name === name.trim());

  return (
    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} shadow-sm border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
      <h2 className={`font-semibold text-lg mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
        Add New Cluster
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label 
            htmlFor="cluster-name" 
            className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}
          >
            Cluster Name *
          </label>
          <input
            id="cluster-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full px-3 py-2 text-sm rounded-md border transition-colors ${
              isNameTaken
                ? theme === 'dark'
                  ? 'border-red-500 bg-gray-800 text-white focus:border-red-400'
                  : 'border-red-500 bg-white text-gray-700 focus:border-red-500'
                : theme === 'dark'
                  ? 'bg-gray-600 border-gray-500 text-white focus:border-blue-400'
                  : 'bg-white border-gray-300 text-gray-700 focus:border-blue-500'
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20`}
            placeholder="Enter cluster name"
            required
            aria-describedby={isNameTaken ? "name-error" : undefined}
          />
          {isNameTaken && (
            <p id="name-error" className={`mt-1 text-xs ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
              A cluster with this name already exists
            </p>
          )}
        </div>

        <div>
          <label 
            htmlFor="cluster-parent" 
            className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}
          >
            Parent Cluster (Optional)
          </label>
          <select
            id="cluster-parent"
            value={parent}
            onChange={(e) => setParent(e.target.value)}
            className={`w-full px-3 py-2 text-sm rounded-md border transition-colors ${
              theme === 'dark'
                ? 'bg-gray-600 border-gray-500 text-white focus:border-blue-400'
                : 'bg-white border-gray-300 text-gray-700 focus:border-blue-500'
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20`}
          >
            <option value="">No Parent</option>
            {clusters.map(cluster => (
              <option key={cluster.name} value={cluster.name}>
                {cluster.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={!name.trim() || !!isNameTaken}
          className={`w-full py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
            !name.trim() || isNameTaken
              ? theme === 'dark'
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : theme === 'dark'
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md hover:shadow-lg'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
          } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
        >
          Add Cluster
        </button>
      </form>
    </div>
  );
};

export default AddClusterForm;

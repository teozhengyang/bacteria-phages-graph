/**
 * Add Cluster Form Component - New Cluster Creation Interface
 * 
 * This component provides a form interface for users to create new clusters
 * in the hierarchical structure. It handles cluster name validation, parent
 * selection, and form submission with comprehensive error handling.
 * 
 * Features:
 * - Cluster name input with duplicate validation
 * - Optional parent cluster selection from existing clusters
 * - Real-time validation feedback
 * - Form submission with proper error handling
 * - Theme-aware styling and accessibility support
 * - Dynamic enable/disable state based on validation
 * 
 * The component ensures data integrity by preventing duplicate cluster names
 * and provides clear feedback when validation fails.
 */

'use client';

import React, { useState } from 'react';
import { Cluster } from '../../types';

/**
 * Props interface for the AddClusterForm component
 * 
 * @interface AddClusterFormProps
 * @property {Cluster[]} clusters - Array of existing clusters for validation
 * @property {Function} onAddCluster - Callback for cluster creation
 * @property {string} [theme] - Current theme for styling consistency
 */
interface AddClusterFormProps {
  clusters: Cluster[];                                                    // Existing clusters for validation
  onAddCluster: (clusterName: string, parentName: string | null) => void; // Cluster creation callback
  theme?: 'light' | 'dark';                                              // Theme for consistent styling
}

/**
 * AddClusterForm Component
 * 
 * Renders a form for creating new clusters with validation and parent selection.
 * Provides real-time feedback and ensures data integrity through validation.
 * 
 * @param {AddClusterFormProps} props - Component props
 * @returns {JSX.Element} Rendered cluster creation form
 */
const AddClusterForm: React.FC<AddClusterFormProps> = ({
  clusters,
  onAddCluster,
  theme = 'light',
}) => {
  // Form state management
  const [name, setName] = useState('');           // Cluster name input value
  const [parent, setParent] = useState('');       // Selected parent cluster

  /**
   * Handle form submission
   * 
   * Validates the form data and creates a new cluster if validation passes.
   * Prevents submission if the cluster name is empty or already exists.
   * Resets form fields after successful submission.
   * 
   * @param {React.FormEvent} e - Form submission event
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate cluster name (non-empty and unique)
    if (name.trim() && !clusters.some(c => c.name === name.trim())) {
      // Create cluster with trimmed name and parent (null if none selected)
      onAddCluster(name.trim(), parent || null);
      
      // Reset form fields after successful creation
      setName('');
      setParent('');
    }
  };

  /**
   * Check if the entered cluster name is already taken
   * 
   * Performs real-time validation to provide immediate feedback to users
   * about naming conflicts before form submission.
   */
  const isNameTaken = name.trim() && clusters.some(c => c.name === name.trim());
  
  /**
   * Handle parent cluster selection changes
   * 
   * Updates the parent state when user selects a different parent cluster.
   * 
   * @param {React.ChangeEvent<HTMLSelectElement>} e - Select change event
   */
  const handleParentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setParent(e.target.value);
  };

  return (
    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} shadow-sm border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
      {/* Form Header */}
      <h2 className={`font-semibold text-lg mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
        Add New Cluster
      </h2>
      
      {/* Cluster Creation Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Cluster Name Input */}
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
            aria-invalid={isNameTaken ? "true" : "false"}
          />
          
          {/* Name Validation Error Message */}
          {isNameTaken && (
            <p id="name-error" className={`mt-1 text-xs ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`} role="alert">
              A cluster with this name already exists
            </p>
          )}
        </div>

        {/* Parent Cluster Selection */}
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
            onChange={handleParentChange}
            className={`w-full px-3 py-2 text-sm rounded-md border transition-colors ${
              theme === 'dark'
                ? 'bg-gray-600 border-gray-500 text-white focus:border-blue-400'
                : 'bg-white border-gray-300 text-gray-700 focus:border-blue-500'
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20`}
            aria-label="Select parent cluster"
          >
            <option value="">No Parent (Root Level)</option>
            {clusters.map(cluster => (
              <option key={cluster.name} value={cluster.name}>
                {cluster.name}
              </option>
            ))}
          </select>
          
          {/* Helper text for parent selection */}
          <p className={`mt-1 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Select a parent to create a nested cluster
          </p>
        </div>

        {/* Submit Button */}
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
          aria-label={!name.trim() ? "Enter a cluster name to continue" : isNameTaken ? "Cluster name already exists" : "Create new cluster"}
        >
          Add Cluster
        </button>
      </form>
    </div>
  );
};

export default AddClusterForm;

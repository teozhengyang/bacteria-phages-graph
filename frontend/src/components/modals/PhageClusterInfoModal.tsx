/**
 * PhageClusterInfoModal Component
 * 
 * An interactive modal interface for exploring relationships between phages and clusters.
 * This component provides two analysis modes:
 * - Cluster Mode: Select multiple clusters to find common phages and their contributing bacteria
 * - Phage Mode: Select multiple phages to find common clusters and their contributing bacteria
 * 
 * Features:
 * - Dual-mode analysis (cluster-to-phage and phage-to-cluster exploration)
 * - Multi-selection interface with checkboxes
 * - Real-time computation of intersection results
 * - Scrollable lists for large datasets
 * - Unique contributor deduplication
 * - Modal overlay with backdrop dismissal
 * - Accessibility features with ARIA labels and roles
 * 
 * Technical Implementation:
 * - Uses Set operations for efficient intersection calculations
 * - Implements useCallback for performance optimization
 * - Provides controlled component pattern for selections
 * - Includes event propagation management for modal behavior
 * - Handles edge cases like empty selections and missing data
 * 
 * @component
 * @example
 * ```tsx
 * <PhageClusterInfoModal
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   data={{ clusters: clusterPhageData }}
 * />
 * ```
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PhageClusterInfoModalProps, PhageClusterResult } from '../../types';

const PhageClusterInfoModal: React.FC<PhageClusterInfoModalProps> = ({ isOpen, onClose, data }) => {
  /* Extract clusters data with safe fallback */
  const { clusters = {} } = data || {};
  
  /* Compute derived data arrays for selection interfaces */
  const allClusters = Object.keys(clusters);
  const allPhages = Array.from(
    new Set(Object.values(clusters).flatMap(clusterPhages => Object.keys(clusterPhages)))
  );

  /* State management for modal functionality */
  const [mode, setMode] = useState<'cluster' | 'phage'>('cluster'); // Analysis mode toggle
  const [selectedItems, setSelectedItems] = useState<string[]>([]); // Currently selected items for analysis
  const [result, setResult] = useState<PhageClusterResult[]>([]); // Computed intersection results

  /**
   * Core computation function for analyzing intersections between selected items
   * 
   * This function handles two analysis modes:
   * 1. Cluster Mode: Finds phages common to all selected clusters
   * 2. Phage Mode: Finds clusters common to all selected phages
   * 
   * The function uses Set operations for efficient intersection calculations
   * and builds contributor lists with bacteria information for each result.
   * 
   * @function computeResult
   */
  const computeResult = useCallback(() => {
    /* Handle empty selection case */
    if (!selectedItems.length) return setResult([]);

    if (mode === 'cluster') {
      /* Cluster Mode: Find phages present in ALL selected clusters */
      const commonPhages = selectedItems.reduce<Set<string>>((acc, clusterName, i) => {
        const phageSet = new Set(Object.keys(clusters[clusterName] || {}));
        /* For first cluster, use all phages; for subsequent ones, find intersection */
        return i === 0 ? phageSet : new Set([...acc].filter(p => phageSet.has(p)));
      }, new Set());

      /* Build detailed contributor information for each common phage */
      const phageBacteriaMap: { [phage: string]: { name: string; cluster: string }[] } = {};
      [...commonPhages].forEach(phage => {
        const contributors: { name: string; cluster: string }[] = [];
        selectedItems.forEach(clusterName => {
          const bacteriaList = clusters[clusterName]?.[phage] || [];
          bacteriaList.forEach(({ name, cluster }) => {
            contributors.push({ name, cluster });
          });
        });
        phageBacteriaMap[phage] = contributors;
      });

      /* Convert to result format */
      setResult(
        Object.entries(phageBacteriaMap).map(([phage, contributors]) => ({
          label: phage,
          contributors,
        }))
      );
    } else {
      /* Phage Mode: Find clusters that contain ALL selected phages */
      const clusterSet = selectedItems.reduce<Set<string>>((acc, phage, i) => {
        const clustersWithPhage = Object.entries(clusters)
          .filter(([, phageMap]) => phageMap[phage])
          .map(([c]) => c);
        /* For first phage, use all clusters; for subsequent ones, find intersection */
        return i === 0 ? new Set(clustersWithPhage) : new Set([...acc].filter(c => clustersWithPhage.includes(c)));
      }, new Set());

      /* Build detailed contributor information for each common cluster */
      const clusterBacteriaMap: { [cluster: string]: { name: string; cluster: string }[] } = {};
      [...clusterSet].forEach(clusterName => {
        const contributors: { name: string; cluster: string }[] = [];
        selectedItems.forEach(phage => {
          const bacteriaList = clusters[clusterName]?.[phage] || [];
          bacteriaList.forEach(({ name, cluster }) => {
            contributors.push({ name, cluster });
          });
        });
        clusterBacteriaMap[clusterName] = contributors;
      });

      /* Convert to result format */
      setResult(
        Object.entries(clusterBacteriaMap).map(([cluster, contributors]) => ({
          label: cluster,
          contributors,
        }))
      );
    }
  }, [selectedItems, mode, clusters]);

  /**
   * Effect hook to trigger result computation when modal opens or dependencies change
   * Only computes when modal is open to avoid unnecessary calculations
   */
  useEffect(() => {
    if (!isOpen) return;
    computeResult();
  }, [isOpen, computeResult]);

  /**
   * Toggle function for selecting/deselecting items in the analysis
   * 
   * @param {string} item - The item (cluster or phage) to toggle
   */
  const toggleItem = (item: string) => {
    setSelectedItems(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  /* Early return for closed modal */
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-start pt-20 z-50 overflow-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* Main modal content container */}
      <div
        className="bg-base-100 text-base-content rounded-lg p-6 max-w-3xl w-full max-h-[80vh] overflow-auto relative shadow-lg"
        onClick={e => e.stopPropagation()} /* Prevent backdrop click when clicking inside modal */
      >
        {/* Modal header */}
        <h2 className="text-2xl font-bold mb-4">Phage & Cluster Explorer</h2>

        {/* Close button with accessibility features */}
        <button
          className="btn btn-sm btn-outline absolute top-4 right-4"
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>

        {/* Mode selection interface */}
        <div className="mb-4">
          <label className="mr-4 font-semibold">Mode:</label>
          <select
            className="select select-sm select-bordered"
            value={mode}
            onChange={e => setMode(e.target.value as 'cluster' | 'phage')}
          >
            <option value="cluster">Select Clusters</option>
            <option value="phage">Select Phages</option>
          </select>
        </div>

        {/* Selection grid for clusters or phages */}
        <div className="grid grid-cols-2 gap-2 mb-6 max-h-48 overflow-auto">
          {(mode === 'cluster' ? allClusters : allPhages).map(item => (
            <label key={item} className="cursor-pointer flex items-center space-x-2">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={selectedItems.includes(item)}
                onChange={() => toggleItem(item)}
              />
              <span>{item}</span>
            </label>
          ))}
        </div>

        {/* Results section */}
        <div>
          <h3 className="text-xl font-semibold mb-2">
            {mode === 'cluster' ? 'Common Phages & Contributing Bacteria' : 'Common Clusters & Contributing Bacteria'}
          </h3>
          {result.length > 0 ? (
            result.map(({ label, contributors }) => {
              {/* Deduplicate contributors to avoid showing the same bacteria multiple times */}
              const uniqueContributors = Array.from(
                new Map(contributors.map(c => [`${c.name}|${c.cluster}`, c])).values()
              );

              return (
                /* Individual result item */
                <div key={label} className="mb-3">
                  <strong>{label}:</strong>
                  {/* Scrollable list of contributing bacteria */}
                  <ul className="ml-4 list-disc max-h-40 overflow-auto">
                    {uniqueContributors.map(({ name, cluster }, i) => (
                      <li key={`${label}-${name}-${cluster}-${i}`}>
                        {name} <span className="text-xs text-base-content/60">({cluster})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })
          ) : (
            /* Empty state message */
            <p className="italic text-base-content/60">No common results found for selected items.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhageClusterInfoModal;

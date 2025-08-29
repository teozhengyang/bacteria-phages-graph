/**
 * Phage Cluster Information Aggregator
 * 
 * This utility processes the hierarchical tree data to generate comprehensive
 * statistics about phage-bacteria interactions organized by clusters.
 * 
 * The aggregation process:
 * 1. Traverses the entire tree structure recursively
 * 2. Identifies bacteria with non-zero phage interactions
 * 3. Groups interactions by cluster and phage
 * 4. Creates a comprehensive mapping for modal display
 * 
 * Used primarily for generating data for the PhageClusterInfoModal.
 */

import { TreeNode, PhageClusterData } from '../types';

/**
 * Aggregate phage-bacteria interaction data by clusters
 * 
 * Processes the hierarchical tree structure to create a comprehensive
 * mapping of phage interactions organized by clusters. This data is used
 * to show detailed statistics in the cluster information modal.
 * 
 * @param {TreeNode | null} treeData - The hierarchical tree structure
 * @param {string[]} headers - Array of phage names from the original data
 * @returns {PhageClusterData | null} Aggregated cluster information or null if no data
 */
export function aggregatePhageClusterInfo(treeData: TreeNode | null, headers: string[]): PhageClusterData | null {
  // Return null if no tree data is available
  if (!treeData) return null;

  // Main data structure: cluster -> phage -> contributing bacteria
  const clusterPhageBacteriaMap: { 
    [clusterName: string]: { 
      [phageName: string]: { name: string; cluster: string }[] 
    } 
  } = {};

  /**
   * Recursively process each cluster node to extract phage interaction data
   * 
   * For each cluster, this function:
   * 1. Processes all child clusters recursively
   * 2. Processes all bacteria in the current cluster
   * 3. Aggregates phage interactions for the current cluster
   * 4. Returns a summary for parent clusters to use
   * 
   * @param {TreeNode} node - Current cluster node being processed
   * @returns {Object} Phage interaction map for this cluster and all descendants
   */
  function processCluster(node: TreeNode): { [phageName: string]: { name: string; cluster: string }[] } {
    // Return empty if this node has no children
    if (!node.children || node.children.length === 0) return {};

    // Local phage map for this cluster level
    const phageMap: { [phageName: string]: { name: string; cluster: string }[] } = {};
    let hasBacteria = false; // Track if this cluster directly contains bacteria

    // Process each child node
    node.children.forEach(child => {
      if (child.children && child.children.length > 0) {
        // Child is a sub-cluster - process recursively
        const childPhageMap = processCluster(child);
        
        // Merge child cluster's phage interactions into current level
        for (const [phage, bactList] of Object.entries(childPhageMap)) {
          if (!phageMap[phage]) phageMap[phage] = [];
          phageMap[phage].push(...bactList);
        }
      } else {
        // Child is a bacteria node - process its interactions
        hasBacteria = true;
        
        // Check each phage for interactions with this bacteria
        headers.forEach((phage, idx) => {
          const val = child.values?.[idx] ?? 0; // Get interaction value (default to 0)
          
          // Only record positive interactions (non-zero values)
          if (val > 0) {
            if (!phageMap[phage]) phageMap[phage] = [];
            phageMap[phage].push({ 
              name: child.name,        // Bacteria name
              cluster: node.name       // Current cluster name
            });
          }
        });
      }
    });

    // Store cluster data if it contains bacteria or has interaction data
    if (hasBacteria || Object.keys(phageMap).length > 0) {
      clusterPhageBacteriaMap[node.name] = {};
      
      // Copy phage interaction data to the main cluster map
      for (const [phage, bactList] of Object.entries(phageMap)) {
        clusterPhageBacteriaMap[node.name][phage] = bactList;
      }
    }

    // Return phage map for parent clusters to aggregate
    return phageMap;
  }

  // Start processing from the root of the tree
  processCluster(treeData);

  // Return the complete aggregated data structure
  return {
    clusters: clusterPhageBacteriaMap,
  };
}

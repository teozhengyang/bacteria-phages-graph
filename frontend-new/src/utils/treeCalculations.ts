/**
 * Tree Calculations Utilities - Hierarchical Layout Algorithm
 * 
 * This module provides sophisticated algorithms for calculating positions and
 * layouts in hierarchical tree structures. It's specifically designed for the
 * bacteria-phage visualization where clusters and bacteria need to be positioned
 * in a visually pleasing and logically organized manner.
 * 
 * Key Features:
 * - Hierarchical tree layout with custom spacing
 * - Cluster visibility management
 * - Custom ordering for children and bacteria
 * - Dynamic height calculation based on content
 * - Recursive position assignment algorithms
 * 
 * These calculations form the foundation for the D3.js visualization,
 * providing the mathematical backbone for the interactive tree display.
 */

import * as d3 from 'd3';
import { TreeNode } from '../types';

/**
 * Extended TreeNode interface with visibility flag
 * 
 * Extends the base TreeNode to include a visibility flag used for
 * controlling which clusters are displayed in the visualization.
 */
export interface TreeNodeData extends TreeNode {
  _visible?: boolean;    // Flag indicating if this node should be visible
}

/**
 * Extended D3 hierarchy node with positioning and layout data
 * 
 * Extends the D3 HierarchyNode to include positioning coordinates
 * and layout-specific properties for the visualization.
 */
export type HierarchyNodeExtended = d3.HierarchyNode<TreeNodeData> & {
  x?: number;           // X coordinate for positioning
  y?: number;           // Y coordinate for positioning
  clusterHeight?: number; // Calculated height of this cluster subtree
};

/**
 * Mark cluster visibility recursively through the tree
 * 
 * This function traverses the tree structure and marks each node with
 * a visibility flag based on the provided set of visible cluster names.
 * It ensures that the visibility information propagates through the
 * entire hierarchy for rendering decisions.
 * 
 * @param {TreeNode} node - The current tree node to process
 * @param {Set<string>} visibleSet - Set of cluster names that should be visible
 * @returns {TreeNodeData} Node with visibility information attached
 */
export function markClusterVisibility(node: TreeNode, visibleSet: Set<string>): TreeNodeData {
  // Check if this cluster should be visible
  const isVisible = visibleSet.has(node.name);
  
  return {
    ...node,
    _visible: isVisible,
    // Recursively process children if they exist
    children: node.children
      ? node.children.map((child: TreeNode) => markClusterVisibility(child, visibleSet))
      : undefined,
  };
}

/**
 * Reorder cluster children according to custom ordering
 * 
 * This function applies custom ordering to cluster children based on the
 * provided ordering configuration. It recursively processes the tree to
 * ensure all levels respect the custom ordering preferences.
 * 
 * @param {HierarchyNodeExtended} node - The parent node whose children need reordering
 * @param {Record<string, string[]>} clusterChildrenOrder - Mapping of cluster names to child order
 */
export function reorderChildren(
  node: HierarchyNodeExtended, 
  clusterChildrenOrder: Record<string, string[]>
): void {
  // Early return if no children to reorder
  if (!node.children) return;
  
  // Apply custom ordering if specified for this cluster
  if (clusterChildrenOrder[node.data.name]) {
    const order = clusterChildrenOrder[node.data.name];
    
    // Sort children based on their position in the custom order array
    node.children.sort(
      (a: HierarchyNodeExtended, b: HierarchyNodeExtended) => 
        order.indexOf(a.data.name) - order.indexOf(b.data.name)
    );
  }
  
  // Recursively apply reordering to all child clusters
  node.children.forEach((child: HierarchyNodeExtended) => 
    reorderChildren(child, clusterChildrenOrder)
  );
}

/**
 * Get direct bacteria children of a cluster in custom order
 * 
 * This function extracts the bacteria (leaf nodes) that are direct children
 * of a cluster and orders them according to the specified bacteria ordering.
 * It separates bacteria from sub-clusters for layout purposes.
 * 
 * @param {HierarchyNodeExtended} clusterNode - The cluster node to get bacteria from
 * @param {Record<string, string[]>} clusterBacteriaOrder - Custom ordering for bacteria within clusters
 * @returns {HierarchyNodeExtended[]} Array of bacteria nodes in the specified order
 */
export function getDirectBacteriaNodes(
  clusterNode: HierarchyNodeExtended,
  clusterBacteriaOrder: Record<string, string[]>
): HierarchyNodeExtended[] {
  // Early return if no children
  if (!clusterNode.children) return [];
  
  // Filter to get only bacteria (nodes without children)
  let bacteriaNodes = clusterNode.children.filter(
    (child: HierarchyNodeExtended) => !child.children
  ) as HierarchyNodeExtended[];
  
  // Apply custom ordering if specified for this cluster
  const order = clusterBacteriaOrder[clusterNode.data.name];
  if (order) {
    // Reorder bacteria according to the custom order
    bacteriaNodes = order
      .map(name => bacteriaNodes.find(b => b.data.name === name))
      .filter(Boolean) as HierarchyNodeExtended[];
  }
  
  return bacteriaNodes;
}

/**
 * Compute the total height required for a tree node and its subtree
 * 
 * This function recursively calculates the vertical space needed to display
 * a cluster and all its children (both bacteria and sub-clusters). It considers
 * spacing requirements and hierarchical relationships for optimal layout.
 * 
 * @param {HierarchyNodeExtended} node - The node to calculate height for
 * @param {Record<string, string[]>} clusterBacteriaOrder - Custom bacteria ordering
 * @param {number} bacteriaSpacing - Vertical spacing between bacteria
 * @param {number} clusterSpacing - Vertical spacing between clusters
 * @returns {number} Total height required for this node and its subtree
 */
export function computeHeight(
  node: HierarchyNodeExtended,
  clusterBacteriaOrder: Record<string, string[]>,
  bacteriaSpacing: number,
  clusterSpacing: number
): number {
  // Leaf nodes (bacteria) only need spacing for themselves
  if (!node.children) return bacteriaSpacing;

  // Get direct bacteria and child clusters
  const directBacteria = getDirectBacteriaNodes(node, clusterBacteriaOrder);
  const childClusters = node.children.filter(
    (c: HierarchyNodeExtended) => c.children
  ) as HierarchyNodeExtended[];

  // Calculate height needed for direct bacteria
  const bacteriaHeight = directBacteria.length > 0 ? directBacteria.length * bacteriaSpacing : 0;

  // Calculate height needed for child clusters
  let childrenHeight = 0;
  childClusters.forEach((child, index) => {
    childrenHeight += computeHeight(child, clusterBacteriaOrder, bacteriaSpacing, clusterSpacing);
    // Add spacing between child clusters (except after the last one)
    if (index < childClusters.length - 1) childrenHeight += clusterSpacing;
  });

  // Add spacing between bacteria and clusters if both exist
  const spacingBetweenBacteriaAndClusters = 
    (directBacteria.length > 0 && childClusters.length > 0) ? clusterSpacing : 0;

  // Calculate total height and store it for later use
  const totalHeight = bacteriaHeight + spacingBetweenBacteriaAndClusters + childrenHeight;
  node.clusterHeight = totalHeight;
  
  return totalHeight;
}

/**
 * Assign X,Y positions to all nodes in the tree structure
 * 
 * This function performs the final layout calculation, assigning specific
 * coordinates to each node in the tree. It creates a visually pleasing
 * hierarchical layout with proper spacing and alignment.
 * 
 * @param {HierarchyNodeExtended} node - The current node to position
 * @param {number} startY - Starting Y coordinate for this subtree
 * @param {Record<string, string[]>} clusterBacteriaOrder - Custom bacteria ordering
 * @param {number} clusterWidth - Horizontal width between cluster levels
 * @param {number} bacteriaSpacing - Vertical spacing between bacteria
 * @param {number} clusterSpacing - Vertical spacing between clusters
 * @param {number} currentX - Current X coordinate (horizontal level)
 * @returns {number} Total height used by this subtree
 */
export function assignPositions(
  node: HierarchyNodeExtended,
  startY: number,
  clusterBacteriaOrder: Record<string, string[]>,
  clusterWidth: number,
  bacteriaSpacing: number,
  clusterSpacing: number,
  currentX: number = 0
): number {
  // Position leaf nodes (bacteria) directly
  if (!node.children) {
    node.x = currentX;
    node.y = startY;
    return bacteriaSpacing;
  }

  // Get components for layout calculation
  const directBacteria = getDirectBacteriaNodes(node, clusterBacteriaOrder);
  const childClusters = node.children.filter(
    (c: HierarchyNodeExtended) => c.children
  ) as HierarchyNodeExtended[];

  // Calculate space requirements
  const bacteriaHeight = directBacteria.length > 0 ? directBacteria.length * bacteriaSpacing : 0;

  let childrenHeight = 0;
  childClusters.forEach((child, index) => {
    childrenHeight += computeHeight(child, clusterBacteriaOrder, bacteriaSpacing, clusterSpacing);
    if (index < childClusters.length - 1) childrenHeight += clusterSpacing;
  });

  const spacingBetweenBacteriaAndClusters = 
    (directBacteria.length > 0 && childClusters.length > 0) ? clusterSpacing : 0;
  const totalHeight = bacteriaHeight + spacingBetweenBacteriaAndClusters + childrenHeight;

  // Position the cluster node at the center of its content
  node.x = currentX;
  node.y = startY + totalHeight / 2;

  // Position direct bacteria to the right of the cluster
  const stackedX = currentX + clusterWidth;
  let currentY = startY;

  directBacteria.forEach((bactNode) => {
    bactNode.x = stackedX;
    bactNode.y = currentY + bacteriaSpacing / 2;
    currentY += bacteriaSpacing;
  });

  // Add spacing between bacteria and child clusters
  if (directBacteria.length > 0 && childClusters.length > 0) {
    currentY += clusterSpacing;
  }

  // Recursively position child clusters
  childClusters.forEach((child, index) => {
    assignPositions(
      child, 
      currentY, 
      clusterBacteriaOrder, 
      clusterWidth, 
      bacteriaSpacing, 
      clusterSpacing, 
      stackedX
    );
    currentY += child.clusterHeight!;
    if (index < childClusters.length - 1) {
      currentY += clusterSpacing;
    }
  });

  return totalHeight;
}

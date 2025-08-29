import * as d3 from 'd3';
import { TreeNode } from '../types';

export interface TreeNodeData extends TreeNode {
  _visible?: boolean;
}

export type HierarchyNodeExtended = d3.HierarchyNode<TreeNodeData> & {
  x?: number;
  y?: number;
  clusterHeight?: number;
};

/**
 * Mark cluster visibility recursively
 */
export function markClusterVisibility(node: TreeNode, visibleSet: Set<string>): TreeNodeData {
  const isVisible = visibleSet.has(node.name);
  return {
    ...node,
    _visible: isVisible,
    children: node.children
      ? node.children.map((child: TreeNode) => markClusterVisibility(child, visibleSet))
      : undefined,
  };
}

/**
 * Reorder children clusters according to clusterChildrenOrder
 */
export function reorderChildren(
  node: HierarchyNodeExtended, 
  clusterChildrenOrder: Record<string, string[]>
): void {
  if (!node.children) return;
  if (clusterChildrenOrder[node.data.name]) {
    const order = clusterChildrenOrder[node.data.name];
    node.children.sort(
      (a: HierarchyNodeExtended, b: HierarchyNodeExtended) => 
        order.indexOf(a.data.name) - order.indexOf(b.data.name)
    );
  }
  node.children.forEach((child: HierarchyNodeExtended) => 
    reorderChildren(child, clusterChildrenOrder)
  );
}

/**
 * Get bacteria children ordered by clusterBacteriaOrder
 */
export function getDirectBacteriaNodes(
  clusterNode: HierarchyNodeExtended,
  clusterBacteriaOrder: Record<string, string[]>
): HierarchyNodeExtended[] {
  if (!clusterNode.children) return [];
  
  let bacteriaNodes = clusterNode.children.filter(
    (child: HierarchyNodeExtended) => !child.children
  ) as HierarchyNodeExtended[];
  
  const order = clusterBacteriaOrder[clusterNode.data.name];
  if (order) {
    bacteriaNodes = order
      .map(name => bacteriaNodes.find(b => b.data.name === name))
      .filter(Boolean) as HierarchyNodeExtended[];
  }
  
  return bacteriaNodes;
}

/**
 * Compute height for tree layout
 */
export function computeHeight(
  node: HierarchyNodeExtended,
  clusterBacteriaOrder: Record<string, string[]>,
  bacteriaSpacing: number,
  clusterSpacing: number
): number {
  if (!node.children) return bacteriaSpacing;

  const directBacteria = getDirectBacteriaNodes(node, clusterBacteriaOrder);
  const childClusters = node.children.filter(
    (c: HierarchyNodeExtended) => c.children
  ) as HierarchyNodeExtended[];

  const bacteriaHeight = directBacteria.length > 0 ? directBacteria.length * bacteriaSpacing : 0;

  let childrenHeight = 0;
  childClusters.forEach((child, index) => {
    childrenHeight += computeHeight(child, clusterBacteriaOrder, bacteriaSpacing, clusterSpacing);
    if (index < childClusters.length - 1) childrenHeight += clusterSpacing;
  });

  const spacingBetweenBacteriaAndClusters = 
    (directBacteria.length > 0 && childClusters.length > 0) ? clusterSpacing : 0;

  const totalHeight = bacteriaHeight + spacingBetweenBacteriaAndClusters + childrenHeight;
  node.clusterHeight = totalHeight;
  return totalHeight;
}

/**
 * Assign positions for tree layout
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
  if (!node.children) {
    node.x = currentX;
    node.y = startY;
    return bacteriaSpacing;
  }

  const directBacteria = getDirectBacteriaNodes(node, clusterBacteriaOrder);
  const childClusters = node.children.filter(
    (c: HierarchyNodeExtended) => c.children
  ) as HierarchyNodeExtended[];

  const bacteriaHeight = directBacteria.length > 0 ? directBacteria.length * bacteriaSpacing : 0;

  let childrenHeight = 0;
  childClusters.forEach((child, index) => {
    childrenHeight += computeHeight(child, clusterBacteriaOrder, bacteriaSpacing, clusterSpacing);
    if (index < childClusters.length - 1) childrenHeight += clusterSpacing;
  });

  const spacingBetweenBacteriaAndClusters = 
    (directBacteria.length > 0 && childClusters.length > 0) ? clusterSpacing : 0;
  const totalHeight = bacteriaHeight + spacingBetweenBacteriaAndClusters + childrenHeight;

  node.x = currentX;
  node.y = startY + totalHeight / 2;

  const stackedX = currentX + clusterWidth;
  let currentY = startY;

  directBacteria.forEach((bactNode) => {
    bactNode.x = stackedX;
    bactNode.y = currentY + bacteriaSpacing / 2;
    currentY += bacteriaSpacing;
  });

  if (directBacteria.length > 0 && childClusters.length > 0) {
    currentY += clusterSpacing;
  }

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

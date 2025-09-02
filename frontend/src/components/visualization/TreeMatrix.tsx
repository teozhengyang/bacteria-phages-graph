/**
 * TreeMatrix Component - Main Visualization Component
 * 
 * This is the primary visualization component that renders the bacteria-phage
 * interaction matrix using D3.js. It displays bacteria organized in clusters
 * with their interactions with various phages shown as a heatmap-style matrix.
 * 
 * Key Features:
 * - Hierarchical cluster visualization
 * - Interactive phage-bacteria matrix
 * - Save functionality for visualization export
 * - Theme-aware rendering
 * - Responsive layout
 * - Context-based state management
 */

'use client';

import React, { useRef } from 'react';
import { useTheme, useData } from '../../context';
import { TreeNode, ClusterBacteriaOrder, ClusterChildrenOrder } from '../../types';
import TreeMatrixControls from './TreeMatrixControls';
import { useTreeVisualization } from '../../hooks/useTreeVisualization';
import { useSaveVisualization } from '../../hooks/useSaveVisualization';

/**
 * Props interface for TreeMatrix component
 */
interface TreeMatrixProps {
  treeData: TreeNode | null; // Hierarchical tree structure
  visibleClusters: string[];
  visiblePhages: string[];
  bacteriaClusterOrderArr: string[];
  clusterBacteriaOrder: ClusterBacteriaOrder;
  clusterChildrenOrder: ClusterChildrenOrder;
}

/**
 * TreeMatrix - Primary visualization component
 * 
 * Renders the bacteria-phage interaction matrix with hierarchical clustering.
 * Uses D3.js for complex data visualization with custom hooks managing the
 * visualization logic and interaction handling.
 * 
 * @param {TreeMatrixProps} props - Component props containing data and configuration
 * @returns {JSX.Element} The complete visualization with controls
 */
const TreeMatrix: React.FC<TreeMatrixProps> = ({
  treeData,              // Hierarchical tree structure of bacteria and clusters
  visibleClusters,       // Clusters currently visible in the visualization
  visiblePhages,         // Phages currently visible in the visualization
  clusterChildrenOrder,  // Custom ordering for nested clusters
  clusterBacteriaOrder   // Custom ordering for bacteria within clusters
}) => {
  // Get theme and headers from context
  const { theme } = useTheme();
  const { data } = useData();
  const headers = data?.headers || [];
  
  // Reference to the SVG element for D3 manipulation
  const svgRef = useRef<SVGSVGElement>(null);
  
  /**
   * Initialize and manage the D3 visualization
   * This hook handles all the complex D3.js logic including:
   * - SVG setup and dimensions
   * - Data binding and updates
   * - Interactive elements (hover, click)
   * - Matrix rendering and styling
   * - Cluster hierarchy visualization
   */
  useTreeVisualization(svgRef, {
    treeData,
    headers,
    visibleClusters,
    visiblePhages,
    theme,
    clusterChildrenOrder,
    clusterBacteriaOrder,
  });

  /**
   * Provide save/export functionality for the visualization
   * Allows users to download the current visualization as an image
   */
  const { handleSave } = useSaveVisualization(svgRef, theme);

  return (
    <div className="relative">
      {/* Control panel for visualization actions */}
      <TreeMatrixControls 
        onSave={handleSave}  // Pass save handler to controls
        theme={theme}        // Pass theme for styling consistency
      />
      
      {/* Main SVG canvas for D3 visualization */}
      {/* The ref allows direct DOM manipulation by D3 */}
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default TreeMatrix;

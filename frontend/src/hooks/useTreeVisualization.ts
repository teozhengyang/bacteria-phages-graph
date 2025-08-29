/**
 * D3 Tree Visualization Hook
 * 
 * This is the core visualization hook that manages all D3.js rendering for the
 * bacteria-phage interaction matrix. It handles complex hierarchical data
 * visualization with interactive features including hover effects, click handlers,
 * and theme-aware styling.
 * 
 * Key Responsibilities:
 * - Transform hierarchical tree data into D3 hierarchy
 * - Calculate positioning for clusters and bacteria
 * - Render interactive matrix cells with phage-bacteria interactions
 * - Handle mouse interactions (hover, click events)
 * - Apply theme-aware colors and styling
 * - Manage dynamic resizing and updates
 * 
 * The visualization consists of:
 * - Hierarchical cluster structure on the left
 * - Bacteria names as row labels
 * - Phage names as column headers
 * - Interactive matrix cells showing interaction presence/absence
 */

import { useEffect, RefObject } from 'react';
import * as d3 from 'd3';
import { TreeNode } from '../types';
import { colours, UI_CONSTANTS } from '../constants';
import { getColorTheme } from '../utils/visualizationUtils';
import {
  markClusterVisibility,
  reorderChildren,
  getDirectBacteriaNodes,
  computeHeight,
  assignPositions,
  HierarchyNodeExtended,
} from '../utils/treeCalculations';

/**
 * Props interface for the tree visualization hook
 * Contains all data and configuration needed for rendering
 */
interface UseTreeVisualizationProps {
  treeData: TreeNode | null;                           // Hierarchical tree structure
  headers: string[];                                   // Phage names for column headers
  visibleClusters: string[];                          // Currently visible clusters
  visiblePhages: string[];                            // Currently visible phages
  theme: 'light' | 'dark';                           // Current theme setting
  clusterChildrenOrder: Record<string, string[]>;     // Custom cluster ordering
  clusterBacteriaOrder: Record<string, string[]>;     // Custom bacteria ordering
}

/**
 * D3 Tree Visualization Hook
 * 
 * Manages the complete D3.js visualization lifecycle including:
 * - Data processing and hierarchy creation
 * - SVG element creation and manipulation
 * - Interactive behavior implementation
 * - Theme-aware styling application
 * - Dynamic updates on data changes
 * 
 * @param {RefObject<SVGSVGElement | null>} svgRef - React ref to SVG element
 * @param {UseTreeVisualizationProps} props - Visualization data and configuration
 */
export function useTreeVisualization(
  svgRef: RefObject<SVGSVGElement | null>,
  props: UseTreeVisualizationProps
) {
  const {
    treeData,              // The hierarchical data structure to visualize
    headers,               // Phage names for matrix columns
    visibleClusters,       // Clusters to display in the visualization
    visiblePhages,         // Phages to display in the matrix
    theme,                 // Light or dark theme setting
    clusterChildrenOrder,  // Custom ordering for nested clusters
    clusterBacteriaOrder,  // Custom ordering for bacteria within clusters
  } = props;

  /**
   * Main visualization effect - runs when data or configuration changes
   * 
   * This effect handles the complete D3 visualization process:
   * 1. Data validation and preprocessing
   * 2. Theme and color setup
   * 3. Hierarchy processing with custom ordering
   * 4. Position calculations for all elements
   * 5. SVG rendering of clusters, bacteria, and matrix
   * 6. Interactive behavior setup
   */
  useEffect(() => {
    // Early return if required data is not available
    if (!treeData || !svgRef.current) return;

    // Setup theme-aware colors and SVG reference
    const isDark = theme === 'dark';
    const colors = getColorTheme(isDark);
    const svg = d3.select(svgRef.current);
    
    // Clear any existing visualization content
    svg.selectAll('*').remove();
    svg.style('background-color', colors.svgBackground);

    /**
     * Layout and Dimension Constants
     * Configure spacing, sizing, and positioning parameters for the visualization
     */
    const margin = UI_CONSTANTS.MARGIN;
    const cellSize = UI_CONSTANTS.CELL_SIZE;              // Size of each matrix cell
    const clusterWidth = UI_CONSTANTS.CLUSTER_WIDTH;      // Width for cluster labels
    const bacteriaSpacing = UI_CONSTANTS.BACTERIA_SPACING; // Vertical spacing between bacteria
    const clusterSpacing = UI_CONSTANTS.CLUSTER_SPACING;  // Vertical spacing between clusters
    
    // Add extra space at the top for the save button and controls
    const saveButtonSpace = 80;
    const adjustedMarginTop = margin.TOP + saveButtonSpace;
    
    // Base positioning offsets
    const offsetX = margin.LEFT;
    const clusterLabelOffsetX = UI_CONSTANTS.CLUSTER_LABEL_OFFSET_X;
    const bacteriaLabelOffsetX = UI_CONSTANTS.BACTERIA_LABEL_OFFSET_X;

    /**
     * Data Preprocessing and Hierarchy Setup
     * 
     * Process the tree data to mark visibility, create D3 hierarchy,
     * and apply custom ordering for clusters and bacteria
     */
    
    // Mark clusters as visible/hidden based on user selections
    const visibleSet = new Set(visibleClusters);
    const markedTreeData = markClusterVisibility(treeData, visibleSet);
    
    // Create D3 hierarchy from the processed tree data
    const root = d3.hierarchy(markedTreeData) as HierarchyNodeExtended;

    // Apply custom ordering to cluster children based on user preferences
    reorderChildren(root, clusterChildrenOrder);

    /**
     * Color Scale Setup
     * 
     * Create a color scale for cluster differentiation using the predefined
     * color palette. Each cluster gets a unique color for visual distinction.
     */
    const allClusters = root
      .descendants()
      .filter((d: HierarchyNodeExtended) => d.children) // Only cluster nodes (not bacteria)
      .map((d: HierarchyNodeExtended) => d.data.name);

    const clusterColorScale = d3
      .scaleOrdinal<string>()
      .domain(allClusters)
      .range(colours);

    /**
     * Position Calculations
     * 
     * Calculate the positioning for all elements in the visualization.
     * This involves computing heights for clusters, assigning coordinates,
     * and ensuring proper spacing between elements.
     */
    
    // Calculate cluster heights and bacteria spacing within clusters
    computeHeight(root, clusterBacteriaOrder, bacteriaSpacing, clusterSpacing);
    
    // Assign X and Y positions to all nodes in the hierarchy
    assignPositions(root, 0, clusterBacteriaOrder, clusterWidth, bacteriaSpacing, clusterSpacing, -clusterWidth / 2);

    /**
     * Layout Dimensions and Offsets
     * 
     * Calculate the overall SVG dimensions and ensure proper positioning
     * relative to controls and margins. Handle negative positions by
     * applying appropriate offsets.
     */
    
    // Get position bounds from all nodes
    const allYPositions = root.descendants().map((d: HierarchyNodeExtended) => d.y!);
    const allXPositions = root.descendants().map((d: HierarchyNodeExtended) => d.x!);
    const minY = d3.min(allYPositions) || 0;
    const maxY = d3.max(allYPositions) || 0;
    const maxX = d3.max(allXPositions) || 0;
    
    // Apply offset if any positions are negative (shift everything down)
    const yOffset = minY < 0 ? Math.abs(minY) : 0;
    const adjustedMaxY = maxY + yOffset;
    
    // Calculate final Y offset including margin and save button space
    const offsetY = adjustedMarginTop - 40 + yOffset;
    
    // Calculate total SVG height needed
    const height = adjustedMaxY + adjustedMarginTop + margin.BOTTOM + 20;

    /**
     * Matrix Layout Setup
     * 
     * Configure the phage matrix columns and calculate positioning
     * for the interaction matrix relative to the cluster hierarchy.
     */
    /**
     * Phage Column Configuration
     * 
     * Create column configuration for each visible phage. Each column represents
     * one phage and contains the data needed for matrix positioning and rendering.
     * Currently each column contains a single phage, but this structure allows
     * for future grouping functionality.
     */
    const clusteredPhageColumns = visiblePhages.map((phage) => ({
      name: phage,           // Display name for the column
      phages: [phage],       // Array of phages in this column (future: grouping support)
    }));

    /**
     * Matrix Dimensions and Layout Calculations
     * 
     * Calculate the dimensions and positioning for the phage-bacteria interaction
     * matrix. This includes the matrix width based on visible phages, spacing
     * between tree and matrix, and total SVG dimensions.
     */
    const matrixWidth = clusteredPhageColumns.length * cellSize;           // Total matrix width
    const horizontalGapBetweenBacteriaAndPhages = 10;                     // Gap between tree and matrix
    const xStart = margin.LEFT + maxX + horizontalGapBetweenBacteriaAndPhages; // Matrix start position
    const svgWidth = xStart + matrixWidth + margin.RIGHT;                 // Total SVG width

    /**
     * D3 Scales for Matrix Positioning
     * 
     * Create scales to map phage column indices to matrix positions.
     * The band scale provides even distribution of columns across the matrix
     * width with proper spacing and padding between columns.
     */
    const xScale = d3
      .scaleBand()
      .domain(clusteredPhageColumns.map((_, i) => i.toString())) // Map indices to string domain
      .range([0, matrixWidth])                                   // Scale to matrix width
      .padding(0.4);                                            // Add padding between columns

    // Update SVG dimensions to fit all content
    svg.attr('width', svgWidth).attr('height', height);

    /**
     * Tree Link Rendering
     * 
     * Draw connecting lines between cluster nodes and their children
     * (both bacteria and sub-clusters). Links are drawn as L-shaped paths
     * for clear hierarchical relationships.
     */
    root.descendants().forEach((node: HierarchyNodeExtended) => {
      // Skip nodes without children or invisible nodes
      if (!node.children || !node.data._visible) return;

      // Get direct bacteria children for this cluster
      const bacteria = getDirectBacteriaNodes(node, clusterBacteriaOrder);

      /**
       * Draw links from cluster to bacteria
       * 
       * Create L-shaped paths from cluster nodes to their bacteria children.
       * The path goes horizontally then vertically to create clear connections.
       */
      bacteria.forEach((bact) => {
        svg
          .append('path')
          .attr('class', 'link')
          .attr('fill', 'none')
          .attr('stroke', colors.linkStroke)
          .attr('stroke-width', 2)
          .attr('d', () => {
            const startX = offsetX + node.x!;    // Cluster X position
            const startY = offsetY + node.y!;    // Cluster Y position
            const endX = offsetX + bact.x!;      // Bacteria X position
            const endY = offsetY + bact.y!;      // Bacteria Y position
            // Create L-shaped path: horizontal then vertical
            return `M${startX},${startY}H${endX}V${endY}`;
          });
      });

      /**
       * Draw links from cluster to sub-clusters
       * 
       * Connect parent clusters to their visible child clusters using
       * the same L-shaped path pattern for consistency.
       */
      (node.children
        .filter((c: HierarchyNodeExtended) => c.children && c.data._visible) as HierarchyNodeExtended[])
        .forEach((childCluster) => {
          svg
            .append('path')
            .attr('class', 'link')
            .attr('fill', 'none')
            .attr('stroke', colors.linkStroke)
            .attr('stroke-width', 2)
            .attr('d', () => {
              const startX = offsetX + node.x!;         // Parent cluster X
              const startY = offsetY + node.y!;         // Parent cluster Y
              const endX = offsetX + childCluster.x!;   // Child cluster X
              const endY = offsetY + childCluster.y!;   // Child cluster Y
              // Create L-shaped path for cluster connections
              return `M${startX},${startY}H${endX}V${endY}`;
            });
        });
    });

    /**
     * Cluster Node Rendering
     * 
     * Render cluster nodes as circles with labels. Each cluster gets a
     * color-coded circle and text label positioned according to the
     * hierarchical layout. Visibility is controlled by opacity.
     */
    const clusterNodes = root.descendants().filter((d: HierarchyNodeExtended) => d.children) as HierarchyNodeExtended[];
    const clusterGroup = svg
      .selectAll('.cluster-node')
      .data(clusterNodes)
      .enter()
      .append('g')
      .attr('class', 'cluster-node')
      .attr('transform', (d: HierarchyNodeExtended) => `translate(${offsetX + d.x!},${offsetY + d.y!})`);

    // Draw cluster circles with color coding
    clusterGroup
      .append('circle')
      .attr('r', 10)                                                        // Circle radius
      .attr('fill', (d: HierarchyNodeExtended) => clusterColorScale(d.data.name)) // Color by cluster
      .attr('stroke', colors.clusterCircleStroke)                           // Border color
      .attr('stroke-width', 2)                                              // Border width
      .style('opacity', (d: HierarchyNodeExtended) => (d.data._visible ? 1 : 0.3)); // Visibility opacity

    // Draw cluster labels
    clusterGroup
      .append('text')
      .attr('dx', clusterLabelOffsetX)                                      // Label horizontal offset
      .attr('dy', '0.35em')                                                 // Vertical centering
      .style('text-anchor', 'end')                                          // Right-aligned text
      .style('font-size', '20px')                                           // Large font for visibility
      .style('font-weight', '700')                                          // Bold text
      .style('fill', (d: HierarchyNodeExtended) => clusterColorScale(d.data.name)) // Match cluster color
      .style('opacity', (d: HierarchyNodeExtended) => (d.data._visible ? 1 : 0.3)) // Visibility opacity
      .text((d: HierarchyNodeExtended) => d.data.name);                     // Cluster name

    /**
     * Bacteria Node Rendering
     * 
     * Render bacteria as double circles (outer and inner) with labels.
     * The outer circle provides contrast while the inner circle matches
     * the parent cluster color for visual grouping.
     */
    const bacteriaNodes = root.leaves() as HierarchyNodeExtended[];
    const bactGroup = svg
      .selectAll('.bacteria-node')
      .data(bacteriaNodes)
      .enter()
      .append('g')
      .attr('class', 'bacteria-node')
      .attr('transform', (d: HierarchyNodeExtended) => `translate(${offsetX + d.x!},${offsetY + d.y!})`);

    /**
     * Bacteria Outer Circles
     * 
     * Draw the outer circle for each bacteria node. This provides contrast
     * and visual separation. The color is a semi-transparent version of the
     * parent cluster color when available.
     */
    bactGroup
      .append('circle')
      .attr('r', 7)                                                         // Outer circle radius
      .attr('fill', (d: HierarchyNodeExtended) => {
        const parentClusterName = d.parent?.data?.name;
        if (parentClusterName && clusterColorScale.domain().includes(parentClusterName)) {
          // Use semi-transparent cluster color for grouping
          return d3.color(clusterColorScale(parentClusterName))!.copy({ opacity: 0.3 }).toString();
        }
        return colors.bacteriaOuterFill;                                    // Default outer color
      })
      .attr('stroke', colors.bacteriaOuterStroke)                           // Outer circle border
      .attr('stroke-width', 1);

    /**
     * Bacteria Inner Circles
     * 
     * Draw the inner circle for each bacteria node. This uses the full
     * cluster color to create a strong visual association between bacteria
     * and their parent clusters.
     */
    bactGroup
      .append('circle')
      .attr('r', 4)                                                         // Inner circle radius
      .attr('fill', (d: HierarchyNodeExtended) => {
        const parentClusterName = d.parent?.data?.name;
        if (parentClusterName && clusterColorScale.domain().includes(parentClusterName)) {
          return clusterColorScale(parentClusterName);                      // Full cluster color
        }
        return colors.bacteriaInnerFillDefault;                             // Default inner color
      });

    /**
     * Bacteria Labels
     * 
     * Add text labels for each bacteria node positioned to the left of the
     * circles. Labels are right-aligned for clean visual presentation.
     */
    bactGroup
      .append('text')
      .attr('dx', bacteriaLabelOffsetX)                                     // Label horizontal offset
      .attr('dy', '0.35em')                                                 // Vertical centering
      .style('text-anchor', 'end')                                          // Right-aligned text
      .style('font-size', '16px')                                           // Readable font size
      .style('font-weight', '600')                                          // Semi-bold for clarity
      .style('fill', colors.bacteriaTextFill)                               // Text color
      .text((d: HierarchyNodeExtended) => d.data.name);                     // Bacteria name

    /**
     * Phage Column Headers
     * 
     * Render rotated column headers for each phage above the matrix.
     * Headers are rotated 45 degrees for better space utilization and
     * positioned above the interaction matrix.
     */
    svg
      .selectAll('.col-header')
      .data(clusteredPhageColumns)
      .enter()
      .append('text')
      .attr('class', 'col-header')
      .attr('x', (_, i) => xStart + (xScale(i.toString()) || 0) + cellSize / 2)    // Center in column
      .attr('y', adjustedMarginTop - 80)                                            // Position above matrix
      .attr('text-anchor', 'start')                                                 // Anchor for rotation
      .attr(
        'transform',
        (_, i) => `rotate(-45, ${xStart + (xScale(i.toString()) || 0) + cellSize / 2}, ${adjustedMarginTop - 80})`
      )                                                                             // 45-degree rotation
      .style('font-weight', '700')                                                  // Bold headers
      .style('font-size', '18px')                                                   // Clear readable size
      .style('fill', colors.phageTextFill)                                          // Header text color
      .style('user-select', 'none')                                                 // Prevent text selection
      .text((d) => d.name);                                                         // Phage name

    /**
     * Phage-Bacteria Interaction Matrix
     * 
     * Render the interaction matrix as circles positioned at the intersection
     * of each bacteria row and phage column. Circle appearance indicates
     * whether the phage affects the bacteria (filled vs empty).
     */
    root.leaves().forEach((leaf: HierarchyNodeExtended) => {
      svg
        .selectAll(null)
        .data(
          clusteredPhageColumns.map((group) => {
            const phage = group.phages[0];                                  // Get phage name
            const idx = headers.indexOf(phage);                            // Find phage index
            return leaf.data.values?.[idx] ? 1 : 0;                        // Check interaction (1 or 0)
          })
        )
        .enter()
        .append('circle')
        .attr('data-name', leaf.data.name)                                  // Store bacteria name for reference
        .attr('cx', (_, i) => xStart + (xScale(i.toString()) || 0) + cellSize / 2) // X position in matrix
        .attr('cy', leaf.y! + offsetY)                                      // Y position (bacteria row)
        .attr('r', 8)                                                       // Circle radius
        .attr('fill', (d: number) =>
          d ? colors.phageCircleFillPositive : colors.phageCircleFillNegative     // Fill based on interaction
        )
        .attr('stroke', (d: number) =>
          d ? colors.phageCircleStrokePositive : colors.phageCircleStrokeNegative // Border based on interaction
        )
        .attr('stroke-width', 1);                                           // Circle border width
    });
  }, [
    svgRef,
    treeData,
    headers,
    visibleClusters,
    visiblePhages,
    theme,
    clusterChildrenOrder,
    clusterBacteriaOrder,
  ]);
}

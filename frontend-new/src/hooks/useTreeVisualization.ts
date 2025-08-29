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

interface UseTreeVisualizationProps {
  treeData: TreeNode | null;
  headers: string[];
  visibleClusters: string[];
  visiblePhages: string[];
  theme: 'light' | 'dark';
  clusterChildrenOrder: Record<string, string[]>;
  clusterBacteriaOrder: Record<string, string[]>;
}

/**
 * Custom hook for managing D3 tree visualization
 */
export function useTreeVisualization(
  svgRef: RefObject<SVGSVGElement | null>,
  props: UseTreeVisualizationProps
) {
  const {
    treeData,
    headers,
    visibleClusters,
    visiblePhages,
    theme,
    clusterChildrenOrder,
    clusterBacteriaOrder,
  } = props;

  useEffect(() => {
    if (!treeData || !svgRef.current) return;

    const isDark = theme === 'dark';
    const colors = getColorTheme(isDark);
    const svg = d3.select(svgRef.current);
    
    // Clear previous content
    svg.selectAll('*').remove();
    svg.style('background-color', colors.svgBackground);

    // Constants
    const margin = UI_CONSTANTS.MARGIN;
    const cellSize = UI_CONSTANTS.CELL_SIZE;
    const clusterWidth = UI_CONSTANTS.CLUSTER_WIDTH;
    const bacteriaSpacing = UI_CONSTANTS.BACTERIA_SPACING;
    const clusterSpacing = UI_CONSTANTS.CLUSTER_SPACING;
    
    // Add extra space at the top for the save button (60px height + padding)
    const saveButtonSpace = 80;
    const adjustedMarginTop = margin.TOP + saveButtonSpace;
    
    const offsetX = margin.LEFT;
    // offsetY will be calculated after yOffset is determined
    const clusterLabelOffsetX = UI_CONSTANTS.CLUSTER_LABEL_OFFSET_X;
    const bacteriaLabelOffsetX = UI_CONSTANTS.BACTERIA_LABEL_OFFSET_X;

    // Prepare data
    const visibleSet = new Set(visibleClusters);
    const markedTreeData = markClusterVisibility(treeData, visibleSet);
    const root = d3.hierarchy(markedTreeData) as HierarchyNodeExtended;

    // Reorder children
    reorderChildren(root, clusterChildrenOrder);

    // Set up color scale
    const allClusters = root
      .descendants()
      .filter((d: HierarchyNodeExtended) => d.children)
      .map((d: HierarchyNodeExtended) => d.data.name);

    const clusterColorScale = d3
      .scaleOrdinal<string>()
      .domain(allClusters)
      .range(colours);

    // Calculate positions
    computeHeight(root, clusterBacteriaOrder, bacteriaSpacing, clusterSpacing);
    assignPositions(root, 0, clusterBacteriaOrder, clusterWidth, bacteriaSpacing, clusterSpacing, -clusterWidth / 2);

    // Calculate dimensions and ensure all nodes are below save button
    const allYPositions = root.descendants().map((d: HierarchyNodeExtended) => d.y!);
    const allXPositions = root.descendants().map((d: HierarchyNodeExtended) => d.x!);
    const minY = d3.min(allYPositions) || 0;
    const maxY = d3.max(allYPositions) || 0;
    const maxX = d3.max(allXPositions) || 0;
    
    // If minY is negative, we need to shift all positions down
    const yOffset = minY < 0 ? Math.abs(minY) : 0;
    const adjustedMaxY = maxY + yOffset;
    
    // Now calculate offsetY with the yOffset included
    const offsetY = adjustedMarginTop - 40 + yOffset;
    
    const height = adjustedMaxY + adjustedMarginTop + margin.BOTTOM + 20;

    const clusteredPhageColumns = visiblePhages.map((phage) => ({
      name: phage,
      phages: [phage],
    }));

    const matrixWidth = clusteredPhageColumns.length * cellSize;
    const horizontalGapBetweenBacteriaAndPhages = 10;
    const xStart = margin.LEFT + maxX + horizontalGapBetweenBacteriaAndPhages;
    const svgWidth = xStart + matrixWidth + margin.RIGHT;

    const xScale = d3
      .scaleBand()
      .domain(clusteredPhageColumns.map((_, i) => i.toString()))
      .range([0, matrixWidth])
      .padding(0.4);

    svg.attr('width', svgWidth).attr('height', height);

    // Draw links
    root.descendants().forEach((node: HierarchyNodeExtended) => {
      if (!node.children || !node.data._visible) return;

      const bacteria = getDirectBacteriaNodes(node, clusterBacteriaOrder);

      bacteria.forEach((bact) => {
        svg
          .append('path')
          .attr('class', 'link')
          .attr('fill', 'none')
          .attr('stroke', colors.linkStroke)
          .attr('stroke-width', 2)
          .attr('d', () => {
            const startX = offsetX + node.x!;
            const startY = offsetY + node.y!;
            const endX = offsetX + bact.x!;
            const endY = offsetY + bact.y!;
            return `M${startX},${startY}H${endX}V${endY}`;
          });
      });

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
              const startX = offsetX + node.x!;
              const startY = offsetY + node.y!;
              const endX = offsetX + childCluster.x!;
              const endY = offsetY + childCluster.y!;
              return `M${startX},${startY}H${endX}V${endY}`;
            });
        });
    });

    // Draw clusters
    const clusterNodes = root.descendants().filter((d: HierarchyNodeExtended) => d.children) as HierarchyNodeExtended[];
    const clusterGroup = svg
      .selectAll('.cluster-node')
      .data(clusterNodes)
      .enter()
      .append('g')
      .attr('class', 'cluster-node')
      .attr('transform', (d: HierarchyNodeExtended) => `translate(${offsetX + d.x!},${offsetY + d.y!})`);

    clusterGroup
      .append('circle')
      .attr('r', 10)
      .attr('fill', (d: HierarchyNodeExtended) => clusterColorScale(d.data.name))
      .attr('stroke', colors.clusterCircleStroke)
      .attr('stroke-width', 2)
      .style('opacity', (d: HierarchyNodeExtended) => (d.data._visible ? 1 : 0.3));

    clusterGroup
      .append('text')
      .attr('dx', clusterLabelOffsetX)
      .attr('dy', '0.35em')
      .style('text-anchor', 'end')
      .style('font-size', '20px')
      .style('font-weight', '700')
      .style('fill', (d: HierarchyNodeExtended) => clusterColorScale(d.data.name))
      .style('opacity', (d: HierarchyNodeExtended) => (d.data._visible ? 1 : 0.3))
      .text((d: HierarchyNodeExtended) => d.data.name);

    // Draw bacteria
    const bacteriaNodes = root.leaves() as HierarchyNodeExtended[];
    const bactGroup = svg
      .selectAll('.bacteria-node')
      .data(bacteriaNodes)
      .enter()
      .append('g')
      .attr('class', 'bacteria-node')
      .attr('transform', (d: HierarchyNodeExtended) => `translate(${offsetX + d.x!},${offsetY + d.y!})`);

    bactGroup
      .append('circle')
      .attr('r', 7)
      .attr('fill', (d: HierarchyNodeExtended) => {
        const parentClusterName = d.parent?.data?.name;
        if (parentClusterName && clusterColorScale.domain().includes(parentClusterName)) {
          return d3.color(clusterColorScale(parentClusterName))!.copy({ opacity: 0.3 }).toString();
        }
        return colors.bacteriaOuterFill;
      })
      .attr('stroke', colors.bacteriaOuterStroke)
      .attr('stroke-width', 1);

    bactGroup
      .append('circle')
      .attr('r', 4)
      .attr('fill', (d: HierarchyNodeExtended) => {
        const parentClusterName = d.parent?.data?.name;
        if (parentClusterName && clusterColorScale.domain().includes(parentClusterName)) {
          return clusterColorScale(parentClusterName);
        }
        return colors.bacteriaInnerFillDefault;
      });

    bactGroup
      .append('text')
      .attr('dx', bacteriaLabelOffsetX)
      .attr('dy', '0.35em')
      .style('text-anchor', 'end')
      .style('font-size', '16px')
      .style('font-weight', '600')
      .style('fill', colors.bacteriaTextFill)
      .text((d: HierarchyNodeExtended) => d.data.name);

    // Phage headers
    svg
      .selectAll('.col-header')
      .data(clusteredPhageColumns)
      .enter()
      .append('text')
      .attr('class', 'col-header')
      .attr('x', (_, i) => xStart + (xScale(i.toString()) || 0) + cellSize / 2)
      .attr('y', adjustedMarginTop - 80)
      .attr('text-anchor', 'start')
      .attr(
        'transform',
        (_, i) => `rotate(-45, ${xStart + (xScale(i.toString()) || 0) + cellSize / 2}, ${adjustedMarginTop - 80})`
      )
      .style('font-weight', '700')
      .style('font-size', '18px')
      .style('fill', colors.phageTextFill)
      .style('user-select', 'none')
      .text((d) => d.name);

    // Phage-bacteria matrix circles
    root.leaves().forEach((leaf: HierarchyNodeExtended) => {
      svg
        .selectAll(null)
        .data(
          clusteredPhageColumns.map((group) => {
            const phage = group.phages[0];
            const idx = headers.indexOf(phage);
            return leaf.data.values?.[idx] ? 1 : 0;
          })
        )
        .enter()
        .append('circle')
        .attr('data-name', leaf.data.name)
        .attr('cx', (_, i) => xStart + (xScale(i.toString()) || 0) + cellSize / 2)
        .attr('cy', leaf.y! + offsetY)
        .attr('r', 8)
        .attr('fill', (d: number) =>
          d ? colors.phageCircleFillPositive : colors.phageCircleFillNegative
        )
        .attr('stroke', (d: number) =>
          d ? colors.phageCircleStrokePositive : colors.phageCircleStrokeNegative
        )
        .attr('stroke-width', 1);
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

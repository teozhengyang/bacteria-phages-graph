import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { aggregatePhageClusterInfo } from '../utils/aggregatePhageClusterInfo';
import PhageClusterInfoModal from './PhageClusterInfoModal';

const TreeMatrix = ({
  treeData,
  headers,
  visibleClusters,
  visiblePhages,
  bacteriaClusterOrderArr = ['Root'],
  theme = 'light', // new prop
}) => {
  const ref = useRef();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!treeData) return;

    const isDark = theme === 'dark';

    // Base colors based on theme
    const baseColors = {
      clusterCircleStroke: isDark ? '#718096' : '#999',
      bacteriaOuterFill: isDark ? '#2d3748' : '#eee',
      bacteriaOuterStroke: isDark ? '#4a5568' : '#999',
      bacteriaInnerFillDefault: isDark ? '#3182ce' : '#2b6cb0',
      clusterTextFill: isDark ? 'white' : 'black',
      bacteriaTextFill: isDark ? 'white' : 'black',
      linkStroke: isDark ? '#718096' : '#bbb',
      phageCircleFillPositive: isDark ? '#48bb78' : '#22c55e',
      phageCircleStrokePositive: isDark ? '#68d391' : '#4ade80',
      phageCircleFillNegative: isDark ? '#2d3748' : '#eee',
      phageCircleStrokeNegative: isDark ? '#4a5568' : '#999',
      phageTextFill: isDark ? 'white' : 'black',
    };

    // Setup SVG and clear previous
    const svg = d3.select(ref.current);
    svg.selectAll('*').remove();

    const margin = { top: 150, right: 40, bottom: 40, left: 20 };
    const cellSize = 50;
    const clusterWidth = 100;

    // Separate spacing controls
    const bacteriaSpacing = 30;  // Spacing between bacteria within same cluster
    const clusterSpacing = 15;   // Additional spacing between clusters (larger gap)

    const offsetX = margin.left;
    const offsetY = margin.top - 40;
    const clusterLabelOffsetX = -15;
    const bacteriaLabelOffsetX = -12;

    // Mark cluster visibility recursively
    function markClusterVisibility(node, visibleSet) {
      const isVisible = visibleSet.has(node.name);
      return {
        ...node,
        _visible: isVisible,
        children: node.children
          ? node.children.map((child) => markClusterVisibility(child, visibleSet))
          : undefined,
      };
    }

    const visibleSet = new Set(visibleClusters);
    const markedTreeData = markClusterVisibility(treeData, visibleSet);
    const root = d3.hierarchy(markedTreeData);

    function getDirectBacteriaNodes(clusterNode) {
      if (!clusterNode.children) return [];
      return clusterNode.children.filter((child) => !child.children);
    }

    // Get all visible cluster names for color scale domain
    const allClusters = root
      .descendants()
      .filter((d) => d.children && d.data._visible)
      .map((d) => d.data.name);

    // Color scale for clusters (combined color schemes for more variety)
    const clusterColorScale = d3
      .scaleOrdinal()
      .domain(allClusters)
      .range(d3.schemeSet2.concat(d3.schemeSet3).flat());

    // Compute vertical height of cluster subtree with proper spacing
    function computeHeight(node) {
      if (!node.children) return bacteriaSpacing;

      const directBacteria = getDirectBacteriaNodes(node);
      const childClusters = node.children.filter((c) => c.children);

      // Bacteria height uses bacteriaSpacing
      const bacteriaHeight = directBacteria.length > 0 ? directBacteria.length * bacteriaSpacing : 0;
      
      // Child clusters height with cluster spacing between them
      let childrenHeight = 0;
      childClusters.forEach((child, index) => {
        childrenHeight += computeHeight(child);
        // Add cluster spacing between child clusters (but not after the last one)
        if (index < childClusters.length - 1) {
          childrenHeight += clusterSpacing;
        }
      });

      // Add cluster spacing between bacteria and child clusters if both exist
      const spacingBetweenBacteriaAndClusters = (directBacteria.length > 0 && childClusters.length > 0) ? clusterSpacing : 0;
      
      const totalHeight = bacteriaHeight + spacingBetweenBacteriaAndClusters + childrenHeight;
      node.clusterHeight = totalHeight;
      return totalHeight;
    }

    computeHeight(root);

    // Assign x/y positions to clusters and bacteria with proper spacing
    function assignPositions(node, startY, currentX = 0) {
      if (!node.children) {
        node.x = currentX;
        node.y = startY;
        return bacteriaSpacing;
      }

      const directBacteria = getDirectBacteriaNodes(node);
      const childClusters = node.children.filter((c) => c.children);

      const bacteriaHeight = directBacteria.length > 0 ? directBacteria.length * bacteriaSpacing : 0;
      
      let childrenHeight = 0;
      childClusters.forEach((child, index) => {
        childrenHeight += computeHeight(child);
        if (index < childClusters.length - 1) {
          childrenHeight += clusterSpacing;
        }
      });

      const spacingBetweenBacteriaAndClusters = (directBacteria.length > 0 && childClusters.length > 0) ? clusterSpacing : 0;
      const totalHeight = bacteriaHeight + spacingBetweenBacteriaAndClusters + childrenHeight;

      // Position the cluster node at the center of its subtree
      node.x = currentX;
      node.y = startY + totalHeight / 2;

      const stackedX = currentX + clusterWidth;
      let currentY = startY;

      // Position bacteria with bacteriaSpacing
      directBacteria.forEach((bactNode) => {
        bactNode.x = stackedX;
        bactNode.y = currentY + bacteriaSpacing / 2; // Center bacteria in their allocated space
        currentY += bacteriaSpacing;
      });

      // Add spacing between bacteria and child clusters if both exist
      if (directBacteria.length > 0 && childClusters.length > 0) {
        currentY += clusterSpacing;
      }

      // Position child clusters with clusterSpacing between them
      childClusters.forEach((child, index) => {
        assignPositions(child, currentY, stackedX);
        currentY += child.clusterHeight;
        // Add cluster spacing between child clusters (but not after the last one)
        if (index < childClusters.length - 1) {
          currentY += clusterSpacing;
        }
      });

      return totalHeight;
    }

    assignPositions(root, 0, -clusterWidth / 2);

    // Calculate SVG dimensions
    const maxY = d3.max(root.descendants().map((d) => d.y));
    const maxX = d3.max(root.descendants().map((d) => d.x));
    const height = maxY + margin.top + margin.bottom + 20;

    // Prepare phage columns
    const clusteredPhageColumns = visiblePhages.map((phage) => ({
      name: phage,
      phages: [phage],
    }));

    const matrixWidth = clusteredPhageColumns.length * cellSize;

    // Reduce horizontal gap between bacteria and phages (keep cluster-to-bacteria gap)
    const horizontalGapBetweenBacteriaAndPhages = 10; // reduced from 20
    const xStart = margin.left + maxX + horizontalGapBetweenBacteriaAndPhages;
    const svgWidth = xStart + matrixWidth + margin.right;

    const xScale = d3
      .scaleBand()
      .domain(clusteredPhageColumns.map((_, i) => i))
      .range([0, matrixWidth])
      .padding(0.4);

    svg.attr('width', svgWidth).attr('height', height);

    // Draw links (cluster->bacteria and cluster->child clusters)
    root.descendants().forEach((node) => {
      if (!node.children || !node.data._visible) return;

      const bacteria = getDirectBacteriaNodes(node);

      bacteria.forEach((bact) => {
        svg
          .append('path')
          .attr('class', 'link')
          .attr('fill', 'none')
          .attr('stroke', baseColors.linkStroke)
          .attr('stroke-width', 2)
          .attr('d', () => {
            const startX = offsetX + node.x;
            const startY = offsetY + node.y;
            const endX = offsetX + bact.x;
            const endY = offsetY + bact.y;
            return `M${startX},${startY}H${endX}V${endY}`;
          });
      });

      node.children
        .filter((c) => c.children)
        .forEach((childCluster) => {
          svg
            .append('path')
            .attr('class', 'link')
            .attr('fill', 'none')
            .attr('stroke', baseColors.linkStroke)
            .attr('stroke-width', 2)
            .attr('d', () => {
              const startX = offsetX + node.x;
              const startY = offsetY + node.y;
              const endX = offsetX + childCluster.x;
              const endY = offsetY + childCluster.y;
              return `M${startX},${startY}H${endX}V${endY}`;
            });
        });
    });

    // Draw cluster nodes (circles + text)
    const clusterNodes = root.descendants().filter((d) => d.children);
    const clusterGroup = svg
      .selectAll('.cluster-node')
      .data(clusterNodes)
      .enter()
      .append('g')
      .attr('class', 'cluster-node')
      .attr('transform', (d) => `translate(${offsetX + d.x},${offsetY + d.y})`);

    clusterGroup
      .append('circle')
      .attr('r', 10)
      .attr('fill', (d) => clusterColorScale(d.data.name))
      .attr('stroke', baseColors.clusterCircleStroke)
      .attr('stroke-width', 2)
      .style('opacity', (d) => (d.data._visible ? 1 : 0));

    clusterGroup
      .append('text')
      .attr('dx', clusterLabelOffsetX)
      .attr('dy', '0.35em')
      .style('text-anchor', 'end')
      .style('font-size', '20px')
      .style('font-weight', '700')
      .style('fill', (d) => clusterColorScale(d.data.name))
      .style('opacity', (d) => (d.data._visible ? 1 : 0))
      .text((d) => d.data.name);

    // Draw bacteria nodes
    const bacteriaNodes = root.leaves();
    const bactGroup = svg
      .selectAll('.bacteria-node')
      .data(bacteriaNodes)
      .enter()
      .append('g')
      .attr('class', 'bacteria-node')
      .attr('transform', (d) => `translate(${offsetX + d.x},${offsetY + d.y})`);

    bactGroup
      .append('circle')
      .attr('r', 7)
      .attr('fill', (d) => {
        const parentClusterName = d.parent?.data?.name;
        if (parentClusterName && clusterColorScale.domain().includes(parentClusterName)) {
          return d3.color(clusterColorScale(parentClusterName)).copy({ opacity: 0.3 });
        }
        return baseColors.bacteriaOuterFill;
      })
      .attr('stroke', baseColors.bacteriaOuterStroke)
      .attr('stroke-width', 1);

    bactGroup
      .append('circle')
      .attr('r', 4)
      .attr('fill', (d) => {
        const parentClusterName = d.parent?.data?.name;
        if (parentClusterName && clusterColorScale.domain().includes(parentClusterName)) {
          return clusterColorScale(parentClusterName);
        }
        return baseColors.bacteriaInnerFillDefault;
      });

    bactGroup
      .append('text')
      .attr('dx', bacteriaLabelOffsetX)
      .attr('dy', '0.35em')
      .style('text-anchor', 'end')
      .style('font-size', '16px')
      .style('font-weight', '600')
      .style('fill', baseColors.bacteriaTextFill)
      .text((d) => d.data.name);

    // Phage column headers
    svg
      .selectAll('.col-header')
      .data(clusteredPhageColumns)
      .enter()
      .append('text')
      .attr('class', 'col-header')
      .attr('x', (_, i) => xStart + xScale(i) + cellSize / 2)
      .attr('y', margin.top - 80)
      .attr('text-anchor', 'start')
      .attr(
        'transform',
        (_, i) => `rotate(-45, ${xStart + xScale(i) + cellSize / 2}, ${margin.top - 80})`
      )
      .style('font-weight', '700')
      .style('font-size', '18px')
      .style('fill', baseColors.phageTextFill)
      .style('user-select', 'none')
      .text((d) => d.name);

    // Phage-bacteria matrix circles
    root.leaves().forEach((leaf) => {
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
        .attr('cx', (_, i) => xStart + xScale(i) + cellSize / 2)
        .attr('cy', leaf.y + offsetY)
        .attr('r', 8)
        .attr('fill', (d) =>
          d ? baseColors.phageCircleFillPositive : baseColors.phageCircleFillNegative
        )
        .attr('stroke', (d) =>
          d ? baseColors.phageCircleStrokePositive : baseColors.phageCircleStrokeNegative
        )
        .attr('stroke-width', 1);
    });
  }, [treeData, headers, visibleClusters, visiblePhages, bacteriaClusterOrderArr, theme]);

  // Save SVG as PNG function
  const handleSave = () => {
    const svgElement = ref.current;
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = svgElement.clientWidth;
      canvas.height = svgElement.clientHeight;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = theme === 'dark' ? '#1a202c' : 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      const pngURL = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'tree-matrix.png';
      link.href = pngURL;
      link.click();
    };
    img.src = url;
  };

  const aggregatedData = aggregatePhageClusterInfo(treeData, headers, bacteriaClusterOrderArr, false);

  return (
    <div>
      <div className="flex gap-2 mt-2 ml-2">
        <button
          onClick={handleSave}
          className="px-4 py-1 rounded bg-green-600 hover:bg-green-700 text-white"
        >
          Save as PNG
        </button>
      </div>

      <svg ref={ref}></svg>

      <PhageClusterInfoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} data={aggregatedData} />
    </div>
  );
};

export default TreeMatrix;
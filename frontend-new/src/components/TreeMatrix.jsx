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
}) => {
  const ref = useRef();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!treeData) return;

    const svg = d3.select(ref.current);
    svg.selectAll('*').remove();

    // Layout constants
    const margin = { top: 150, right: 40, bottom: 40, left: 90 };
    const cellSize = 50;
    const clusterWidth = 100;      // Horizontal position for bacteria and child clusters
    const verticalSpacing = 40;    // Vertical spacing between nodes

    const offsetX = margin.left;
    const offsetY = margin.top - 40;
    const clusterLabelOffsetX = -14; // cluster label text offset (left)
    const bacteriaLabelOffsetX = 14; // bacteria label text offset (right)

    // Filter clusters by visibility & preserve order
    const filteredClusters = treeData.children
      .filter(c => visibleClusters.includes(c.name))
      .sort((a, b) => {
        const iA = bacteriaClusterOrderArr.indexOf(a.name);
        const iB = bacteriaClusterOrderArr.indexOf(b.name);
        return iA - iB;
      });
    const filteredTreeData = { ...treeData, children: filteredClusters };

    // Build d3 hierarchy
    const root = d3.hierarchy(filteredTreeData);

    // Helper: get immediate bacteria children (leaves)
    function getDirectBacteriaNodes(clusterNode) {
      if (!clusterNode.children) return [];
      return clusterNode.children.filter(child => !child.children);
    }

    // Compute vertical height needed for subtree recursively
    function computeHeight(node) {
      if (!node.children) return verticalSpacing;

      const directBacteria = getDirectBacteriaNodes(node);
      const childClusters = node.children.filter(c => c.children);

      const bacteriaHeight = directBacteria.length * verticalSpacing;
      let childrenHeight = 0;
      childClusters.forEach(child => {
        childrenHeight += computeHeight(child);
      });

      const totalHeight = bacteriaHeight + childrenHeight;
      node.clusterHeight = totalHeight;
      return totalHeight;
    }

    computeHeight(root);

    // Assign positions
    function assignPositions(node, startY, currentX = 0) {
      if (!node.children) {
        node.x = currentX;
        node.y = startY;
        return verticalSpacing;
      }

      const directBacteria = getDirectBacteriaNodes(node);
      const childClusters = node.children.filter(c => c.children);

      const bacteriaHeight = directBacteria.length * verticalSpacing;
      const childrenHeight = childClusters.reduce((acc, c) => acc + computeHeight(c), 0);
      const totalHeight = bacteriaHeight + childrenHeight;

      node.x = currentX;
      node.y = startY + totalHeight / 2;

      const stackedX = currentX + clusterWidth;
      let currentY = startY;

      directBacteria.forEach((bactNode) => {
        bactNode.x = stackedX;
        bactNode.y = currentY;
        currentY += verticalSpacing;
      });

      childClusters.forEach(child => {
        assignPositions(child, currentY, stackedX);
        currentY += child.clusterHeight;
      });

      return totalHeight;
    }

    assignPositions(root, 0, 0);

    // Compute SVG dimensions
    const maxY = d3.max(root.descendants().map(d => d.y));
    const maxX = d3.max(root.descendants().map(d => d.x));
    const height = maxY + margin.top + margin.bottom + 50;

    // Use visiblePhages for columns
    const clusteredPhageColumns = visiblePhages.map(phage => ({
      name: phage,
      phages: [phage],
    }));

    const matrixWidth = clusteredPhageColumns.length * cellSize;
    const xStart = margin.left + maxX + 50;
    const svgWidth = xStart + matrixWidth + margin.right;

    const xScale = d3.scaleBand()
      .domain(clusteredPhageColumns.map((_, i) => i))
      .range([0, matrixWidth])
      .padding(0.4);

    svg.attr("width", svgWidth).attr("height", height);

    // Draw links from cluster to bacteria and child clusters
    root.descendants().forEach(node => {
      if (!node.children) return;

      const bacteria = getDirectBacteriaNodes(node);
      bacteria.forEach(bact => {
        svg.append("path")
          .attr("class", "link")
          .attr("fill", "none")
          .attr("stroke", "#999")
          .attr("stroke-width", 1.5)
          .attr("d", () => {
            const startX = offsetX + node.x;
            const startY = offsetY + node.y;
            const endX = offsetX + bact.x;
            const endY = offsetY + bact.y;
            return `M${startX},${startY}H${endX}V${endY}`;
          });
      });

      node.children.filter(c => c.children).forEach(childCluster => {
        svg.append("path")
          .attr("class", "link")
          .attr("fill", "none")
          .attr("stroke", "#999")
          .attr("stroke-width", 1.5)
          .attr("d", () => {
            const startX = offsetX + node.x;
            const startY = offsetY + node.y;
            const endX = offsetX + childCluster.x;
            const endY = offsetY + childCluster.y;
            return `M${startX},${startY}H${endX}V${endY}`;
          });
      });
    });

    // Draw cluster nodes (circle + label)
    const clusterNodes = root.descendants().filter(d => d.children);
    const clusterGroup = svg.selectAll(".cluster-node")
      .data(clusterNodes)
      .enter()
      .append("g")
      .attr("class", "cluster-node")
      .attr("transform", d => `translate(${offsetX + d.x},${offsetY + d.y})`);

    clusterGroup.append("circle")
      .attr("r", 8)
      .attr("fill", "#888");

    clusterGroup.append("text")
      .attr("dx", clusterLabelOffsetX)
      .attr("dy", "0.35em")
      .style("text-anchor", "end")
      .style("font-size", "18px")
      .style("font-weight", "600")
      .style("fill", "white")
      .text(d => d.data.name);

    // Draw bacteria nodes (circle + label)
    const bacteriaNodes = root.leaves();
    const bactGroup = svg.selectAll(".bacteria-node")
      .data(bacteriaNodes)
      .enter()
      .append("g")
      .attr("class", "bacteria-node")
      .attr("transform", d => `translate(${offsetX + d.x},${offsetY + d.y})`);

    bactGroup.append("circle")
      .attr("r", 5)
      .attr("fill", "#1f77b4");

    bactGroup.append("text")
      .attr("dx", bacteriaLabelOffsetX)
      .attr("dy", "0.35em")
      .style("text-anchor", "start")
      .style("font-size", "16px")
      .style("font-weight", "600")
      .style("fill", "white")
      .text(d => d.data.name);

    // Column headers (rotated)
    svg.selectAll(".col-header")
      .data(clusteredPhageColumns)
      .enter()
      .append("text")
      .attr("class", "col-header")
      .attr("x", (_, i) => xStart + xScale(i) + cellSize / 2)
      .attr("y", margin.top - 80)
      .attr("text-anchor", "start")
      .attr("transform", (_, i) =>
        `rotate(-45, ${xStart + xScale(i) + cellSize / 2}, ${margin.top - 80})`
      )
      .style("font-weight", "700")
      .style("font-size", "14px")
      .style("fill", "white")
      .text(d => d.name);

    // Draw matrix cells with conditional fill
    root.leaves().forEach((leaf) => {
      svg.selectAll(null)
        .data(clusteredPhageColumns.map((group) => {
          const phage = group.phages[0];
          const idx = headers.indexOf(phage);
          return leaf.data.values?.[idx] ? 1 : 0;
        }))
        .enter()
        .append("circle")
        .attr("data-name", leaf.data.name)
        .attr("cx", (_, i) => xStart + xScale(i) + cellSize / 2)
        .attr("cy", leaf.y + offsetY)
        .attr("r", 10)
        .attr("fill", d => d ? "lightgreen" : "white")
        .attr("stroke", "black");
    });

  }, [
    treeData,
    headers,
    visibleClusters,
    visiblePhages,
    bacteriaClusterOrderArr,
  ]);

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
      ctx.fillStyle = '#1a202c';
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
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white"
          title="Show Phage Cluster Info"
        >
          Phage Info
        </button>
      </div>

      <svg ref={ref}></svg>

      <PhageClusterInfoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={aggregatedData}
      />
    </div>
  );
};

export default TreeMatrix;

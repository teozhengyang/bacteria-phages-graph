import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { aggregatePhageClusterInfo } from '../utils/aggregatePhageClusterInfo'; // adjust path
import PhageClusterInfoModal from './PhageClusterInfoModal'; // add the modal component (see previous code)

const TreeMatrix = ({ treeData, headers, visibleClusters, visiblePhages }) => {
  const ref = useRef();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!treeData) return;

    const svg = d3.select(ref.current);
    svg.selectAll('*').remove();

    const margin = { top: 120, right: 40, bottom: 40, left: 90 };
    const cellSize = 50;
    const fixedTreeLayoutWidth = 400;
    const offsetY = margin.top - 40;

    const filteredClusters = treeData.children.filter(c => visibleClusters.includes(c.name));
    const filteredTreeData = { ...treeData, children: filteredClusters };

    const root = d3.hierarchy(filteredTreeData);
    d3.tree().size([0, fixedTreeLayoutWidth])(root);

    const leafCount = root.leaves().length;
    const height = Math.max(leafCount * 40 + margin.top + margin.bottom, 400);

    d3.tree().size([height - margin.top - margin.bottom, fixedTreeLayoutWidth])(root);

    const filteredHeaders = headers.filter(h => visiblePhages.includes(h));
    const matrixWidth = filteredHeaders.length * cellSize;
    const xStart = margin.left + fixedTreeLayoutWidth + 50;
    const svgWidth = xStart + matrixWidth + margin.right;

    const xScale = d3.scaleBand()
      .domain(d3.range(filteredHeaders.length))
      .range([xStart, xStart + filteredHeaders.length * cellSize])
      .padding(0.4);

    svg.attr("width", svgWidth).attr("height", height);

    svg.selectAll(".link")
      .data(root.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "#999")
      .attr("stroke-width", 1.5)
      .attr("d", d3.linkHorizontal()
        .x(d => margin.left + d.y)
        .y(d => d.x + offsetY)
      );

    const nodeGroup = svg.selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("class", d => d.children ? "cluster-node" : "bacteria-node")
      .attr("transform", d => `translate(${margin.left + d.y},${d.x + offsetY})`);

    nodeGroup.filter(d => d.children)
      .append("circle")
      .attr("r", 8)
      .attr("fill", "#888");

    nodeGroup.filter(d => !d.children)
      .append("circle")
      .attr("r", 5)
      .attr("fill", "#1f77b4");

    nodeGroup.append("text")
      .attr("dx", d => d.children ? -14 : 14)
      .attr("dy", "0.35em")
      .style("text-anchor", d => d.children ? "end" : "start")
      .style("font-size", d => d.children ? "18px" : "16px")
      .style("font-weight", "600")
      .style("fill", "white")
      .text(d => d.data.name);

    svg.selectAll(".col-header")
      .data(filteredHeaders)
      .enter()
      .append("text")
      .attr("class", "col-header")
      .attr("x", (_, i) => xScale(i) + cellSize / 2)
      .attr("y", margin.top - 60)
      .attr("text-anchor", "middle")
      .style("font-weight", "700")
      .style("font-size", "16px")
      .style("fill", "white")
      .text(d => d);

    root.leaves().forEach((leaf) => {
      svg.selectAll(null)
        .data(filteredHeaders.map(h => {
          const idx = headers.indexOf(h);
          return leaf.data.values ? leaf.data.values[idx] : 0;
        }))
        .enter()
        .append("circle")
        .attr("data-name", leaf.data.name)
        .attr("cx", (_, i) => xScale(i) + cellSize / 2)
        .attr("cy", leaf.x + offsetY)
        .attr("r", 10)
        .attr("fill", d => d ? "lightgreen" : "white")
        .attr("stroke", "black");
    });

  }, [treeData, headers, visibleClusters, visiblePhages]);

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

  // Aggregate phage-cluster data for modal
  const aggregatedData = aggregatePhageClusterInfo(treeData, headers);

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

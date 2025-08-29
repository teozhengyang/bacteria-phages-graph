'use client';

import React, { useRef } from 'react';
import { TreeMatrixProps } from '../../types';
import TreeMatrixControls from './TreeMatrixControls';
import { useTreeVisualization } from '../../hooks/useTreeVisualization';
import { useSaveVisualization } from '../../hooks/useSaveVisualization';

const TreeMatrix: React.FC<TreeMatrixProps> = ({
  treeData,
  headers,
  visibleClusters,
  visiblePhages,
  theme = 'light',
  clusterChildrenOrder,
  clusterBacteriaOrder
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Use custom hooks for visualization logic
  useTreeVisualization(svgRef, {
    treeData,
    headers,
    visibleClusters,
    visiblePhages,
    theme,
    clusterChildrenOrder,
    clusterBacteriaOrder,
  });

  const { handleSave } = useSaveVisualization(svgRef, theme);

  return (
    <div className="relative">
      <TreeMatrixControls 
        onSave={handleSave}
        theme={theme} 
      />
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default TreeMatrix;

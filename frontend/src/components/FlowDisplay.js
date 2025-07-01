import React from 'react';
import { ReactFlow, Background, Controls } from '@xyflow/react';
import { nodeTypes } from './CustomNodes';

export default function FlowDisplay({ nodes, edges, onNodesChange, onEdgesChange }) {
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      fitView
      nodeTypes={nodeTypes}
    >
      <Background />
      <Controls />
    </ReactFlow>
  );
}

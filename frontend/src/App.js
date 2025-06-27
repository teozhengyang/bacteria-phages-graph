import React from 'react';
import {
  ReactFlow,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position,
  Controls,
  MiniMap,
} from '@xyflow/react';
import * as XLSX from 'xlsx';
import '@xyflow/react/dist/style.css';

// Custom node for bacteria
function BacteriaNode({ data }) {
  return (
    <div
      style={{
        padding: 10,
        borderRadius: 4,
        backgroundColor: '#def',
        minWidth: 100,
        textAlign: 'center',
      }}
    >
      {data.label}
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

// Custom node for infected phage
function PhageNode({ data, style }) {
  return (
    <div
      style={{
        borderRadius: '50%',
        border: style?.border || '2px solid #000',
        color: style?.color || '#000',
        width: 60,
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        backgroundColor: style?.backgroundColor || 'white',
        ...style,
      }}
    >
      {data.label}
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

// Custom node for wrong/inactive phage
function PhageNodeWrong({ data, style }) {
  return (
    <div
      style={{
        borderRadius: '50%',
        border: style?.border || '2px solid #000',
        color: style?.color || '#000',
        width: 60,
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        backgroundColor: style?.backgroundColor || '#90EE90',
        ...style,
      }}
    >
      {data.label}
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

const nodeTypes = {
  bacteria: BacteriaNode,
  phage: PhageNode,
  wrongphage: PhageNodeWrong,
};

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const phageHeaders = json[1].slice(2); // Row 2, columns C onward
      const newNodes = [];
      const newEdges = [];

      for (let i = 2; i < json.length; i++) {
        const row = json[i];
        const rowNodes = [];
        const yOffset = (i - 2) * 150;

        // Bacteria node
        const bacteriaId = `bacteria-${i}`;
        const bacteriaName = row[0]?.toString() || `Bacteria ${i}`;
        const bacteriaNode = {
          id: bacteriaId,
          data: { label: bacteriaName },
          position: { x: 50, y: yOffset },
          type: 'bacteria',
        };
        rowNodes.push(bacteriaNode);

        let xPos = 200; // Start placing phages from here

        for (let j = 2; j < row.length; j++) {
          const value = row[j];
          const phageName = phageHeaders[j - 2];
          if (value === undefined || value === '') continue;

          const isInfected = parseInt(value) === 0;
          const phageId = `phage-${i}-${j}`;
          const nodeType = isInfected ? 'phage' : 'wrongphage';

          const phageNode = {
            id: phageId,
            data: { label: phageName },
            position: { x: xPos, y: yOffset },
            type: nodeType,
          };
          rowNodes.push(phageNode);
          xPos += 120; // horizontal spacing
        }

        // Add row nodes and edges
        for (let k = 0; k < rowNodes.length; k++) {
          newNodes.push(rowNodes[k]);
          if (k > 0) {
            newEdges.push({
              id: `e-${rowNodes[k - 1].id}-${rowNodes[k].id}`,
              source: rowNodes[k - 1].id,
              target: rowNodes[k].id,
              markerEnd: { type: MarkerType.ArrowClosed },
            });
          }
        }
      }

      setNodes(newNodes);
      setEdges(newEdges);
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {/* Upload Form */}
      <form
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 20,
          background: 'white',
          padding: 10,
          borderRadius: 5,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <h3 style={{ margin: 0, marginBottom: 5 }}>Upload Excel File</h3>
        <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      </form>

      {/* React Flow */}
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
        <MiniMap />
      </ReactFlow>
    </div>
  );
}

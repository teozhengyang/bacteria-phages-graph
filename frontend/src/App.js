import { useNodesState, useEdgesState } from '@xyflow/react';
import FlowDisplay from './components/FlowDisplay';
import { parseExcelToFlow } from './components/ExcelParser';
import '@xyflow/react/dist/style.css';

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      parseExcelToFlow(file, (parsedNodes, parsedEdges) => {
        setNodes(parsedNodes);
        setEdges(parsedEdges);
      });
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <form style={{
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 20,
        background: 'white',
        padding: 10,
        borderRadius: 5,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}>
        <h3 style={{ margin: 0, marginBottom: 5 }}>Upload Excel File</h3>
        <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      </form>

      <FlowDisplay
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
      />
    </div>
  );
}

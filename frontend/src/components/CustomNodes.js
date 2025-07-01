import React from 'react';
import { Handle, Position } from '@xyflow/react';

export function BacteriaNode({ data }) {
  return (
    <div style={{
      padding: 10,
      borderRadius: 4,
      backgroundColor: '#def',
      minWidth: 100,
      textAlign: 'center',
    }}>
      {data.label}
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export function EmptyPhageNode({ data, style }) {
  return (
    <div style={{
      borderRadius: '50%',
      border: style?.border || '2px solid #000',
      color: style?.color || '#000',
      width: 40,
      height: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      backgroundColor: style?.backgroundColor || 'white',
      ...style,
    }}>
      {data.label}
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export function FilledPhageNode({ data, style }) {
  return (
    <div style={{
      borderRadius: '50%',
      border: style?.border || '2px solid #000',
      color: style?.color || '#000',
      width: 40,
      height: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      backgroundColor: style?.backgroundColor || '#90EE90',
      ...style,
    }}>
      {data.label}
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export function HeaderNode({ data }) {
  return (
    <div style={{
      padding: 6,
      backgroundColor: '#f0f0f0',
      border: '1px solid #ccc',
      borderRadius: 4,
      textAlign: 'center',
      fontWeight: 'bold',
    }}>
      {data.label}
    </div>
  );
}

export const nodeTypes = {
  bacteria: BacteriaNode,
  emptyPhage: EmptyPhageNode,
  filledPhage: FilledPhageNode,
  header: HeaderNode,
};

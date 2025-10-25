"use client"
import { useCallback } from 'react';
import { ReactFlow, useNodesState, useEdgesState, addEdge, Connection, Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import '../styles/nodes.css';
import { FirecrawlNode } from '../components/nodes/FirecrawlNode';
import { OpenAINode } from '../components/nodes/OpenAINode';
import { GoogleSheetsNode } from '../components/nodes/GoogleSheetsNode';

type NodeData = {
  label?: string;
  url?: string;
  markdown?: string;
  prompt?: string;
  model?: string;
  response?: string;
  isLoading?: boolean;
  error?: string;
};

// Define nodeTypes outside component to prevent re-renders
const nodeTypes = {
  firecrawl: FirecrawlNode as any,
  openai: OpenAINode as any,
  googleSheets: GoogleSheetsNode as any,
};
 
const initialNodes: Node<NodeData>[] = [
  { 
    id: 'firecrawl-1', 
    type: 'firecrawl',
    position: { x: 100, y: 50 }, 
    data: {} 
  },
  { 
    id: 'openai-1', 
    type: 'openai',
    position: { x: 100, y: 350 }, 
    data: {} 
  },
  { 
    id: 'googlesheets-1', 
    type: 'googleSheets',
    position: { x: 100, y: 650 }, 
    data: {} 
  },
];
const initialEdges: Edge[] = [
  {
    id: 'firecrawl-1-openai-1',
    source: 'firecrawl-1',
    target: 'openai-1',
    sourceHandle: 'output',
    targetHandle: 'input',
  },
  {
    id: 'openai-1-googlesheets-1',
    source: 'openai-1',
    target: 'googlesheets-1',
    sourceHandle: 'output',
    targetHandle: 'input',
  }
];
 
export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );
 
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      />
    </div>
  );
}
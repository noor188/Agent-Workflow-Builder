"use client"
import { useCallback } from 'react';
import { ReactFlow, useNodesState, useEdgesState, addEdge, Connection, Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import '../styles/nodes.css';
import { FirecrawlNode } from '../components/nodes/FirecrawlNode';
import { OpenAINode } from '../components/nodes/OpenAINode';

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
  firecrawl: FirecrawlNode,
  openai: OpenAINode,
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
];
const initialEdges: Edge[] = [];
 
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
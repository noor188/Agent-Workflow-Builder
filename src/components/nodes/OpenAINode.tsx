"use client"
import { useCallback, useState, useMemo } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import OpenAI from 'openai';

type OpenAINodeData = {
  prompt?: string;
  model?: string;
  response?: string;
  isLoading?: boolean;
  error?: string;
};

const AVAILABLE_MODELS = [
  { value: 'gpt-4.1', label: 'GPT-4.1' },
  { value: 'gpt-5-nano', label: 'GPT-5 Nano' },
  { value: 'gpt-5-mini', label: 'GPT-5 Mini' },
  { value: 'gpt-5', label: '<GPT-5></GPT-5> },
];

export function OpenAINode({ data, id }: NodeProps<OpenAINodeData>) {
  const { getNodes, getEdges, setNodes } = useReactFlow();
  
  const [prompt, setPrompt] = useState(data?.prompt || '');
  const [model, setModel] = useState(data?.model || 'gpt-4o-mini');
  const [response, setResponse] = useState(data?.response || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // STEP 4: Detect incoming connections and extract data
  const incomingData = useMemo(() => {
    const edges = getEdges();
    const nodes = getNodes();
    
    // Find all edges that connect TO this node
    const incomingEdges = edges.filter(edge => edge.target === id);
    
    console.log('[OpenAI Node] Connection check:', {
      nodeId: id,
      incomingEdges: incomingEdges.length,
      allNodes: nodes.map(n => ({ id: n.id, type: n.type, hasData: !!n.data }))
    });
    
    if (incomingEdges.length === 0) {
      return null;
    }

    // Get data from source nodes
    const sourceData = incomingEdges.map(edge => {
      const sourceNode = nodes.find(node => node.id === edge.source);
      if (!sourceNode) return null;

      // Extract relevant data based on node type
      const nodeData = sourceNode.data as any;
      
      console.log('[OpenAI Node] Source node data:', {
        id: sourceNode.id,
        type: sourceNode.type,
        data: nodeData
      });
      
      // Extract markdown from Firecrawl nodes
      if (sourceNode.type === 'firecrawl' && nodeData.markdown) {
        return {
          type: 'firecrawl',
          label: 'Scraped Content',
          content: nodeData.markdown,
          preview: nodeData.markdown.substring(0, 150) + '...'
        };
      }
      
      // Extract response from other OpenAI nodes (for chaining)
      if (sourceNode.type === 'openai' && nodeData.response) {
        return {
          type: 'openai',
          label: 'AI Response',
          content: nodeData.response,
          preview: nodeData.response.substring(0, 150) + '...'
        };
      }

      return null;
    }).filter(Boolean);

    console.log('[OpenAI Node] Extracted data:', sourceData);
    return sourceData.length > 0 ? sourceData : null;
  }, [getEdges, getNodes, id]);

  // STEP 7: Call OpenAI API with merged prompt
  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResponse('');
    
    try {
      const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
      
      if (!apiKey) {
        throw new Error('OpenAI API key not found. Please add NEXT_PUBLIC_OPENAI_API_KEY to your .env.local file');
      }

      const openai = new OpenAI({ 
        apiKey,
        dangerouslyAllowBrowser: true // Required for client-side usage
      });

      // STEP 6: Build the final prompt with incoming data
      let finalPrompt = prompt;
      
      if (incomingData && incomingData.length > 0) {
        const contextParts = incomingData.map((data: any) => 
          `[${data.label}]\n${data.content}`
        ).join('\n\n---\n\n');
        
        // If prompt contains {input} placeholder, replace it
        if (prompt.includes('{input}')) {
          finalPrompt = prompt.replace(/{input}/g, contextParts);
        } else {
          // Otherwise, prepend the context
          finalPrompt = `${contextParts}\n\n---\n\nUser Request:\n${prompt}`;
        }
      }

      console.log('[OpenAI Node] Final prompt:', finalPrompt.substring(0, 200) + '...');

      const completion = await openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: 'user',
            content: finalPrompt
          }
        ],
        temperature: 0.7,
      });

      const aiResponse = completion.choices[0]?.message?.content || 'No response generated';
      setResponse(aiResponse);
      setError(null);
      
      // Update React Flow node data so other nodes can access it
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === id) {
            return {
              ...node,
              data: {
                ...node.data,
                response: aiResponse,
                prompt: prompt,
                model: model,
              },
            };
          }
          return node;
        })
      );
      
    } catch (err) {
      console.error('[OpenAI Node] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate response');
      setResponse('');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, model, incomingData, id, setNodes]);

  const handlePromptChange = useCallback((evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(evt.target.value);
  }, []);

  const handleModelChange = useCallback((evt: React.ChangeEvent<HTMLSelectElement>) => {
    setModel(evt.target.value);
  }, []);

  return (
    <div className="openai-node">
      {/* Input handle at the top */}
      <Handle 
        type="target" 
        position={Position.Top} 
        id="input"
        style={{ background: '#10a37f' }}
      />
      
      <div className="node-content">
        <div className="node-header">
          <strong>🤖 OpenAI Chat</strong>
        </div>
        
        {/* STEP 5: Connection Indicator UI */}
        {incomingData && incomingData.length > 0 && (
          <div className="connection-indicator">
            <div className="connection-status">
              ✓ Connected to {incomingData.length} input{incomingData.length > 1 ? 's' : ''}
            </div>
            {incomingData.map((data: any, idx: number) => (
              <div key={idx} className="connection-preview">
                <div className="connection-label">{data.label}:</div>
                <div className="connection-text">{data.preview}</div>
              </div>
            ))}
            <div className="connection-hint">
              💡 Tip: Use {'{input}'} in your prompt to control where the input appears
            </div>
          </div>
        )}
        
        <div className="node-body">
          {/* Model Selection */}
          <div className="input-group">
            <label htmlFor={`model-${id}`}>Model:</label>
            <select
              id={`model-${id}`}
              value={model}
              onChange={handleModelChange}
              className="nodrag"
              disabled={isLoading}
            >
              {AVAILABLE_MODELS.map(m => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Prompt Input */}
          <div className="input-group">
            <label htmlFor={`prompt-${id}`}>Prompt:</label>
            <textarea
              id={`prompt-${id}`}
              value={prompt}
              onChange={handlePromptChange}
              placeholder={incomingData 
                ? "Enter your prompt. Use {input} to include connected data, or it will be added automatically." 
                : "Enter your prompt here..."}
              className="nodrag"
              disabled={isLoading}
              rows={4}
            />
          </div>
          
          <button 
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="generate-button nodrag"
          >
            {isLoading ? 'Generating...' : 'Generate'}
          </button>
          
          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}
          
          {response && (
            <div className="response-preview">
              <div className="preview-header">Response:</div>
              <div className="preview-content">
                {response}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Output handle at the bottom */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="output"
        style={{ background: '#10a37f' }}
      />
    </div>
  );
}

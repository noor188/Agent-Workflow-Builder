"use client"
import { useCallback, useState } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import Firecrawl from '@mendable/firecrawl-js';

type FirecrawlNodeData = {
  url?: string;
  markdown?: string;
  isLoading?: boolean;
  error?: string;
};

export function FirecrawlNode({ data, id }: NodeProps<FirecrawlNodeData>) {
  const { setNodes } = useReactFlow();
  const [url, setUrl] = useState(data?.url || '');
  const [markdown, setMarkdown] = useState(data?.markdown || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScrape = useCallback(async () => {
    if (!url) {
      setError('Please enter a URL');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Get API key from environment variables
      const apiKey = process.env.NEXT_PUBLIC_FIRECRAWL_API_KEY;
      
      if (!apiKey) {
        throw new Error('Firecrawl API key not found. Please add NEXT_PUBLIC_FIRECRAWL_API_KEY to your .env.local file');
      }

      const app = new Firecrawl({ apiKey });
      
      // Scrape the URL and get markdown format
      const scrapeResult = await app.scrape(url, { 
        formats: ['markdown'] 
      });
      
      // The SDK returns the data object directly
      // Response structure: { markdown: string, metadata: {...} }
      if (scrapeResult && scrapeResult.markdown) {
        setMarkdown(scrapeResult.markdown);
        setError(null);
        
        // CRITICAL: Update React Flow node data so other nodes can access it
        setNodes((nds) =>
          nds.map((node) => {
            if (node.id === id) {
              return {
                ...node,
                data: {
                  ...node.data,
                  markdown: scrapeResult.markdown,
                  url: url,
                },
              };
            }
            return node;
          })
        );
      } else {
        throw new Error('No markdown content returned');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scrape URL');
      setMarkdown('');
    } finally {
      setIsLoading(false);
    }
  }, [url]);

  const handleUrlChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(evt.target.value);
  }, []);

  return (
    <div className="firecrawl-node">
      {/* Input handle at the top */}
      <Handle 
        type="target" 
        position={Position.Top} 
        id="input"
        style={{ background: '#555' }}
      />
      
      <div className="node-content">
        <div className="node-header">
          <strong>🔥 Firecrawl Scraper</strong>
        </div>
        
        <div className="node-body">
          <div className="input-group">
            <label htmlFor={`url-${id}`}>URL:</label>
            <input
              id={`url-${id}`}
              name="url"
              value={url}
              onChange={handleUrlChange}
              placeholder="https://example.com"
              className="nodrag"
              disabled={isLoading}
            />
          </div>
          
          <button 
            onClick={handleScrape}
            disabled={isLoading || !url}
            className="scrape-button nodrag"
          >
            {isLoading ? 'Scraping...' : 'Scrape'}
          </button>
          
          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}
          
          {markdown && (
            <div className="markdown-preview">
              <div className="preview-header">Markdown Preview:</div>
              <div className="preview-content">
                {markdown.substring(0, 200)}
                {markdown.length > 200 ? '...' : ''}
              </div>
              <div className="char-count">
                {markdown.length} characters
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
        style={{ background: '#555' }}
      />
    </div>
  );
}

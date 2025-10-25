"use client"
import { useCallback, useState, useMemo } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';

type GoogleSheetsNodeData = {
  spreadsheetId?: string;
  sheetName?: string;
  startCell?: string;
  isLoading?: boolean;
  error?: string;
  lastWriteInfo?: string;
};

export function GoogleSheetsNode({ data, id }: NodeProps<any>) {
  const { getNodes, getEdges, setNodes } = useReactFlow();
  
  const [spreadsheetId, setSpreadsheetId] = useState((data as GoogleSheetsNodeData)?.spreadsheetId || '');
  const [sheetName, setSheetName] = useState((data as GoogleSheetsNodeData)?.sheetName || 'Sheet1');
  const [startCell, setStartCell] = useState((data as GoogleSheetsNodeData)?.startCell || 'A1');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastWriteInfo, setLastWriteInfo] = useState((data as GoogleSheetsNodeData)?.lastWriteInfo || '');

  // Get current edges and nodes for dependency tracking
  const currentEdges = getEdges();
  const currentNodes = getNodes();

  // Detect incoming connections and extract data
  const incomingData = useMemo(() => {
    const edges = getEdges();
    const nodes = getNodes();
    
    // Find all edges that connect TO this node
    const incomingEdges = edges.filter(edge => edge.target === id);
    
    // Debug logging for development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Google Sheets Node] Connection check:', {
        nodeId: id,
        incomingEdges: incomingEdges.length,
        hasData: incomingEdges.length > 0
      });
    }
    
    if (incomingEdges.length === 0) {
      return null;
    }

    // Get data from source nodes
    const sourceData = incomingEdges.map(edge => {
      const sourceNode = nodes.find(node => node.id === edge.source);
      if (!sourceNode) return null;

      // Extract relevant data based on node type
      const nodeData = sourceNode.data as any;
      
      // Extract markdown from Firecrawl nodes
      if (sourceNode.type === 'firecrawl' && nodeData?.markdown) {
        return {
          type: 'firecrawl',
          label: 'Scraped Content',
          content: nodeData.markdown,
          preview: nodeData.markdown.substring(0, 150) + (nodeData.markdown.length > 150 ? '...' : '')
        };
      }
      
      // Extract response from OpenAI nodes
      if (sourceNode.type === 'openai' && nodeData?.response) {
        return {
          type: 'openai',
          label: 'AI Response',
          content: nodeData.response,
          preview: nodeData.response.substring(0, 150) + (nodeData.response.length > 150 ? '...' : '')
        };
      }

      return null;
    }).filter(Boolean);

    return sourceData.length > 0 ? sourceData : null;
  }, [currentEdges, currentNodes, id]);

  // Helper function to prepare data for Google Sheets
  const prepareDataForSheets = useCallback((inputData: any[]) => {
    const rows: string[][] = [];
    
    inputData.forEach((data, index) => {
      // Add header for each data source
      rows.push([`${data.label} (Source ${index + 1})`]);
      
      // Split content into lines and add each as a row
      const lines = data.content.split('\n').filter((line: string) => line.trim());
      
      // For structured content, try to parse and organize
      if (data.type === 'openai') {
        // For AI responses, try to split into paragraphs
        const paragraphs = data.content.split('\n\n').filter((p: string) => p.trim());
        paragraphs.forEach((paragraph: string) => {
          rows.push([paragraph.trim()]);
        });
      } else if (data.type === 'firecrawl') {
        // For scraped content, try to extract structured data
        lines.forEach((line: string) => {
          // Skip markdown headers and empty lines
          if (line.trim() && !line.startsWith('#')) {
            rows.push([line.trim()]);
          }
        });
      } else {
        // Default: add each line as a row
        lines.forEach((line: string) => {
          rows.push([line.trim()]);
        });
      }
      
      // Add empty row as separator
      rows.push(['']);
    });
    
    return rows;
  }, []);

  // Write data to Google Sheets
  const handleWriteToSheets = useCallback(async () => {
    if (!spreadsheetId.trim()) {
      setError('Please enter a Spreadsheet ID');
      return;
    }

    if (!incomingData || incomingData.length === 0) {
      setError('No input data available. Please connect and populate other nodes first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setLastWriteInfo('');
    
    try {
      // Prepare data for writing
      const rows = prepareDataForSheets(incomingData);
      
      if (rows.length === 0) {
        throw new Error('No data to write to the sheet');
      }

      // Call our API route to write to Google Sheets
      const response = await fetch('/api/google-sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spreadsheetId: spreadsheetId,
          sheetName: sheetName,
          startCell: startCell,
          data: rows,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to write to Google Sheets');
      }

      const result = await response.json();
      const writeInfo = `Successfully wrote ${result.updatedRows} rows to ${sheetName}!${startCell}`;
      setLastWriteInfo(writeInfo);
      setError(null);
      
      // Update React Flow node data
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === id) {
            return {
              ...node,
              data: {
                ...node.data,
                lastWriteInfo: writeInfo,
                spreadsheetId: spreadsheetId,
                sheetName: sheetName,
                startCell: startCell,
              },
            };
          }
          return node;
        })
      );
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to write to Google Sheets';
      setError(errorMessage);
      setLastWriteInfo('');
    } finally {
      setIsLoading(false);
    }
  }, [spreadsheetId, sheetName, startCell, incomingData, id, setNodes, prepareDataForSheets]);

  const handleSpreadsheetIdChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    setSpreadsheetId(evt.target.value);
  }, []);

  const handleSheetNameChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    setSheetName(evt.target.value);
  }, []);

  const handleStartCellChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    setStartCell(evt.target.value);
  }, []);

  return (
    <div className="google-sheets-node">
      {/* Input handle at the top */}
      <Handle 
        type="target" 
        position={Position.Top} 
        id="input"
        style={{ background: '#34a853' }}
      />
      
      <div className="node-content">
        <div className="node-header">
          <strong>📊 Google Sheets</strong>
        </div>
        
        {/* Connection Indicator UI */}
        {incomingData && incomingData.length > 0 ? (
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
              💡 Data will be written to the sheet starting from the specified cell
            </div>
          </div>
        ) : currentEdges.some(edge => edge.target === id) ? (
          <div className="connection-waiting-indicator">
            <div className="connection-status">
              🔗 Connected but waiting for data
            </div>
            <div className="connection-hint">
              The nodes are connected! Please process data in the connected nodes first.
            </div>
          </div>
        ) : (
          <div className="no-connection-indicator">
            <div className="connection-status">
              ⚠️ No incoming connections detected
            </div>
            <div className="connection-hint">
              Connect Firecrawl, OpenAI, or other nodes to write their data to Google Sheets
            </div>
          </div>
        )}
        
        {!incomingData && (
          <div className="instruction-hint">
            💡 Connect data sources (Firecrawl, OpenAI nodes) and configure your sheet details below
          </div>
        )}
        
        <div className="node-body">
          {/* Spreadsheet ID Input */}
          <div className="input-group">
            <label htmlFor={`spreadsheet-${id}`}>Spreadsheet ID:</label>
            <input
              id={`spreadsheet-${id}`}
              value={spreadsheetId}
              onChange={handleSpreadsheetIdChange}
              placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
              className="nodrag"
              disabled={isLoading}
            />
            <div className="input-hint">
              Copy from the Google Sheets URL between /d/ and /edit
            </div>
          </div>

          {/* Sheet Name Input */}
          <div className="input-group">
            <label htmlFor={`sheet-name-${id}`}>Sheet Name:</label>
            <input
              id={`sheet-name-${id}`}
              value={sheetName}
              onChange={handleSheetNameChange}
              placeholder="Sheet1"
              className="nodrag"
              disabled={isLoading}
            />
          </div>

          {/* Start Cell Input */}
          <div className="input-group">
            <label htmlFor={`start-cell-${id}`}>Start Cell:</label>
            <input
              id={`start-cell-${id}`}
              value={startCell}
              onChange={handleStartCellChange}
              placeholder="A1"
              className="nodrag"
              disabled={isLoading}
            />
            <div className="input-hint">
              Cell where data writing will begin (e.g., A1, B2)
            </div>
          </div>
          
          <button 
            onClick={handleWriteToSheets}
            disabled={isLoading || !spreadsheetId.trim() || !incomingData}
            className="write-button nodrag"
          >
            {isLoading ? 'Writing...' : 'Write to Sheet'}
          </button>
          
          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}
          
          {lastWriteInfo && (
            <div className="success-message">
              ✅ {lastWriteInfo}
            </div>
          )}
        </div>
      </div>
      
      {/* Output handle at the bottom */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="output"
        style={{ background: '#34a853' }}
      />
    </div>
  );
}
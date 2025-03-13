import React, { useState, useCallback, useEffect } from 'react';
import { useStore } from '../store';
import { Plus, X, ExternalLink, Loader2, AlertCircle, Settings, Trash2, FileImage } from 'lucide-react';
import type { Wireframe, WireframeElement } from '../types';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Connection,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  Panel,
  ConnectionMode,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';

const nodeTypes = {
  component: ({ data }: { data: { label: string } }) => (
    <div className="relative px-4 py-2 shadow-md rounded-md bg-white border-2 border-indigo-500">
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-indigo-500" />
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-indigo-500" />
      <div className="font-bold text-indigo-500">{data.label}</div>
    </div>
  ),
  container: ({ data }: { data: { label: string } }) => (
    <div className="relative px-4 py-2 shadow-md rounded-md bg-white border-2 border-emerald-500">
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-emerald-500" />
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-emerald-500" />
      <div className="font-bold text-emerald-500">{data.label}</div>
    </div>
  ),
  input: ({ data }: { data: { label: string } }) => (
    <div className="relative px-4 py-2 shadow-md rounded-md bg-white border-2 border-purple-500">
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-purple-500" />
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-purple-500" />
      <div className="font-bold text-purple-500">{data.label}</div>
    </div>
  ),
  button: ({ data }: { data: { label: string } }) => (
    <div className="relative px-4 py-2 shadow-md rounded-md bg-white border-2 border-orange-500">
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-orange-500" />
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-orange-500" />
      <div className="font-bold text-orange-500">{data.label}</div>
    </div>
  )
};

function Flow({ 
  nodes, 
  edges, 
  onNodesChange, 
  onEdgesChange, 
  onConnect,
  onNodeDragStop
}: {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: any;
  onEdgesChange: any;
  onConnect: any;
  onNodeDragStop: any;
}) {
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeDragStop={onNodeDragStop}
      nodeTypes={nodeTypes}
      fitView
      className="bg-gray-50"
      connectionMode={ConnectionMode.Loose}
      snapToGrid={true}
      snapGrid={[15, 15]}
      defaultEdgeOptions={{
        animated: true,
        style: { stroke: '#6366f1' }
      }}
    >
      <Background />
      <Controls />
      <MiniMap />
      <Panel position="top-right" className="bg-white p-2 rounded shadow-lg">
        <div className="text-sm text-gray-600">
          Drag to connect components
        </div>
      </Panel>
    </ReactFlow>
  );
}

interface FigmaError extends Error {
  status?: number;
  response?: Response;
}

export function WireframeView() {
  const { 
    wireframes = [], 
    addWireframe, 
    updateWireframe, 
    deleteWireframe, 
    deleteElement, 
    figmaToken, 
    setFigmaToken 
  } = useStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [showTokenForm, setShowTokenForm] = useState(!figmaToken);
  const [selectedWireframe, setSelectedWireframe] = useState<string | null>(null);
  const [showElementForm, setShowElementForm] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [newWireframe, setNewWireframe] = useState({
    name: '',
    url: ''
  });
  const [newToken, setNewToken] = useState('');
  const [newElement, setNewElement] = useState<Partial<WireframeElement>>({
    type: 'component',
    data: {
      label: '',
      dataLinks: []
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

  const extractFigmaFileKey = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      if (!urlObj.hostname.includes('figma.com')) return null;
      const pathParts = urlObj.pathname.split('/');
      const fileIndex = pathParts.indexOf('file');
      if (fileIndex !== -1 && pathParts[fileIndex + 1]) {
        return pathParts[fileIndex + 1];
      }
      const designIndex = pathParts.indexOf('design');
      if (designIndex !== -1 && pathParts[designIndex + 1]) {
        return pathParts[designIndex + 1].split('?')[0];
      }
      return null;
    } catch {
      return null;
    }
  };

  const fetchFigmaFile = async (fileKey: string): Promise<string> => {
    if (!figmaToken) {
      throw new Error('Figma access token is required');
    }

    try {
      const response = await fetch(`https://api.figma.com/v1/files/${fileKey}`, {
        headers: {
          'X-Figma-Token': figmaToken
        }
      });

      if (!response.ok) {
        const error = new Error('Failed to fetch Figma file') as FigmaError;
        error.status = response.status;
        error.response = response;
        throw error;
      }

      const data = await response.json();
      
      if (!data.document?.children?.[0]?.id) {
        throw new Error('Invalid Figma file structure');
      }

      const mainFrame = data.document.children[0].id;
      
      const imageResponse = await fetch(
        `https://api.figma.com/v1/images/${fileKey}?ids=${mainFrame}&format=png&scale=2`,
        {
          headers: {
            'X-Figma-Token': figmaToken
          }
        }
      );

      if (!imageResponse.ok) {
        throw new Error('Failed to fetch Figma image');
      }

      const imageData = await imageResponse.json();
      const imageUrl = imageData.images?.[mainFrame];

      if (!imageUrl) {
        throw new Error('No image URL returned from Figma');
      }

      return imageUrl;
    } catch (error) {
      if (error instanceof Error) {
        const figmaError = error as FigmaError;
        if (figmaError.status === 403) {
          throw new Error('Invalid Figma access token');
        } else if (figmaError.status === 404) {
          throw new Error('Figma file not found');
        }
      }
      throw error;
    }
  };

  const handleAddWireframe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!figmaToken) {
      setError('Please set your Figma access token first');
      setShowTokenForm(true);
      return;
    }

    if (!newWireframe.name.trim() || !newWireframe.url.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    const fileKey = extractFigmaFileKey(newWireframe.url);
    if (!fileKey) {
      setError('Please enter a valid Figma URL');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const imageUrl = await fetchFigmaFile(fileKey);

      const wireframe: Wireframe = {
        id: fileKey,
        figmaFileKey: fileKey,
        projectId: '',
        name: newWireframe.name,
        url: newWireframe.url,
        imageUrl,
        elements: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      addWireframe(wireframe);
      setImageUrls(prev => ({ ...prev, [fileKey]: imageUrl }));
      setNewWireframe({ name: '', url: '' });
      setShowAddForm(false);
      setSelectedWireframe(fileKey);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to Figma');
    } finally {
      setLoading(false);
    }
  };

  const handleTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newToken.trim()) {
      setError('Please enter a valid Figma access token');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await fetch('https://api.figma.com/v1/me', {
        headers: {
          'X-Figma-Token': newToken
        }
      }).then(response => {
        if (!response.ok) {
          throw new Error('Invalid Figma access token');
        }
      });

      setFigmaToken(newToken);
      setShowTokenForm(false);
      setNewToken('');

      await Promise.all(
        wireframes.map(async (wireframe) => {
          if (!wireframe) return;
          try {
            const imageUrl = await fetchFigmaFile(wireframe.id);
            setImageUrls(prev => ({ ...prev, [wireframe.id]: imageUrl }));
          } catch {
            // Ignore errors for individual wireframes
          }
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate Figma token');
    } finally {
      setLoading(false);
    }
  };

  const onConnect = useCallback(
    (params: Connection) => {
      if (!selectedWireframe || !params.source || !params.target) return;

      const wireframe = wireframes.find(w => w?.id === selectedWireframe);
      if (!wireframe) return;

      const sourceElement = wireframe.elements?.find(e => e?.id === params.source);
      if (!sourceElement) return;

      const newDataLink = {
        id: crypto.randomUUID(),
        sourceId: params.source,
        targetId: params.target,
        type: 'default'
      };

      const updatedElement = {
        ...sourceElement,
        data: {
          ...sourceElement.data,
          dataLinks: [...(sourceElement.data?.dataLinks || []), newDataLink]
        }
      };

      updateWireframe(selectedWireframe, {
        elements: wireframe.elements?.map(e =>
          e?.id === sourceElement.id ? updatedElement : e
        ).filter(Boolean)
      });

      setEdges(eds => [...eds, { 
        id: newDataLink.id,
        source: params.source,
        target: params.target,
        animated: true,
        style: { stroke: '#6366f1' }
      }]);
    },
    [selectedWireframe, wireframes, updateWireframe]
  );

  const onNodeDragStop = useCallback(
    (event: any, node: Node) => {
      if (!selectedWireframe) return;

      const wireframe = wireframes.find(w => w?.id === selectedWireframe);
      if (!wireframe) return;

      updateWireframe(selectedWireframe, {
        elements: wireframe.elements?.map(e =>
          e?.id === node.id ? { ...e, position: node.position } : e
        ).filter(Boolean)
      });
    },
    [selectedWireframe, wireframes, updateWireframe]
  );

  const handleAddElement = () => {
    if (!selectedWireframe || !newElement.data?.label) return;

    const element: WireframeElement = {
      id: crypto.randomUUID(),
      type: newElement.type as WireframeElement['type'],
      position: { x: Math.random() * 300 + 100, y: Math.random() * 200 + 100 },
      data: {
        label: newElement.data.label,
        dataLinks: []
      }
    };

    const wireframe = wireframes.find(w => w?.id === selectedWireframe);
    if (!wireframe) return;

    updateWireframe(selectedWireframe, {
      elements: [...(wireframe.elements || []), element]
    });

    setNodes(nds => [...nds, {
      id: element.id,
      type: element.type,
      position: element.position,
      data: { label: element.data.label }
    }]);

    setNewElement({
      type: 'component',
      data: {
        label: '',
        dataLinks: []
      }
    });
    setShowElementForm(false);
  };

  const handleDeleteElement = (wireframeId: string, elementId: string) => {
    deleteElement(wireframeId, elementId);
    setNodes(nds => nds.filter(node => node.id !== elementId));
    setEdges(eds => eds.filter(edge => edge.source !== elementId && edge.target !== elementId));
  };

  const handleSelectWireframe = async (wireframeId: string) => {
    setSelectedWireframe(wireframeId);
    const wireframe = wireframes.find(w => w?.id === wireframeId);
    
    if (wireframe) {
      if (!imageUrls[wireframeId] && figmaToken) {
        try {
          const imageUrl = await fetchFigmaFile(wireframeId);
          setImageUrls(prev => ({ ...prev, [wireframeId]: imageUrl }));
        } catch {
          // Handle error silently
        }
      }

      const newNodes: Node[] = (wireframe.elements || []).map(element => ({
        id: element.id,
        type: element.type,
        position: element.position,
        data: { label: element.data?.label }
      }));

      const newEdges: Edge[] = (wireframe.elements || []).flatMap(element =>
        (element.data?.dataLinks || []).map(link => ({
          id: link.id,
          source: link.sourceId,
          target: link.targetId,
          animated: true,
          style: { stroke: '#6366f1' }
        }))
      );

      setNodes(newNodes);
      setEdges(newEdges);
    }
  };

  useEffect(() => {
    if (!figmaToken) {
      setShowTokenForm(true);
    } else if (wireframes.length > 0 && !selectedWireframe) {
      const firstWireframe = wireframes.find(Boolean);
      if (firstWireframe) {
        handleSelectWireframe(firstWireframe.id);
      }
    }
  }, [figmaToken, wireframes]);

  if (showTokenForm) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-6">
            <FileImage className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900">Connect to Figma</h2>
            <p className="mt-2 text-gray-600">
              To view your Figma designs, please enter your Figma access token.
              You can find this in your Figma account settings.
            </p>
          </div>

          <form onSubmit={handleTokenSubmit} className="space-y-4">
            <div>
              <label htmlFor="token" className="block text-sm font-medium text-gray-700">
                Figma Access Token
              </label>
              <input
                type="password"
                id="token"
                value={newToken}
                onChange={(e) => setNewToken(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Enter your Figma access token"
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">{error}</div>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Connecting...
                </>
              ) : (
                'Connect to Figma'
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Wireframes</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Wireframe
        </button>
      </div>

      {wireframes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="mx-auto w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
            <FileImage className="w-12 h-12 text-indigo-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No wireframes yet</h3>
          <p className="text-gray-500 mb-4">Add your first wireframe to get started</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Wireframe
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {wireframes.map((wireframe) => wireframe && (
            <div key={wireframe.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{wireframe.name}</h3>
                  <a 
                    href={wireframe.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center mt-1"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View in Figma
                  </a>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowTokenForm(true)}
                    className="text-gray-400 hover:text-gray-500 p-1 rounded-md hover:bg-gray-50"
                    title="Update Figma Token"
                  >
                    <Settings className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleSelectWireframe(wireframe.id)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      selectedWireframe === wireframe.id
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {selectedWireframe === wireframe.id ? 'Selected' : 'Select'}
                  </button>
                  <button
                    onClick={() => deleteWireframe(wireframe.id)}
                    className="text-red-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="aspect-video bg-gray-50 rounded-lg overflow-hidden mb-4">
                {imageUrls[wireframe.id] ? (
                  <img
                    src={imageUrls[wireframe.id]}
                    alt={`${wireframe.name} preview`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                  </div>
                )}
              </div>

              {selectedWireframe === wireframe.id && (
                <div className="mt-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium text-gray-900">Components</h4>
                    <button
                      onClick={() => setShowElementForm(true)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Component
                    </button>
                  </div>

                  <div className="h-[600px] border rounded-lg overflow-hidden">
                    <ReactFlowProvider>
                      <Flow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onNodeDragStop={onNodeDragStop}
                      />
                    </ReactFlowProvider>
                  </div>

                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Component List</h5>
                    <div className="space-y-2">
                      {(wireframe.elements || []).map((element) => element && (
                        <div
                          key={element.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full bg-${
                              element.type === 'component' ? 'indigo' :
                              element.type === 'container' ? 'emerald' :
                              element.type === 'input' ? 'purple' : 'orange'
                            }-500`} />
                            <span className="font-medium text-gray-900">{element.data?.label}</span>
                            <span className="text-sm text-gray-500">({element.type})</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">
                              {(element.data?.dataLinks || []).length} connections
                            </span>
                            <button
                              onClick={() => handleDeleteElement(wireframe.id, element.id)}
                              className="text-red-400 hover:text-red-500 p-1 rounded hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add New Wireframe</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddWireframe} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Wireframe Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={newWireframe.name}
                  onChange={(e) => setNewWireframe(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Enter a name for this wireframe"
                />
              </div>

              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                  Figma URL
                </label>
                <input
                  type="text"
                  id="url"
                  value={newWireframe.url}
                  onChange={(e) => setNewWireframe(prev => ({ ...prev, url: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="https://www.figma.com/file/xxxxx/..."
                />
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Error</h3>
                      <div className="mt-2 text-sm text-red-700">{error}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Adding...
                    </>
                  ) : (
                    'Add Wireframe'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showElementForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add Component</h3>
              <button
                onClick={() => setShowElementForm(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="elementType" className="block text-sm font-medium text-gray-700">
                  Component Type
                </label>
                <select
                  id="elementType"
                  value={newElement.type}
                  onChange={(e) => setNewElement(prev => ({
                
                    ...prev,
                    type: e.target.value as WireframeElement['type']
                  }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="component">Component</option>
                  <option value="container">Container</option>
                  <option value="input">Input</option>
                  <option value="button">Button</option>
                </select>
              </div>

              <div>
                <label htmlFor="elementLabel" className="block text-sm font-medium text-gray-700">
                  Component Label
                </label>
                <input
                  type="text"
                  id="elementLabel"
                  value={newElement.data?.label || ''}
                  onChange={(e) => setNewElement(prev => ({
                    ...prev,
                    data: { ...prev.data!, label: e.target.value }
                  }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Enter component label"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowElementForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddElement}
                  disabled={!newElement.data?.label}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50"
                >
                  Add Component
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
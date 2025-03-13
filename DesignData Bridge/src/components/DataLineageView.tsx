import React, { useState, useCallback } from 'react';
import { useStore } from '../store';
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
import { Plus, ArrowRight, MessageSquare, History, Search, FileDown, Tag } from 'lucide-react';
import 'reactflow/dist/style.css';

const nodeTypes = {
  source: ({ data }) => (
    <div className="relative px-4 py-2 shadow-md rounded-md bg-white border-2 border-emerald-500 group">
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-emerald-500" />
      <div className="flex items-center">
        <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
        <div className="font-bold text-emerald-500">{data.label}</div>
      </div>
      {data.description && (
        <div className="mt-1 text-sm text-gray-500">{data.description}</div>
      )}
      {data.comments && data.comments.length > 0 && (
        <div className="absolute -top-2 -right-2 bg-indigo-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {data.comments.length}
        </div>
      )}
      {data.tags && data.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {data.tags.map((tag, index) => (
            <span key={index} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  ),
  target: ({ data }) => (
    <div className="relative px-4 py-2 shadow-md rounded-md bg-white border-2 border-purple-500 group">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-purple-500" />
      <div className="flex items-center">
        <div className="w-2 h-2 rounded-full bg-purple-500 mr-2" />
        <div className="font-bold text-purple-500">{data.label}</div>
      </div>
      {data.description && (
        <div className="mt-1 text-sm text-gray-500">{data.description}</div>
      )}
      {data.comments && data.comments.length > 0 && (
        <div className="absolute -top-2 -right-2 bg-indigo-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {data.comments.length}
        </div>
      )}
      {data.tags && data.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {data.tags.map((tag, index) => (
            <span key={index} className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  ),
  transform: ({ data }) => (
    <div className="relative px-4 py-2 shadow-md rounded-md bg-white border-2 border-indigo-500 group">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-indigo-500" />
      <div className="flex items-center">
        <div className="w-2 h-2 rounded-full bg-indigo-500 mr-2" />
        <div className="font-bold text-indigo-500">{data.label}</div>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-indigo-500" />
      {data.description && (
        <div className="mt-1 text-sm text-gray-500">{data.description}</div>
      )}
      {data.comments && data.comments.length > 0 && (
        <div className="absolute -top-2 -right-2 bg-indigo-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {data.comments.length}
        </div>
      )}
      {data.tags && data.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {data.tags.map((tag, index) => (
            <span key={index} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>
      )}
      {data.schema && (
        <div className="mt-2 text-xs text-gray-500">
          {data.schema.length} schema fields
        </div>
      )}
    </div>
  )
};

export function DataLineageView() {
  const { wireframes, dataLineage, addDataLineage } = useStore();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedSource, setSelectedSource] = useState('');
  const [selectedTarget, setSelectedTarget] = useState('');
  const [transformationName, setTransformationName] = useState('');
  const [transformationDescription, setTransformationDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  // Get all components that have data links
  const connectedComponents = wireframes.flatMap(wireframe =>
    wireframe.elements.filter(element => element.data.dataLinks.length > 0)
  );

  const filteredComponents = connectedComponents.filter(component => {
    const matchesSearch = searchTerm === '' || 
      component.data.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (component.data.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tag => component.data.tags?.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges(eds => [...eds, { 
        ...params, 
        animated: true,
        style: { stroke: '#6366f1' }
      }]);
    },
    []
  );

  const handleAddTransformation = () => {
    if (!selectedSource || !selectedTarget || !transformationName) return;

    const sourceNode = {
      id: `source-${selectedSource}`,
      type: 'source',
      position: { x: 100, y: 100 },
      data: { 
        label: connectedComponents.find(c => c.id === selectedSource)?.data.label,
        description: transformationDescription,
        tags: selectedTags,
        comments: []
      }
    };

    const transformNode = {
      id: `transform-${transformationName}`,
      type: 'transform',
      position: { x: 350, y: 100 },
      data: { 
        label: transformationName,
        description: transformationDescription,
        tags: selectedTags,
        comments: [],
        schema: []
      }
    };

    const targetNode = {
      id: `target-${selectedTarget}`,
      type: 'target',
      position: { x: 600, y: 100 },
      data: { 
        label: connectedComponents.find(c => c.id === selectedTarget)?.data.label,
        description: transformationDescription,
        tags: selectedTags,
        comments: []
      }
    };

    setNodes([sourceNode, transformNode, targetNode]);
    setEdges([
      { 
        id: `edge-1-${Date.now()}`,
        source: sourceNode.id,
        target: transformNode.id,
        animated: true,
        style: { stroke: '#6366f1' }
      },
      {
        id: `edge-2-${Date.now()}`,
        source: transformNode.id,
        target: targetNode.id,
        animated: true,
        style: { stroke: '#6366f1' }
      }
    ]);

    addDataLineage({
      id: crypto.randomUUID(),
      name: transformationName,
      source: selectedSource,
      target: selectedTarget,
      schema: []
    });

    setShowAddForm(false);
    setSelectedSource('');
    setSelectedTarget('');
    setTransformationName('');
    setTransformationDescription('');
    setSelectedTags([]);
  };

  const handleExport = () => {
    const exportData = {
      nodes,
      edges,
      dataLineage,
      metadata: {
        exportedAt: new Date().toISOString(),
        version: '1.0'
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data-lineage-export-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-semibold text-gray-900">Data Flow</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  showHistory ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <History className="h-4 w-4 inline mr-1" />
                History
              </button>
              <button
                onClick={handleExport}
                className="px-3 py-1 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                <FileDown className="h-4 w-4 inline mr-1" />
                Export
              </button>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Data Flow
          </button>
        </div>

        <div className="mb-6 flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search components..."
                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <Tag className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newTag.trim()) {
                    setSelectedTags([...selectedTags, newTag.trim()]);
                    setNewTag('');
                  }
                }}
                placeholder="Add tags..."
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            {selectedTags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedTags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))}
                      className="ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="h-[600px] border rounded-lg overflow-hidden">
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              fitView
              className="bg-gray-50"
              connectionMode={ConnectionMode.Strict}
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
                  Click nodes to view details and add comments
                </div>
              </Panel>
            </ReactFlow>
          </ReactFlowProvider>
        </div>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Data Flow</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Source Component</label>
                <select
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Select source component</option>
                  {filteredComponents.map((component) => (
                    <option key={component.id} value={component.id}>
                      {component.data.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Transformation Name</label>
                <input
                  type="text"
                  value={transformationName}
                  onChange={(e) => setTransformationName(e.target.value)}
                  placeholder="e.g., Format Data, Calculate Total"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={transformationDescription}
                  onChange={(e) => setTransformationDescription(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Describe the data transformation..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Target Component</label>
                <select
                  value={selectedTarget}
                  onChange={(e) => setSelectedTarget(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Select target component</option>
                  {filteredComponents.map((component) => (
                    <option key={component.id} value={component.id}>
                      {component.data.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTransformation}
                  disabled={!selectedSource || !selectedTarget || !transformationName}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Create Flow
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showHistory && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Change History</h3>
          <div className="space-y-4">
            {dataLineage.map((lineage) => (
              <div key={lineage.id} className="border-l-2 border-indigo-200 pl-4">
                <div className="text-sm text-gray-600">
                  {new Date(lineage.createdAt || Date.now()).toLocaleString()}
                </div>
                <div className="font-medium text-gray-900">{lineage.name}</div>
                <div className="text-sm text-gray-500">
                  Created by {lineage.createdBy || 'Unknown'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
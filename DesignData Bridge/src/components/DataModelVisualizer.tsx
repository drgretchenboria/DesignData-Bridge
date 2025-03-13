import React, { useEffect, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Panel,
  Position,
  Handle
} from 'reactflow';
import { useStore } from '../store';
import { CommentPopover } from './CommentPopover';
import type { Comment, User } from '../types';

interface DataModelVisualizerProps {
  wireframeId: string | null;
}

const nodeTypes = {
  wireframeComponent: ({ data }: { data: any }) => (
    <div className="relative px-4 py-2 shadow-md rounded-md bg-white border-2 border-indigo-500">
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-indigo-500" />
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-indigo-500" />
      <div className="font-bold text-indigo-500">{data.label}</div>
      {data.description && (
        <div className="mt-1 text-sm text-gray-500">{data.description}</div>
      )}
      {data.imageUrl && (
        <div className="mt-2 w-48 h-32 overflow-hidden rounded-md">
          <img 
            src={data.imageUrl} 
            alt={data.label} 
            className="w-full h-full object-contain"
          />
        </div>
      )}
    </div>
  ),
  dataModel: ({ data }: { data: any }) => (
    <div className="relative px-4 py-2 shadow-md rounded-md bg-white border-2 border-emerald-500">
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-emerald-500" />
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-emerald-500" />
      <div className="font-bold text-emerald-500">{data.label}</div>
      {data.fields && (
        <div className="mt-2 text-xs text-gray-500">
          {data.fields.map((field: any, index: number) => (
            <div key={index} className="flex items-center space-x-1">
              <span className="font-medium">{field.name}</span>
              <span className="text-gray-400">({field.type})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
};

export function DataModelVisualizer({ wireframeId }: DataModelVisualizerProps) {
  const { wireframes, dataLineage } = useStore();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [users] = useState<User[]>([
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' }
  ]);

  useEffect(() => {
    if (!wireframeId) return;

    const wireframe = wireframes.find(w => w?.id === wireframeId);
    if (!wireframe) return;

    const wireframeNodes: Node[] = (wireframe.elements || []).map((element, index) => ({
      id: element.id,
      type: 'wireframeComponent',
      position: { x: 100, y: 100 + index * 250 }, // Increased spacing for images
      data: {
        label: element.data?.label,
        description: element.data?.description,
        imageUrl: wireframe.imageUrl,
        comments: comments.filter(c => c.elementId === element.id)
      }
    }));

    const dataNodes: Node[] = dataLineage
      .filter(lineage => lineage.source === wireframeId || lineage.target === wireframeId)
      .map((lineage, index) => ({
        id: lineage.id,
        type: 'dataModel',
        position: { x: 500, y: 100 + index * 150 },
        data: {
          label: lineage.name,
          fields: lineage.schema
        }
      }));

    const dataEdges: Edge[] = dataLineage
      .filter(lineage => lineage.source === wireframeId || lineage.target === wireframeId)
      .map(lineage => ({
        id: `e-${lineage.id}`,
        source: lineage.source,
        target: lineage.id,
        animated: true,
        style: { stroke: '#10b981' }
      }));

    setNodes([...wireframeNodes, ...dataNodes]);
    setEdges(dataEdges);
  }, [wireframeId, wireframes, dataLineage, comments]);

  const handleAddComment = (elementId: string, content: string, mentions: string[]) => {
    const newComment: Comment = {
      id: crypto.randomUUID(),
      elementId,
      content,
      author: 'Current User',
      createdAt: new Date(),
      mentions
    };

    setComments(prev => [...prev, newComment]);

    setNodes(prev => prev.map(node => {
      if (node.id === elementId) {
        return {
          ...node,
          data: {
            ...node.data,
            comments: [...(node.data.comments || []), newComment]
          }
        };
      }
      return node;
    }));
  };

  return (
    <div className="relative h-[600px] border rounded-lg overflow-hidden bg-gray-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.5}
        maxZoom={2}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: '#10b981' }
        }}
      >
        <Background />
        <Controls />
        <MiniMap />
        <Panel position="top-right" className="bg-white p-2 rounded shadow-lg">
          <div className="text-sm text-gray-600">
            Click nodes to view and add comments
          </div>
        </Panel>
      </ReactFlow>
      {nodes.map(node => (
        <div
          key={node.id}
          className="absolute"
          style={{
            left: `${node.position.x + 150}px`, // Position to the right of the node
            top: `${node.position.y}px`,
            transform: 'translateY(-50%)'
          }}
        >
          <CommentPopover
            elementId={node.id}
            comments={node.data.comments || []}
            onAddComment={handleAddComment}
            users={users}
          />
        </div>
      ))}
    </div>
  );
}
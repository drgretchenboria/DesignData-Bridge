import React, { useEffect, useRef } from 'react';
import Graph from 'graphology';
import Sigma from 'sigma';
import { circular } from 'graphology-layout';
import forceAtlas2 from 'graphology-layout-force';
import type { SchemaVisualization } from '../types';

interface SchemaVisualizerProps {
  data: SchemaVisualization;
  width?: number;
  height?: number;
}

export function SchemaVisualizer({ data, width = 800, height = 600 }: SchemaVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sigmaRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create graph
    const graph = new Graph();

    // Add nodes
    data.nodes.forEach(node => {
      graph.addNode(node.id, {
        label: node.label,
        size: node.type === 'table' ? 15 : 10,
        color: node.type === 'table' ? '#6366f1' : 
               node.type === 'column' ? '#10b981' : '#8b5cf6',
        type: node.type,
        data: node.data
      });
    });

    // Add edges
    data.edges.forEach(edge => {
      graph.addEdge(edge.source, edge.target, {
        label: edge.label,
        type: edge.type,
        size: 2,
        color: edge.type === 'relationship' ? '#6366f1' : '#10b981'
      });
    });

    // Apply layout
    circular.assign(graph);
    forceAtlas2.assign(graph, { iterations: 50 });

    // Initialize Sigma
    sigmaRef.current = new Sigma(graph, containerRef.current, {
      renderEdgeLabels: true,
      allowInvalidContainer: true,
      defaultEdgeColor: '#e5e7eb',
      defaultNodeColor: '#6366f1',
      defaultEdgeType: 'arrow',
      labelSize: 12,
      labelColor: {
        color: '#1f2937'
      },
      nodeHoverColor: '#4f46e5',
      edgeHoverColor: '#4f46e5'
    });

    return () => {
      if (sigmaRef.current) {
        sigmaRef.current.kill();
      }
    };
  }, [data]);

  return (
    <div 
      ref={containerRef} 
      style={{ width, height }}
      className="border rounded-lg overflow-hidden bg-white"
    />
  );
}
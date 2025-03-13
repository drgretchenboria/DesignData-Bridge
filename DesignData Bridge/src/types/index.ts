import { Project, Wireframe, DataLineage, OpenMetadataConfig } from './data';

export interface Comment {
  id: string;
  elementId: string;
  content: string;
  author: string;
  createdAt: Date;
  mentions?: string[];
  replies?: Comment[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface JiraConfig {
  host: string;
  email: string;
  apiToken: string;
  project: string;
}

export interface SchemaVisualization {
  nodes: Array<{
    id: string;
    label: string;
    type: 'table' | 'column' | 'relationship';
    data: any;
  }>;
  edges: Array<{
    source: string;
    target: string;
    label?: string;
    type?: 'relationship' | 'column';
  }>;
}

export type {
  Project,
  Wireframe,
  DataLineage,
  OpenMetadataConfig
};
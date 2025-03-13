export interface Project {
  id: string;
  name: string;
  description?: string;
  wireframeIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Wireframe {
  id: string;
  figmaFileKey: string;
  projectId: string;
  name: string;
  url: string;
  imageUrl?: string;
  elements: WireframeElement[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WireframeElement {
  id: string;
  type: 'component' | 'container' | 'input' | 'button';
  position: { x: number; y: number };
  size?: { width: number; height: number };
  data: {
    label: string;
    description?: string;
    dataLinks: DataLink[];
    tags?: string[];
    annotations?: Annotation[];
  };
}

export interface DataLink {
  id: string;
  sourceId: string;
  targetId: string;
  type: string;
  description?: string;
}

export interface Annotation {
  id: string;
  content: string;
  position: { x: number; y: number };
  createdAt: Date;
  createdBy?: string;
}

export interface DataLineage {
  id: string;
  name: string;
  source: string;
  target: string;
  schema: SchemaField[];
  createdAt?: Date;
  createdBy?: string;
}

export interface SchemaField {
  name: string;
  type: string;
  description: string;
  required: boolean;
  constraints?: {
    unique?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
  relationships?: {
    table: string;
    field: string;
    type: 'oneToOne' | 'oneToMany' | 'manyToOne' | 'manyToMany';
  }[];
}

export interface OpenMetadataConfig {
  host: string;
  apiToken: string;
}
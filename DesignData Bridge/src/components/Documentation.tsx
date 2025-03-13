import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Book, Code, Database, Network } from 'lucide-react';

const sections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Book,
    content: `
# Getting Started with DesignData Bridge

## Overview
DesignData Bridge helps you connect design components to data models and create meaningful relationships between them.

### Key Features
- Import Figma designs
- Map UI components to data elements
- Create data flows and transformations
- Define and visualize data schemas
- Add comments and annotations
- Optional Jira integration

## Quick Setup

1. Install Dependencies:

\`\`\`bash
npm install
\`\`\`

2. Configure Environment:

\`\`\`env
VITE_FIGMA_ACCESS_TOKEN=your_figma_token
VITE_JIRA_HOST=https://your-domain.atlassian.net
VITE_JIRA_EMAIL=your-email
VITE_JIRA_API_TOKEN=your-api-token
VITE_JIRA_PROJECT=project-key
\`\`\`

3. Start Development Server:

\`\`\`bash
npm run dev
\`\`\`

## Core Concepts

### Wireframes
- Import designs from Figma
- Map components to data elements
- Add annotations and comments

### Data Flow
- Create data transformations
- Define relationships
- Document data lineage

### Data Models
- Create and manage schemas
- Define field types and constraints
- Visualize relationships

### Collaboration
- Add comments with @mentions
- Create Jira issues
- Track changes and history
    `
  },
  {
    id: 'wireframes',
    title: 'Working with Wireframes',
    icon: Code,
    content: `
# Working with Wireframes

## Importing Figma Designs

1. Get Figma Access Token:
   - Go to Figma account settings
   - Navigate to Access Tokens
   - Create a new access token
   - Copy the token

2. Configure Token:
   - Open Settings in DesignData Bridge
   - Paste your Figma access token
   - Save the configuration

3. Import Design:
   - Click "Add Wireframe"
   - Paste your Figma file URL
   - Select components to import
   - Map data elements

## Component Types

### UI Components
- Input fields
- Buttons
- Forms
- Display elements

### Containers
- Sections
- Cards
- Layouts
- Groups

### Data Elements
- Tables
- Lists
- Charts
- Metrics

## Best Practices

1. Organization:
   - Use clear naming conventions
   - Group related components
   - Add descriptions
   - Tag components

2. Data Mapping:
   - Map to relevant data sources
   - Define transformations
   - Document relationships
   - Add validation rules

3. Documentation:
   - Add component descriptions
   - Document data flows
   - Include usage examples
   - Note dependencies
    `
  },
  {
    id: 'data-lineage',
    title: 'Data Lineage',
    icon: Network,
    content: `
# Understanding Data Lineage

## Creating Data Flows

1. Source Selection:
   - Choose source component
   - Define output format
   - Set validation rules
   - Add documentation

2. Transformation:
   - Define transformation rules
   - Set data mappings
   - Add validation
   - Document changes

3. Target Mapping:
   - Select target component
   - Map input fields
   - Set constraints
   - Validate flow

## Visualization

### Graph View
- Interactive node graph
- Relationship lines
- Flow direction
- Data transformations

### Documentation
- Flow descriptions
- Change history
- Dependencies
- Validation rules

## Best Practices

1. Design:
   - Keep flows simple
   - Document clearly
   - Use consistent naming
   - Add descriptions

2. Validation:
   - Test transformations
   - Verify mappings
   - Check constraints
   - Monitor changes

3. Maintenance:
   - Review regularly
   - Update documentation
   - Clean unused flows
   - Track changes
    `
  },
  {
    id: 'schema',
    title: 'Data Models',
    icon: Database,
    content: `
# Working with Data Models

## Creating Schemas

1. Table Definition:
   - Name and description
   - Primary key
   - Indexes
   - Constraints

2. Field Types:
   - String
   - Number
   - Boolean
   - Date/Time
   - Object
   - Array

3. Relationships:
   - One-to-One
   - One-to-Many
   - Many-to-Many
   - Self-referential

## Schema Visualization

### Entity Diagram
- Tables and fields
- Relationships
- Constraints
- Indexes

### Documentation
- Field descriptions
- Usage examples
- Validation rules
- Change history

## Best Practices

1. Design:
   - Use clear names
   - Add descriptions
   - Set constraints
   - Document relationships

2. Validation:
   - Test constraints
   - Verify relationships
   - Check data types
   - Validate rules

3. Maintenance:
   - Review schemas
   - Update documentation
   - Track changes
   - Clean unused elements
    `
  }
];

interface DocumentationProps {
  initialSection?: string;
}

export function Documentation({ initialSection = 'getting-started' }: DocumentationProps) {
  const [activeSection, setActiveSection] = React.useState(initialSection);

  return (
    <div className="bg-white shadow rounded-lg flex min-h-[calc(100vh-8rem)]">
      <div className="w-64 border-r border-gray-200 p-4">
        <div className="text-lg font-medium text-gray-900 mb-4">Documentation</div>
        <nav className="space-y-1">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeSection === section.id
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {section.title}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        <div className="prose prose-indigo max-w-none">
          {sections.map((section) => (
            <div
              key={section.id}
              className={activeSection === section.id ? 'block' : 'hidden'}
            >
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl font-medium text-gray-900 mt-6 mb-3">{children}</h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-gray-600 mb-4 leading-relaxed">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside space-y-2 mb-4 text-gray-600">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-600">{children}</ol>
                  ),
                  code: ({ inline, children }) => {
                    if (inline) {
                      return <code className="bg-gray-100 text-indigo-600 px-1 py-0.5 rounded">{children}</code>;
                    }
                    return (
                      <div className="bg-gray-800 rounded-lg overflow-x-auto">
                        <pre className="p-4">
                          <code className="text-white">{children}</code>
                        </pre>
                      </div>
                    );
                  }
                }}
              >
                {section.content}
              </ReactMarkdown>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
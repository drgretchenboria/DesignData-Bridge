import React from 'react';
import { Book, FileText, MessageSquare, Network, Database, Settings } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const sections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Book,
    content: `
### Welcome to DesignData Bridge

This tool helps you connect your design components to data models and create meaningful relationships between them.

#### Quick Start Guide

1. **Import Wireframes**
   - Click "Add Wireframe" to import your Figma design
   - Enter your Figma access token
   - Select components to map to data elements

2. **Add Comments and Annotations**
   - Click the comment icon on any element to add notes
   - Use @ mentions to notify team members
   - View and respond to comments in the thread

3. **Create Data Flows**
   - Connect source and target components
   - Define transformations between elements
   - Document data relationships with comments

4. **Define Data Models**
   - Create and visualize data schemas
   - Link schemas to components
   - Add field descriptions and validations
    `
  },
  {
    id: 'annotations',
    title: 'Comments & Annotations',
    icon: MessageSquare,
    content: `
### Working with Comments

#### Adding Comments
- Click the comment icon (💬) on any element
- Type your comment and press Enter
- Use @ to mention team members

#### Viewing Comments
- Comment count badges show number of comments
- Click comment icon to view thread
- Comments are sorted by date
- Replies are nested under parent comments

#### Best Practices
- Keep comments focused and actionable
- Use comments to document decisions
- Link to relevant resources
- Follow up on comment threads
    `
  },
  {
    id: 'data-flows',
    title: 'Data Flow Management',
    icon: Network,
    content: `
### Creating Data Flows

#### Connecting Elements
- Drag from source to target nodes
- Define transformation rules
- Add comments to document flow

#### Visualization
- View full data lineage graph
- Filter by component or type
- Export diagrams as images
- Share links to specific views

#### Documentation
- Add descriptions to flows
- Link to external resources
- Track changes in history
- Export documentation
    `
  },
  {
    id: 'schema',
    title: 'Data Models & Schema',
    icon: Database,
    content: `
### Managing Data Models

#### Creating Schemas
- Define field types and rules
- Add descriptions and examples
- Set validation requirements
- Link to business glossary

#### Visualization
- View schema relationships
- Track field dependencies
- Generate documentation
- Export schema definitions

#### Best Practices
- Use consistent naming
- Document all fields
- Define clear relationships
- Keep schemas up to date
    `
  },
  {
    id: 'settings',
    title: 'Settings & Configuration',
    icon: Settings,
    content: `
### Application Settings

#### General
- Update profile information
- Configure notifications
- Manage integrations
- Set preferences

#### Team Settings
- Manage access control
- Set up teams
- Configure sharing
- Audit activity

#### Support
Need help? Contact support at support@example.com
    `
  }
];

export function HelpView() {
  const [activeSection, setActiveSection] = React.useState(sections[0].id);

  return (
    <div className="bg-white shadow rounded-lg flex min-h-[calc(100vh-8rem)]">
      <div className="w-64 border-r border-gray-200 p-4">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Documentation</h2>
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
        {sections.map((section) => (
          <div
            key={section.id}
            className={activeSection === section.id ? 'block' : 'hidden'}
          >
            <div className="prose max-w-none">
              <ReactMarkdown>{section.content}</ReactMarkdown>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { Version2Client } from 'jira.js';
import { AlertCircle, Link2, Settings } from 'lucide-react';
import type { JiraConfig } from '../types';

interface JiraIntegrationProps {
  onConnect: (config: JiraConfig) => void;
  onCreateIssue: (summary: string, description: string) => Promise<void>;
  isConnected: boolean;
}

export function JiraIntegration({ onConnect, onCreateIssue, isConnected }: JiraIntegrationProps) {
  const [showConfig, setShowConfig] = useState(!isConnected);
  const [config, setConfig] = useState<Partial<JiraConfig>>({
    host: '',
    email: '',
    apiToken: '',
    project: ''
  });
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config.host || !config.email || !config.apiToken || !config.project) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const client = new Version2Client({
        host: config.host,
        authentication: {
          basic: {
            email: config.email,
            apiToken: config.apiToken
          }
        }
      });

      // Test connection
      await client.projects.getProject({ projectIdOrKey: config.project });

      onConnect(config as JiraConfig);
      setShowConfig(false);
      setError(null);
    } catch (err) {
      setError('Failed to connect to Jira. Please check your credentials.');
    }
  };

  if (!showConfig && isConnected) {
    return (
      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
        <div className="flex items-center">
          <Link2 className="h-5 w-5 text-green-500 mr-2" />
          <span className="text-green-700">Connected to Jira</span>
        </div>
        <button
          onClick={() => setShowConfig(true)}
          className="text-green-700 hover:text-green-800"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Jira Integration</h3>
      <form onSubmit={handleConnect} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Jira Host URL
          </label>
          <input
            type="text"
            value={config.host}
            onChange={(e) => setConfig(prev => ({ ...prev, host: e.target.value }))}
            placeholder="https://your-domain.atlassian.net"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            value={config.email}
            onChange={(e) => setConfig(prev => ({ ...prev, email: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            API Token
          </label>
          <input
            type="password"
            value={config.apiToken}
            onChange={(e) => setConfig(prev => ({ ...prev, apiToken: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Project Key
          </label>
          <input
            type="text"
            value={config.project}
            onChange={(e) => setConfig(prev => ({ ...prev, project: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Connect to Jira
        </button>
      </form>
    </div>
  );
}
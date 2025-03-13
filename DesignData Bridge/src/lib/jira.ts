import type { JiraConfig } from '../types';

export async function isJiraAvailable(): Promise<boolean> {
  return false;
}

export async function initJiraClient(config: JiraConfig): Promise<boolean> {
  return false;
}

export async function createJiraIssue(config: JiraConfig, summary: string, description: string) {
  throw new Error('Jira integration is not available. Install the optional jira.js package to enable this feature.');
}

export async function testJiraConnection(config: JiraConfig): Promise<boolean> {
  return false;
}
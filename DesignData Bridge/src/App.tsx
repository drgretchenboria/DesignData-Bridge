import React from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { WireframeView } from './components/WireframeView';
import { DataLineageView } from './components/DataLineageView';
import { SchemaView } from './components/SchemaView';
import { ProfileView } from './components/ProfileView';
import { SettingsView } from './components/SettingsView';
import { Documentation } from './components/Documentation';
import { useStore } from './store';

function App() {
  const { activeSetting, currentProject } = useStore();

  const renderContent = () => {
    // If no project is selected and we're not on the dashboard, profile, settings, or help pages,
    // redirect to dashboard
    if (!currentProject && !['dashboard', 'profile', 'settings', 'help'].includes(activeSetting)) {
      return <Dashboard />;
    }

    switch (activeSetting) {
      case 'dashboard':
        return <Dashboard />;
      case 'wireframes':
        return <WireframeView />;
      case 'dataLineage':
        return <DataLineageView />;
      case 'schema':
        return <SchemaView />;
      case 'profile':
        return <ProfileView />;
      case 'settings':
        return <SettingsView />;
      case 'help':
        return <Documentation />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout>
      {renderContent()}
    </Layout>
  );
}

export default App;
import React from 'react';
import { 
  LayoutDashboard,
  FileImage,
  Network,
  Database,
  Settings,
  HelpCircle,
  UserCircle,
  ChevronLeft
} from 'lucide-react';
import { useStore } from '../store';
import { cn } from '../lib/utils';

const navigationItems = [
  { icon: LayoutDashboard, label: 'Dashboard', value: 'dashboard' },
  { icon: FileImage, label: 'Wireframes', value: 'wireframes', requiresProject: true },
  { icon: Network, label: 'Data Flow', value: 'dataLineage', requiresProject: true },
  { icon: Database, label: 'Data Models', value: 'schema', requiresProject: true },
] as const;

const settingsItems = [
  { icon: UserCircle, label: 'Profile', value: 'profile' },
  { icon: Settings, label: 'Settings', value: 'settings' },
  { icon: HelpCircle, label: 'Help', value: 'help' },
] as const;

export function Sidebar() {
  const { activeSetting, setActiveSetting, currentProject, setCurrentProject } = useStore();

  const handleNavigation = (item: typeof navigationItems[number] | typeof settingsItems[number]) => {
    if (item.requiresProject && !currentProject) {
      setActiveSetting('dashboard');
    } else {
      setActiveSetting(item.value);
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          {currentProject && (
            <div className="px-4 mb-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-gray-900 truncate">
                  {currentProject.name}
                </h2>
                <button
                  onClick={() => {
                    setCurrentProject(null);
                    setActiveSetting('dashboard');
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {renderNavSection(navigationItems)}
          <div className="mt-auto pt-4 border-t">
            {renderNavSection(settingsItems)}
          </div>
        </div>
      </div>
    </div>
  );

  function renderNavSection(items: typeof navigationItems | typeof settingsItems) {
    return (
      <div className="space-y-1 px-2">
        {items.map((item) => {
          const isDisabled = item.requiresProject && !currentProject;
          return (
            <button
              key={item.value}
              onClick={() => handleNavigation(item)}
              disabled={isDisabled}
              className={cn(
                "w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                activeSetting === item.value
                  ? "bg-indigo-50 text-indigo-600"
                  : isDisabled
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
            </button>
          );
        })}
      </div>
    );
  }
}
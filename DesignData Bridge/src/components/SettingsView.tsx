import React, { useState } from 'react';
import { Bell, Moon, Globe, Palette, AlertCircle } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';
type Language = 'en' | 'es' | 'fr' | 'de';

interface Settings {
  theme: Theme;
  language: Language;
  notifications: {
    email: boolean;
    desktop: boolean;
    mentions: boolean;
    updates: boolean;
  };
  appearance: {
    density: 'comfortable' | 'compact';
    fontSize: 'small' | 'medium' | 'large';
    colorScheme: 'blue' | 'purple' | 'green';
  };
}

export function SettingsView() {
  const [settings, setSettings] = useState<Settings>({
    theme: 'system',
    language: 'en',
    notifications: {
      email: true,
      desktop: true,
      mentions: true,
      updates: false
    },
    appearance: {
      density: 'comfortable',
      fontSize: 'medium',
      colorScheme: 'blue'
    }
  });
  const [success, setSuccess] = useState<string | null>(null);

  const handleSettingChange = <T extends keyof Settings>(
    setting: T,
    value: Settings[T]
  ) => {
    setSettings(prev => ({ ...prev, [setting]: value }));
  };

  const handleNotificationChange = (key: keyof Settings['notifications']) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key]
      }
    }));
  };

  const handleAppearanceChange = (key: keyof Settings['appearance'], value: string) => {
    setSettings(prev => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        [key]: value
      }
    }));
  };

  const handleSave = () => {
    // Here you would typically save to backend
    setSuccess('Settings saved successfully');
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Theme Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Moon className="h-5 w-5 text-gray-400 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">Theme</h2>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {(['light', 'dark', 'system'] as const).map((theme) => (
            <button
              key={theme}
              onClick={() => handleSettingChange('theme', theme)}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                settings.theme === theme
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Language Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Globe className="h-5 w-5 text-gray-400 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">Language</h2>
        </div>
        <select
          value={settings.language}
          onChange={(e) => handleSettingChange('language', e.target.value as Language)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
        </select>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Bell className="h-5 w-5 text-gray-400 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">Notifications</h2>
        </div>
        <div className="space-y-4">
          {Object.entries(settings.notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-gray-700">
                {key.charAt(0).toUpperCase() + key.slice(1)} notifications
              </span>
              <button
                onClick={() => handleNotificationChange(key as keyof Settings['notifications'])}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  value ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    value ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Appearance Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Palette className="h-5 w-5 text-gray-400 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">Appearance</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Density</label>
            <select
              value={settings.appearance.density}
              onChange={(e) => handleAppearanceChange('density', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="comfortable">Comfortable</option>
              <option value="compact">Compact</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Font Size</label>
            <select
              value={settings.appearance.fontSize}
              onChange={(e) => handleAppearanceChange('fontSize', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Color Scheme</label>
            <select
              value={settings.appearance.colorScheme}
              onChange={(e) => handleAppearanceChange('colorScheme', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="blue">Blue</option>
              <option value="purple">Purple</option>
              <option value="green">Green</option>
            </select>
          </div>
        </div>
      </div>

      {success && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
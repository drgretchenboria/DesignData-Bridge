import React from 'react';
import { Network } from 'lucide-react';
import { HelpButton } from './HelpButton';

export function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <div className="flex items-center">
                <Network className="h-8 w-8 text-indigo-600" />
                <span className="ml-2 text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  DesignData
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <HelpButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
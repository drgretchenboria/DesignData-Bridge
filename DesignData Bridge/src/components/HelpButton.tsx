import React from 'react';
import { HelpCircle } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { Documentation } from './Documentation';

interface HelpButtonProps {
  section?: string;
}

export function HelpButton({ section }: HelpButtonProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          className="p-2 text-gray-500 hover:text-gray-600 hover:bg-gray-100 rounded-full"
          aria-label="Help"
        >
          <HelpCircle className="h-5 w-5" />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed inset-4 bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="h-full flex flex-col">
            <Dialog.Title asChild>
              <div className="flex items-center justify-between p-4 border-b">
                <span className="text-lg font-semibold text-gray-900">Help & Documentation</span>
                <Dialog.Close className="text-gray-400 hover:text-gray-500">
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Dialog.Close>
              </div>
            </Dialog.Title>
            <div className="flex-1 overflow-auto">
              <Documentation initialSection={section} />
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
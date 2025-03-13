import React, { useState } from 'react';
import { useStore } from '../store';
import { Plus, Table, KeyRound, ArrowRight, X, AlertCircle, Trash2 } from 'lucide-react';
import { DataModelVisualizer } from './DataModelVisualizer';
import type { SchemaField } from '../types';

export function SchemaView() {
  const { wireframes, dataLineage, updateDataLineage, deleteDataLineage } = useStore();
  const [showAddFieldForm, setShowAddFieldForm] = useState(false);
  const [selectedWireframe, setSelectedWireframe] = useState<string | null>(null);
  const [selectedLineage, setSelectedLineage] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newField, setNewField] = useState<Partial<SchemaField>>({
    name: '',
    type: 'string',
    description: '',
    required: false
  });

  const handleAddField = () => {
    if (!selectedLineage || !newField.name || !newField.type) return;

    const field: SchemaField = {
      name: newField.name,
      type: newField.type,
      description: newField.description || '',
      required: newField.required || false
    };

    updateDataLineage(selectedLineage, {
      schema: [...(dataLineage.find(l => l.id === selectedLineage)?.schema || []), field]
    });

    setNewField({
      name: '',
      type: 'string',
      description: '',
      required: false
    });
    setShowAddFieldForm(false);
  };

  const handleDeleteLineage = () => {
    if (!selectedLineage) return;
    deleteDataLineage(selectedLineage);
    setSelectedLineage(null);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-2xl font-semibold text-gray-900">Data Models</span>
            <div className="flex space-x-4">
              <select
                value={selectedWireframe || ''}
                onChange={(e) => setSelectedWireframe(e.target.value || null)}
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Select a wireframe</option>
                {wireframes.map((wireframe) => (
                  <option key={wireframe.id} value={wireframe.id}>
                    {wireframe.name}
                  </option>
                ))}
              </select>
              <select
                value={selectedLineage || ''}
                onChange={(e) => setSelectedLineage(e.target.value || null)}
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Select a data flow</option>
                {dataLineage.map((lineage) => (
                  <option key={lineage.id} value={lineage.id}>
                    {lineage.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowAddFieldForm(true)}
              disabled={!selectedLineage}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Field
            </button>
            {selectedLineage && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Model
              </button>
            )}
          </div>
        </div>

        {selectedWireframe && (
          <div className="mb-6">
            <span className="text-lg font-medium text-gray-900 mb-4 block">Data Model Visualization</span>
            <DataModelVisualizer wireframeId={selectedWireframe} />
          </div>
        )}

        {selectedLineage ? (
          <div className="space-y-6">
            {dataLineage.map((lineage) => {
              if (lineage.id !== selectedLineage) return null;

              return (
                <div key={lineage.id} className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <KeyRound className="h-5 w-5 text-indigo-500" />
                        <span className="text-lg font-medium text-gray-900">{lineage.name}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {lineage.schema.length} fields
                      </div>
                    </div>
                  </div>

                  <div className="divide-y">
                    {lineage.schema.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-500 italic">
                        No fields defined yet
                      </div>
                    ) : (
                      lineage.schema.map((field, index) => (
                        <div key={index} className="px-4 py-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-900">{field.name}</span>
                                <span className="text-sm text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                                  {field.type}
                                </span>
                                {field.required && (
                                  <span className="text-sm text-red-600 bg-red-50 px-2 py-0.5 rounded">
                                    Required
                                  </span>
                                )}
                              </div>
                              {field.description && (
                                <p className="mt-1 text-sm text-gray-500">{field.description}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Table className="mx-auto h-12 w-12 text-gray-400" />
            <span className="mt-2 block text-sm font-medium text-gray-900">Select a Data Flow</span>
            <p className="mt-1 text-sm text-gray-500">
              Choose a data flow from the dropdown above to view or edit its schema
            </p>
          </div>
        )}
      </div>

      {showAddFieldForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-medium text-gray-900">Add Schema Field</span>
              <button
                onClick={() => setShowAddFieldForm(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="fieldName" className="block text-sm font-medium text-gray-700">
                  Field Name
                </label>
                <input
                  type="text"
                  id="fieldName"
                  value={newField.name}
                  onChange={(e) => setNewField(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="e.g., firstName, totalAmount"
                />
              </div>

              <div>
                <label htmlFor="fieldType" className="block text-sm font-medium text-gray-700">
                  Field Type
                </label>
                <select
                  id="fieldType"
                  value={newField.type}
                  onChange={(e) => setNewField(prev => ({ ...prev, type: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                  <option value="date">Date</option>
                  <option value="object">Object</option>
                  <option value="array">Array</option>
                </select>
              </div>

              <div>
                <label htmlFor="fieldDescription" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="fieldDescription"
                  value={newField.description}
                  onChange={(e) => setNewField(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Describe the purpose of this field"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="required"
                  checked={newField.required}
                  onChange={(e) => setNewField(prev => ({ ...prev, required: e.target.checked }))}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="required" className="ml-2 block text-sm text-gray-900">
                  Required field
                </label>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddFieldForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddField}
                  disabled={!newField.name || !newField.type}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  Add Field
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-3">
                <span className="text-lg font-medium text-gray-900">Delete Data Model</span>
              </div>
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Are you sure you want to delete this data model? This action cannot be undone.
              </p>
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteLineage}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import React, { useState } from 'react';
import { X, Save, PlusCircle, Trash2, Settings, GripVertical, Eye, EyeOff } from 'lucide-react';
import type { CustomFieldDefinition } from '../../types';

interface CustomizeRiskColumnsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (visibleColumns: Record<string, boolean>, customFields: CustomFieldDefinition[]) => void;
    baseFields: { key: string; label: string }[];
    initialVisibleColumns: Record<string, boolean>;
    initialCustomFields: CustomFieldDefinition[];
}

const CustomizeRiskColumnsModal: React.FC<CustomizeRiskColumnsModalProps> = ({
    isOpen,
    onClose,
    onSave,
    baseFields,
    initialVisibleColumns,
    initialCustomFields
}) => {
    const [visibleColumns, setVisibleColumns] = useState(initialVisibleColumns);
    const [customFields, setCustomFields] = useState(initialCustomFields);
    const [newField, setNewField] = useState({ name: '', type: 'text' as CustomFieldDefinition['type'] });

    if (!isOpen) return null;

    const handleToggleVisibility = (key: string) => {
        setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleAddNewField = () => {
        if (!newField.name.trim()) return;
        const newId = newField.name.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        if (customFields.some(f => f.id === newId) || baseFields.some(f => f.key === newId)) {
            alert('A field with this name already exists.');
            return;
        }
        const newCustomField: CustomFieldDefinition = { id: newId, name: newField.name.trim(), type: newField.type };
        setCustomFields(prev => [...prev, newCustomField]);
        setVisibleColumns(prev => ({ ...prev, [`customFields.${newId}`]: true }));
        setNewField({ name: '', type: 'text' });
    };

    const handleDeleteCustomField = (id: string) => {
        if (window.confirm('Are you sure you want to delete this custom field? All associated data will be lost.')) {
            setCustomFields(prev => prev.filter(f => f.id !== id));
            setVisibleColumns(prev => {
                const newVisible = { ...prev };
                delete newVisible[`customFields.${id}`];
                return newVisible;
            });
        }
    };
    
    const handleSave = () => {
        onSave(visibleColumns, customFields);
    }
    
    const allFields = [...baseFields, ...customFields.map(cf => ({ key: `customFields.${cf.id}`, label: cf.name }))];


    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl m-4">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center">
                        <Settings className="mr-2" /> Customize Risk Columns
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-300">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
                    {/* Column Visibility */}
                    <div>
                        <h3 className="font-semibold mb-2">Visible Columns</h3>
                        <div className="space-y-2 p-2 border rounded-md dark:border-gray-700">
                            {allFields.map(({ key, label }) => (
                                <div key={key} className="flex items-center justify-between p-2 rounded-md bg-gray-50 dark:bg-gray-700/50">
                                    <div className="flex items-center">
                                        <GripVertical size={16} className="text-gray-400 mr-2 cursor-grab" />
                                        <span className="font-medium">{label}</span>
                                    </div>
                                    <button onClick={() => handleToggleVisibility(key)} title={visibleColumns[key] ? 'Hide' : 'Show'}>
                                        {visibleColumns[key] ? <Eye size={18} className="text-green-500" /> : <EyeOff size={18} className="text-gray-400" />}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Add Custom Field */}
                    <div>
                        <h3 className="font-semibold mb-2">Custom Fields</h3>
                        <div className="space-y-4 p-4 border rounded-md dark:border-gray-700">
                             <div className="space-y-2">
                                {customFields.map(field => (
                                    <div key={field.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                        <span>{field.name} <span className="text-xs text-gray-400">({field.type})</span></span>
                                        <button onClick={() => handleDeleteCustomField(field.id)} className="text-red-500 hover:text-red-700"><Trash2 size={14}/></button>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t pt-4 dark:border-gray-700 space-y-2">
                                <h4 className="text-sm font-semibold">Add New Field</h4>
                                <input
                                    type="text"
                                    placeholder="Field Name (e.g., Financial Impact)"
                                    value={newField.name}
                                    onChange={(e) => setNewField(prev => ({...prev, name: e.target.value}))}
                                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                />
                                <select 
                                    value={newField.type}
                                    onChange={(e) => setNewField(prev => ({...prev, type: e.target.value as CustomFieldDefinition['type']}))}
                                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                >
                                    <option value="text">Text</option>
                                    <option value="number">Number</option>
                                    <option value="date">Date</option>
                                    <option value="select">Select</option>
                                </select>
                                <button onClick={handleAddNewField} className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-semibold hover:bg-indigo-700">
                                    <PlusCircle size={16} className="mr-2"/> Add Field
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end p-4 bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700 space-x-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md font-semibold">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-[color:var(--color-primary)] text-white rounded-md font-semibold flex items-center">
                        <Save size={16} className="mr-2" /> Apply & Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomizeRiskColumnsModal;

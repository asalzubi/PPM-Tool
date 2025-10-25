
import React, { useState, useEffect, useRef } from 'react';
import type { EnrichedRisk, AppSettings } from '../../types';
import { X, Save, Sparkles, ShieldAlert } from 'lucide-react';
import { enrichText } from '../../services/geminiService';

interface RiskEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (risk: EnrichedRisk) => void;
    risk: EnrichedRisk;
    settings: AppSettings;
}

const RiskEditModal: React.FC<RiskEditModalProps> = ({ isOpen, onClose, onSave, risk, settings }) => {
    const [editedRisk, setEditedRisk] = useState<EnrichedRisk>(risk);
    const [isEnriching, setIsEnriching] = useState<'description' | 'mitigation' | null>(null);

    const [enrichOptions, setEnrichOptions] = useState<{ visible: boolean; field: 'description' | 'mitigation' | null }>({ visible: false, field: null });
    const enrichButtonRef = useRef<{ [key: string]: HTMLButtonElement | null }>({});
    const enrichMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setEditedRisk(risk);
    }, [risk]);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                enrichMenuRef.current && !enrichMenuRef.current.contains(event.target as Node) &&
                !Object.keys(enrichButtonRef.current).some(key => enrichButtonRef.current[key]?.contains(event.target as Node))
            ) {
                setEnrichOptions({ visible: false, field: null });
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setEditedRisk(prev => ({ ...prev, [name]: checked }));
        } else {
            setEditedRisk(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleCustomFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const finalValue = type === 'number' ? parseFloat(value) : value;

        setEditedRisk(prev => ({
            ...prev,
            customFields: {
                ...prev.customFields,
                [name]: finalValue,
            },
        }));
    };

    const handleEnrich = async (field: 'description' | 'mitigation', style: 'professional' | 'technical' | 'business' | 'elaborate') => {
        setEnrichOptions({ visible: false, field: null });
        setIsEnriching(field);
        const originalText = editedRisk[field];
        const context = field === 'description' ? 'project risk description' : 'project risk mitigation plan';
        const enriched = await enrichText(originalText, context, style, settings.aiSettings.enrichmentModel);
        setEditedRisk(prev => ({ ...prev, [field]: enriched }));
        setIsEnriching(null);
    };

    const handleSave = () => {
        onSave(editedRisk);
    };

    const toggleEnrichMenu = (field: 'description' | 'mitigation') => {
        setEnrichOptions(prev => ({
            visible: !(prev.visible && prev.field === field),
            field: field
        }));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl m-4">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <div className="flex items-center">
                        <ShieldAlert className="w-6 h-6 mr-3 text-[color:var(--color-primary)]" />
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Edit Risk</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-300">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <p className="text-sm p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                        <strong>Project:</strong> {editedRisk.projectName}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Risk Type</label>
                            <select id="type" name="type" value={editedRisk.type} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                                <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
                            </select>
                        </div>
                         <div>
                            <label htmlFor="impact" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Risk Impact</label>
                            <select id="impact" name="impact" value={editedRisk.impact} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                                <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                        <div className="relative">
                            <textarea id="description" name="description" value={editedRisk.description} onChange={handleChange} rows={4} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 pr-10"></textarea>
                            <button ref={el => { if(el) enrichButtonRef.current['description'] = el; }} onClick={() => toggleEnrichMenu('description')} disabled={!!isEnriching} className="absolute top-2 right-2 p-1 text-gray-500 hover:text-[color:var(--color-primary)] disabled:opacity-50" aria-label="Enrich description with AI">
                                {isEnriching === 'description' ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div> : <Sparkles size={20} />}
                            </button>
                            {enrichOptions.visible && enrichOptions.field === 'description' && (
                                <div ref={enrichMenuRef} className="absolute top-10 right-2 w-48 bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-md shadow-lg z-10 p-2 space-y-1">
                                    <p className="text-xs font-semibold px-2">Refine with AI:</p>
                                    <button onClick={() => handleEnrich('description', 'professional')} className="w-full text-left text-sm px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">More Professional</button>
                                    <button onClick={() => handleEnrich('description', 'technical')} className="w-full text-left text-sm px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">More Technical</button>
                                    <button onClick={() => handleEnrich('description', 'business')} className="w-full text-left text-sm px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">More Business Terms</button>
                                    <button onClick={() => handleEnrich('description', 'elaborate')} className="w-full text-left text-sm px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">Elaborate</button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="owner" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Risk Owner</label>
                        <input type="text" id="owner" name="owner" value={editedRisk.owner} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                    </div>

                    <div>
                        <label htmlFor="mitigation" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mitigation</label>
                        <div className="relative">
                            <textarea id="mitigation" name="mitigation" value={editedRisk.mitigation} onChange={handleChange} rows={4} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 pr-10"></textarea>
                            <button ref={el => { if(el) enrichButtonRef.current['mitigation'] = el; }} onClick={() => toggleEnrichMenu('mitigation')} disabled={!!isEnriching} className="absolute top-2 right-2 p-1 text-gray-500 hover:text-[color:var(--color-primary)] disabled:opacity-50" aria-label="Enrich mitigation with AI">
                                {isEnriching === 'mitigation' ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div> : <Sparkles size={20} />}
                            </button>
                            {enrichOptions.visible && enrichOptions.field === 'mitigation' && (
                                <div ref={enrichMenuRef} className="absolute top-10 right-2 w-48 bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-md shadow-lg z-10 p-2 space-y-1">
                                    <p className="text-xs font-semibold px-2">Refine with AI:</p>
                                    <button onClick={() => handleEnrich('mitigation', 'professional')} className="w-full text-left text-sm px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">More Professional</button>
                                    <button onClick={() => handleEnrich('mitigation', 'technical')} className="w-full text-left text-sm px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">More Technical</button>
                                    <button onClick={() => handleEnrich('mitigation', 'business')} className="w-full text-left text-sm px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">More Business Terms</button>
                                    <button onClick={() => handleEnrich('mitigation', 'elaborate')} className="w-full text-left text-sm px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">Elaborate</button>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="isVisibleOnDashboard"
                            name="isVisibleOnDashboard"
                            checked={editedRisk.isVisibleOnDashboard}
                            onChange={handleChange}
                            className="h-4 w-4 rounded border-gray-300 text-[color:var(--color-primary)] focus:ring-[color:var(--color-primary)]"
                        />
                        <label htmlFor="isVisibleOnDashboard" className="ml-2 block text-sm text-gray-900 dark:text-gray-200">
                            Visible on Dashboard
                        </label>
                    </div>

                    {/* Custom Fields Section */}
                    {(settings.customFields?.risks || []).length > 0 && (
                        <div className="border-t pt-4 space-y-4 dark:border-gray-700">
                             <h3 className="text-md font-semibold">Custom Fields</h3>
                             {(settings.customFields?.risks || []).map(field => (
                                 <div key={field.id}>
                                     <label htmlFor={`custom-${field.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{field.name}</label>
                                     {field.type === 'select' ? (
                                        <select
                                            id={`custom-${field.id}`}
                                            name={field.id}
                                            value={editedRisk.customFields?.[field.id] as string || ''}
                                            onChange={handleCustomFieldChange}
                                            className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                        >
                                            <option value="">-- Select --</option>
                                            {(field.options || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                     ) : (
                                        <input
                                            type={field.type}
                                            id={`custom-${field.id}`}
                                            name={field.id}
                                            value={editedRisk.customFields?.[field.id] as string | number || ''}
                                            onChange={handleCustomFieldChange}
                                            className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                        />
                                     )}
                                 </div>
                             ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-end p-4 bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700 space-x-3 rounded-b-lg">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md font-semibold hover:bg-gray-300 dark:hover:bg-gray-500">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="flex items-center px-4 py-2 bg-[color:var(--color-primary)] text-white rounded-md font-semibold hover:opacity-90">
                        <Save size={16} className="mr-2" />
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RiskEditModal;

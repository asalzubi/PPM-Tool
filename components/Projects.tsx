
import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { Project, Risk, Task, Action, TimelineEvent, AppSettings } from '../types';
import { Edit, PlusCircle, Sparkles, X, Pencil, FileText, CheckSquare, TrendingUp, AlertTriangle, ListChecks, Calendar, Clock, Hourglass, Shield, GitBranch, DollarSign, BarChart2, Briefcase as BriefcaseIcon } from 'lucide-react';
import { enrichText } from '../services/geminiService';
import { useAppContext } from '../context/AppContext';

interface FormRowProps {
    label: string;
    children: React.ReactNode;
    className?: string;
}

const FormRow: React.FC<FormRowProps> = ({ label, children, className }) => (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-2 items-center ${className}`}>
        <label className="font-semibold text-gray-700 dark:text-gray-300">{label}</label>
        <div className="md:col-span-2">{children}</div>
    </div>
);

const FinancialMetricCheckbox: React.FC<{id: string, label: string, checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void}> = ({id, label, checked, onChange}) => (
    <div className="flex items-center">
        <input 
            type="checkbox"
            name={id}
            id={id}
            checked={checked}
            onChange={onChange}
            className="h-4 w-4 rounded border-gray-300 text-[color:var(--color-primary)] focus:ring-[color:var(--color-primary)]"
        />
        <label htmlFor={id} className="ml-2 font-medium text-gray-700 dark:text-gray-300">
            {label}
        </label>
    </div>
);

export const EnrichableTextarea: React.FC<{
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    rows: number;
    context: string;
    onEnrich: (name: string, enrichedText: string) => void;
    model: string;
}> = ({ name, value, onChange, rows, context, onEnrich, model }) => {
    const [isEnriching, setIsEnriching] = useState(false);
    const [enrichOptionsVisible, setEnrichOptionsVisible] = useState(false);
    const enrichButtonRef = useRef<HTMLButtonElement>(null);
    const enrichMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                enrichMenuRef.current && !enrichMenuRef.current.contains(event.target as Node) &&
                enrichButtonRef.current && !enrichButtonRef.current.contains(event.target as Node)
            ) {
                setEnrichOptionsVisible(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleEnrich = async (style: 'professional' | 'technical' | 'business' | 'elaborate') => {
        setEnrichOptionsVisible(false);
        setIsEnriching(true);
        const enriched = await enrichText(value, context, style, model);
        onEnrich(name, enriched);
        setIsEnriching(false);
    };

    return (
        <div className="relative">
            <textarea
                name={name}
                value={value}
                onChange={onChange}
                rows={rows}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 pr-10"
            ></textarea>
            <button
                ref={enrichButtonRef}
                onClick={() => setEnrichOptionsVisible(!enrichOptionsVisible)}
                disabled={isEnriching}
                className="absolute top-2 right-2 p-1 text-gray-500 hover:text-[color:var(--color-primary)] disabled:opacity-50"
                aria-label="Enrich text with AI"
            >
                {isEnriching ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                ) : (
                    <Sparkles size={20} />
                )}
            </button>
            {enrichOptionsVisible && (
                <div ref={enrichMenuRef} className="absolute top-10 right-2 w-48 bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-md shadow-lg z-10 p-2 space-y-1">
                    <p className="text-xs font-semibold px-2">Refine with AI:</p>
                    <button onClick={() => handleEnrich('professional')} className="w-full text-left text-sm px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">More Professional</button>
                    <button onClick={() => handleEnrich('technical')} className="w-full text-left text-sm px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">More Technical</button>
                    <button onClick={() => handleEnrich('business')} className="w-full text-left text-sm px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">More Business Terms</button>
                     <button onClick={() => handleEnrich('elaborate')} className="w-full text-left text-sm px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">Elaborate</button>
                </div>
            )}
        </div>
    );
};


export const ProjectModal: React.FC<{ project: Project | null; onClose: () => void; onSave: (project: Project) => void; settings: AppSettings; }> = ({ project, onClose, onSave, settings }) => {
    const [editedProject, setEditedProject] = useState<Project>(
        project ? JSON.parse(JSON.stringify(project)) : {
            id: Date.now(),
            name: '',
            description: '',
            stage: 'Planning',
            priority: 'Medium',
            technology: '',
            vendor: '',
            completionPercentage: 0,
            startDate: new Date().toISOString().split('T')[0],
            deliveryDate: new Date().toISOString().split('T')[0],
            status: 'Green',
            trend: 'Stable',
            risks: [],
            tasks: [],
            actions: [],
            isCostIncluded: false,
            budget: 0,
            actualCost: 0,
            forecastedCost: 0,
            costNotes: '',
            isRoiIncluded: false,
            roiPercentage: 0,
            roiAnalysisNotes: '',
            roiVisibility: { percentage: true, analysisNotes: true },
            isNpvIncluded: false,
            npvValue: 0,
            discountRate: 0,
            initialInvestment: 0,
            npvAnalysisNotes: '',
            npvVisibility: { value: true, discountRate: true, initialInvestment: true, analysisNotes: true },
            isBusinessValueIncluded: false,
            businessValueScore: 0,
            strategicAlignment: 'Medium',
            marketOpportunity: '',
            competitiveAdvantage: '',
            businessValueNotes: '',
            businessValueVisibility: { score: true, strategicAlignment: true, marketOpportunity: true, competitiveAdvantage: true, businessValueNotes: true },
        }
    );
    
    const [newRisk, setNewRisk] = useState<Omit<Risk, 'id'>>({ type: 'High', impact: 'High', description: '', owner: '', mitigation: '', isVisibleOnDashboard: true });
    const [newTask, setNewTask] = useState('');
    const [newAction, setNewAction] = useState<Omit<Action, 'id'>>({ priority: 'High', description: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
             const { checked } = e.target as HTMLInputElement;
             setEditedProject(prev => ({ ...prev, [name]: checked }));
        } else {
            const isNumber = type === 'number';
            setEditedProject(prev => ({ ...prev, [name]: isNumber ? Number(value) : value }));
        }
    };

    const handleEnrich = (fieldName: string, enrichedText: string) => {
        setEditedProject(prev => ({...prev, [fieldName]: enrichedText }));
    }

    const handleVisibilityChange = (
        metric: 'roiVisibility' | 'npvVisibility' | 'businessValueVisibility',
        field: string,
        checked: boolean
    ) => {
        setEditedProject(prev => {
            const newVisibility = { ...(prev[metric] || {}), [field]: checked };
            return { ...prev, [metric]: newVisibility };
        });
    };
    
    // Risk Handlers
    const handleAddRisk = () => {
        if (!newRisk.description) return;
        setEditedProject(prev => ({
            ...prev,
            risks: [...prev.risks, { ...newRisk, id: Date.now() }]
        }));
        setNewRisk({ type: 'High', impact: 'High', description: '', owner: '', mitigation: '', isVisibleOnDashboard: true });
    };
    const handleRemoveRisk = (id: number) => {
        setEditedProject(prev => ({ ...prev, risks: prev.risks.filter(r => r.id !== id) }));
    };
     const handleRiskChange = (id: number, field: keyof Risk, value: any) => {
        setEditedProject(prev => ({
            ...prev,
            risks: prev.risks.map(r => r.id === id ? { ...r, [field]: value } : r)
        }));
    };

    // Task Handlers
    const handleAddTask = () => {
        if (!newTask.trim()) return;
        setEditedProject(prev => ({
            ...prev,
            tasks: [...prev.tasks, { id: Date.now(), description: newTask, isCompleted: false }]
        }));
        setNewTask('');
    };
    const handleRemoveTask = (id: number) => {
        setEditedProject(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== id) }));
    };
    const handleToggleTask = (id: number) => {
        setEditedProject(prev => ({
            ...prev,
            tasks: prev.tasks.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t)
        }));
    };
    
    // Action Handlers
    const handleAddAction = () => {
        if (!newAction.description.trim()) return;
        setEditedProject(prev => ({
            ...prev,
            actions: [...prev.actions, { ...newAction, id: Date.now() }]
        }));
        setNewAction({ priority: 'High', description: '' });
    };
    const handleRemoveAction = (id: number) => {
        setEditedProject(prev => ({ ...prev, actions: prev.actions.filter(a => a.id !== id) }));
    };

    const VisibilityToggle: React.FC<{
        metric: 'roiVisibility' | 'npvVisibility' | 'businessValueVisibility';
        field: string;
        label: string;
        isChecked: boolean | undefined;
        onChange: (metric: any, field: string, checked: boolean) => void;
    }> = ({ metric, field, label, isChecked, onChange }) => (
        <div className="flex items-center">
            <input
                type="checkbox"
                id={`vis-${metric}-${field}`}
                checked={!!isChecked}
                onChange={(e) => onChange(metric, field, e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-[color:var(--color-primary)] focus:ring-[color:var(--color-primary)]"
            />
            <label htmlFor={`vis-${metric}-${field}`} className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                Show "{label}"
            </label>
        </div>
    );

    if (!project && !editedProject) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-start z-50 py-10">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-full">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h2 className="text-2xl font-bold">{project ? 'Edit Project' : 'New Project'}</h2>
                    <button onClick={onClose}><X /></button>
                </div>
                <div className="p-6 space-y-6 overflow-y-auto" style={{maxHeight: 'calc(100vh - 160px)'}}>
                    {/* Core Details */}
                    <div className="space-y-4">
                        <FormRow label="Project Name*">
                            <input type="text" name="name" value={editedProject.name} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                        </FormRow>
                        <FormRow label="Description">
                            <EnrichableTextarea
                                name="description"
                                value={editedProject.description}
                                onChange={handleChange}
                                rows={3}
                                context="project description"
                                onEnrich={handleEnrich}
                                model={settings.aiSettings.enrichmentModel}
                            />
                        </FormRow>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <FormRow label="Stage">
                                <select name="stage" value={editedProject.stage} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                                    <option>Planning</option><option>Development</option><option>Testing</option><option>Deployment</option><option>Completed</option><option>POC</option>
                                </select>
                            </FormRow>
                            <FormRow label="Priority">
                                <select name="priority" value={editedProject.priority} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                                    <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
                                </select>
                            </FormRow>
                             <FormRow label="Technology">
                                <input type="text" name="technology" value={editedProject.technology} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                            </FormRow>
                             <FormRow label="Technology Provider/Vendor">
                                <input type="text" name="vendor" value={editedProject.vendor} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                            </FormRow>
                            <FormRow label="Completion %">
                                <input type="number" name="completionPercentage" value={editedProject.completionPercentage} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                            </FormRow>
                             <FormRow label="Status">
                                <select name="status" value={editedProject.status} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                                    <option>Green</option><option>Amber</option><option>Red</option>
                                </select>
                            </FormRow>
                             <FormRow label="Start Date">
                                <input type="date" name="startDate" value={editedProject.startDate} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                            </FormRow>
                            <FormRow label="Delivery Date">
                                <input type="date" name="deliveryDate" value={editedProject.deliveryDate} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                            </FormRow>
                        </div>
                    </div>

                    {/* Financial Metrics */}
                    <div className="border-t dark:border-gray-700 pt-4 mt-4 space-y-4">
                         <h3 className="text-lg font-semibold">Financial Analysis</h3>
                         <div className="flex space-x-6">
                            <FinancialMetricCheckbox id="isCostIncluded" label="Cost Management" checked={!!editedProject.isCostIncluded} onChange={handleChange} />
                            <FinancialMetricCheckbox id="isRoiIncluded" label="ROI" checked={!!editedProject.isRoiIncluded} onChange={handleChange} />
                            <FinancialMetricCheckbox id="isNpvIncluded" label="NPV" checked={!!editedProject.isNpvIncluded} onChange={handleChange} />
                            <FinancialMetricCheckbox id="isBusinessValueIncluded" label="Business Value" checked={!!editedProject.isBusinessValueIncluded} onChange={handleChange} />
                         </div>
                    </div>

                    {editedProject.isCostIncluded && (
                        <div className="space-y-4 p-4 bg-gray-100 dark:bg-gray-700/30 rounded-lg border dark:border-gray-200 dark:border-gray-700">
                            <h3 className="text-md font-semibold text-gray-700 dark:text-gray-200">Cost Management</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
                                <FormRow label="Budget ($)"><input type="number" name="budget" value={editedProject.budget || ''} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" /></FormRow>
                                <FormRow label="Actual Cost ($)"><input type="number" name="actualCost" value={editedProject.actualCost || ''} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" /></FormRow>
                                <FormRow label="Forecasted Cost ($)"><input type="number" name="forecastedCost" value={editedProject.forecastedCost || ''} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" /></FormRow>
                            </div>
                            <FormRow label="Cost Notes">
                                <EnrichableTextarea name="costNotes" value={editedProject.costNotes || ''} onChange={handleChange} rows={2} context="project cost notes" onEnrich={handleEnrich} model={settings.aiSettings.enrichmentModel} />
                            </FormRow>
                        </div>
                    )}
                    {editedProject.isRoiIncluded && (
                         <div className="space-y-4 p-4 bg-gray-100 dark:bg-gray-700/30 rounded-lg border dark:border-gray-200 dark:border-gray-700">
                            <h3 className="text-md font-semibold text-gray-700 dark:text-gray-200">Return on Investment (ROI)</h3>
                            <FormRow label="ROI (%)"><input type="number" name="roiPercentage" value={editedProject.roiPercentage || ''} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" /></FormRow>
                            <FormRow label="Analysis Notes">
                                <EnrichableTextarea name="roiAnalysisNotes" value={editedProject.roiAnalysisNotes || ''} onChange={handleChange} rows={2} context="ROI analysis notes" onEnrich={handleEnrich} model={settings.aiSettings.enrichmentModel} />
                            </FormRow>
                            <div className="border-t dark:border-gray-600 mt-4 pt-4">
                                <h4 className="text-sm font-semibold mb-2 text-gray-600 dark:text-gray-300">Field Visibility</h4>
                                <div className="flex space-x-4">
                                    <VisibilityToggle metric="roiVisibility" field="percentage" label="ROI (%)" isChecked={editedProject.roiVisibility?.percentage} onChange={handleVisibilityChange} />
                                    <VisibilityToggle metric="roiVisibility" field="analysisNotes" label="Analysis Notes" isChecked={editedProject.roiVisibility?.analysisNotes} onChange={handleVisibilityChange} />
                                </div>
                            </div>
                        </div>
                    )}
                    {editedProject.isNpvIncluded && (
                        <div className="space-y-4 p-4 bg-gray-100 dark:bg-gray-700/30 rounded-lg border dark:border-gray-200 dark:border-gray-700">
                           <h3 className="text-md font-semibold text-gray-700 dark:text-gray-200">Net Present Value (NPV)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
                                <FormRow label="Initial Investment ($)"><input type="number" name="initialInvestment" value={editedProject.initialInvestment || ''} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" /></FormRow>
                                <FormRow label="Discount Rate (%)"><input type="number" name="discountRate" value={editedProject.discountRate || ''} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" /></FormRow>
                                <FormRow label="NPV ($)"><input type="number" name="npvValue" value={editedProject.npvValue || ''} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" /></FormRow>
                           </div>
                           <FormRow label="Analysis Notes">
                                <EnrichableTextarea name="npvAnalysisNotes" value={editedProject.npvAnalysisNotes || ''} onChange={handleChange} rows={2} context="NPV analysis notes" onEnrich={handleEnrich} model={settings.aiSettings.enrichmentModel} />
                           </FormRow>
                           <div className="border-t dark:border-gray-600 mt-4 pt-4">
                                <h4 className="text-sm font-semibold mb-2 text-gray-600 dark:text-gray-300">Field Visibility</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <VisibilityToggle metric="npvVisibility" field="initialInvestment" label="Initial Investment" isChecked={editedProject.npvVisibility?.initialInvestment} onChange={handleVisibilityChange} />
                                    <VisibilityToggle metric="npvVisibility" field="discountRate" label="Discount Rate" isChecked={editedProject.npvVisibility?.discountRate} onChange={handleVisibilityChange} />
                                    <VisibilityToggle metric="npvVisibility" field="value" label="NPV ($)" isChecked={editedProject.npvVisibility?.value} onChange={handleVisibilityChange} />
                                    <VisibilityToggle metric="npvVisibility" field="analysisNotes" label="Analysis Notes" isChecked={editedProject.npvVisibility?.analysisNotes} onChange={handleVisibilityChange} />
                                </div>
                            </div>
                       </div>
                    )}
                    {editedProject.isBusinessValueIncluded && (
                        <div className="space-y-4 p-4 bg-gray-100 dark:bg-gray-700/30 rounded-lg border dark:border-gray-200 dark:border-gray-700">
                           <h3 className="text-md font-semibold text-gray-700 dark:text-gray-200">Business Value</h3>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                               <FormRow label="Business Value Score (1-100)"><input type="number" name="businessValueScore" value={editedProject.businessValueScore || ''} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" /></FormRow>
                               <FormRow label="Strategic Alignment">
                                   <select name="strategicAlignment" value={editedProject.strategicAlignment} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                                       <option>Low</option><option>Medium</option><option>High</option><option>Very High</option>
                                   </select>
                                </FormRow>
                           </div>
                            <FormRow label="Market Opportunity">
                                <EnrichableTextarea name="marketOpportunity" value={editedProject.marketOpportunity || ''} onChange={handleChange} rows={2} context="market opportunity analysis" onEnrich={handleEnrich} model={settings.aiSettings.enrichmentModel} />
                            </FormRow>
                            <FormRow label="Competitive Advantage">
                                <EnrichableTextarea name="competitiveAdvantage" value={editedProject.competitiveAdvantage || ''} onChange={handleChange} rows={2} context="competitive advantage analysis" onEnrich={handleEnrich} model={settings.aiSettings.enrichmentModel} />
                            </FormRow>
                            <FormRow label="Analysis Notes">
                                <EnrichableTextarea name="businessValueNotes" value={editedProject.businessValueNotes || ''} onChange={handleChange} rows={2} context="business value analysis notes" onEnrich={handleEnrich} model={settings.aiSettings.enrichmentModel} />
                            </FormRow>
                            <div className="border-t dark:border-gray-600 mt-4 pt-4">
                                <h4 className="text-sm font-semibold mb-2 text-gray-600 dark:text-gray-300">Field Visibility</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <VisibilityToggle metric="businessValueVisibility" field="score" label="Business Value Score" isChecked={editedProject.businessValueVisibility?.score} onChange={handleVisibilityChange} />
                                    <VisibilityToggle metric="businessValueVisibility" field="strategicAlignment" label="Strategic Alignment" isChecked={editedProject.businessValueVisibility?.strategicAlignment} onChange={handleVisibilityChange} />
                                    <VisibilityToggle metric="businessValueVisibility" field="marketOpportunity" label="Market Opportunity" isChecked={editedProject.businessValueVisibility?.marketOpportunity} onChange={handleVisibilityChange} />
                                    <VisibilityToggle metric="businessValueVisibility" field="competitiveAdvantage" label="Competitive Advantage" isChecked={editedProject.businessValueVisibility?.competitiveAdvantage} onChange={handleVisibilityChange} />
                                    <VisibilityToggle metric="businessValueVisibility" field="businessValueNotes" label="Analysis Notes" isChecked={editedProject.businessValueVisibility?.businessValueNotes} onChange={handleVisibilityChange} />
                                </div>
                            </div>
                       </div>
                    )}
                    
                    {/* Risk Management */}
                    <div>
                        <h3 className="text-lg font-semibold border-t dark:border-gray-700 pt-4 mt-4">Risk Management</h3>
                        <div className="mt-2 space-y-2">
                           <div className="grid grid-cols-12 gap-2 items-end">
                                <select value={newRisk.type} onChange={e => setNewRisk({...newRisk, type: e.target.value as Risk['type']})} className="col-span-2 p-2 border rounded dark:bg-gray-700 dark:border-gray-600"><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select>
                                <select value={newRisk.impact} onChange={e => setNewRisk({...newRisk, impact: e.target.value as Risk['impact']})} className="col-span-2 p-2 border rounded dark:bg-gray-700 dark:border-gray-600"><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select>
                                <input type="text" placeholder="Risk description" value={newRisk.description} onChange={e => setNewRisk({...newRisk, description: e.target.value})} className="col-span-3 p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                                <input type="text" placeholder="Risk owner" value={newRisk.owner} onChange={e => setNewRisk({...newRisk, owner: e.target.value})} className="col-span-2 p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                                <input type="text" placeholder="Mitigation strategy" value={newRisk.mitigation} onChange={e => setNewRisk({...newRisk, mitigation: e.target.value})} className="col-span-2 p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                                <button onClick={handleAddRisk} className="col-span-1 px-4 py-2 bg-[color:var(--color-primary)] text-white rounded-md">Add</button>
                           </div>
                           <div className="flex items-center gap-2">
                                <input type="checkbox" id="show-on-dashboard" checked={newRisk.isVisibleOnDashboard} onChange={e => setNewRisk({...newRisk, isVisibleOnDashboard: e.target.checked})} />
                                <label htmlFor="show-on-dashboard">Show this risk on dashboard cards</label>
                           </div>
                        </div>
                        <div className="mt-4 space-y-2">
                            {editedProject.risks.map(risk => (
                                <div key={risk.id} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md border-l-4 border-orange-400">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p><span className="font-bold">{risk.type.toUpperCase()}:</span> {risk.description}</p>
                                            <p className="text-sm text-gray-500">Owner: {risk.owner}</p>
                                            <div className="flex items-center mt-1">
                                                <input type="checkbox" checked={risk.isVisibleOnDashboard} onChange={(e) => handleRiskChange(risk.id, 'isVisibleOnDashboard', e.target.checked)} className="h-4 w-4" />
                                                <label className="ml-2 text-sm">Show on dashboard</label>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button className="p-1 text-gray-500 hover:text-blue-500"><Pencil size={16}/></button>
                                            <button onClick={() => handleRemoveRisk(risk.id)} className="p-1 text-gray-500 hover:text-red-500"><X size={16}/></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Task Management */}
                    <div>
                        <h3 className="text-lg font-semibold border-t dark:border-gray-700 pt-4 mt-4">Task Management</h3>
                        <div className="flex gap-2 mt-2">
                            <input type="text" value={newTask} onChange={e => setNewTask(e.target.value)} placeholder="Enter new task" className="flex-grow p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                            <button onClick={handleAddTask} className="px-4 py-2 bg-[color:var(--color-primary)] text-white rounded-md">Add Task</button>
                        </div>
                         <div className="mt-4 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                            <h4 className="font-semibold flex items-center mb-2"><FileText size={16} className="mr-2"/> Project Tasks</h4>
                            {editedProject.tasks.map(task => (
                                <div key={task.id} className="flex items-center justify-between py-1">
                                    <div className="flex items-center cursor-pointer" onClick={() => handleToggleTask(task.id)}>
                                        {task.isCompleted ? <CheckSquare size={18} className="text-green-500" /> : <GitBranch size={18} className="text-gray-400" />}
                                        <span className={`ml-2 ${task.isCompleted ? 'line-through text-gray-500' : ''}`}>{task.description}</span>
                                    </div>
                                    <button onClick={() => handleRemoveTask(task.id)} className="p-1 text-red-500 hover:bg-red-100 rounded-full"><X size={16}/></button>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Next Actions */}
                    <div>
                        <h3 className="text-lg font-semibold border-t dark:border-gray-700 pt-4 mt-4">Next Actions</h3>
                         <div className="flex gap-2 mt-2">
                             <select value={newAction.priority} onChange={e => setNewAction({...newAction, priority: e.target.value as Action['priority']})} className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                                 <option>Urgent</option><option>High</option><option>Medium</option><option>Low</option>
                             </select>
                            <input type="text" value={newAction.description} onChange={e => setNewAction({...newAction, description: e.target.value})} placeholder="Describe the action to be taken..." className="flex-grow p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                            <button onClick={handleAddAction} className="px-4 py-2 bg-[color:var(--color-primary)] text-white rounded-md">Add Action</button>
                        </div>
                         <div className="mt-4 space-y-2">
                            {editedProject.actions.map(action => (
                                <div key={action.id} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md border-l-4 border-orange-400">
                                     <div className="flex justify-between items-start">
                                        <p><span className="font-bold">{action.priority.toUpperCase()}:</span> {action.description}</p>
                                        <div className="flex items-center gap-2">
                                            <button className="p-1 text-gray-500 hover:text-blue-500"><Pencil size={16}/></button>
                                            <button onClick={() => handleRemoveAction(action.id)} className="p-1 text-gray-500 hover:text-red-500"><X size={16}/></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex justify-end p-4 bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700 space-x-4 rounded-b-lg">
                    <button onClick={onClose} className="px-6 py-2 bg-gray-200 dark:bg-gray-600 rounded-md font-semibold">Cancel</button>
                    <button onClick={() => onSave(editedProject)} className="px-6 py-2 bg-[color:var(--color-primary)] text-white rounded-md font-semibold">Save Project</button>
                </div>
            </div>
        </div>
    );
};

const priorityColorMap: { [key in Project['priority']]: string } = {
    'Low': 'bg-blue-100 text-blue-800',
    'Medium': 'bg-yellow-100 text-yellow-800',
    'High': 'bg-orange-100 text-orange-800',
    'Critical': 'bg-red-100 text-red-800',
};

// Function to find events that conflict with a project's schedule
const getConflictingEvents = (project: Project, events: TimelineEvent[]): TimelineEvent[] => {
    const projectStart = new Date(project.startDate).getTime();
    const projectEnd = new Date(project.deliveryDate).getTime();
    
    return events.filter(event => {
        if (!event.startDate) return false;
        const eventStart = new Date(event.startDate).getTime();
        const eventEnd = event.endDate ? new Date(event.endDate).getTime() : eventStart;
        // Check for overlap
        return Math.max(projectStart, eventStart) <= Math.min(projectEnd, eventEnd);
    });
};

const ROITabContent: React.FC<{ project: Project }> = ({ project }) => (
    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
        <h4 className="font-bold text-lg mb-4 pb-2 border-b dark:border-gray-700">Return on Investment (ROI)</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {project.roiVisibility?.percentage !== false && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-md text-center shadow-sm">
                    <p className="text-3xl font-bold text-[color:var(--color-primary)]">{project.roiPercentage}%</p>
                    <p className="text-sm text-gray-500">Projected ROI</p>
                </div>
            )}
            {project.roiVisibility?.analysisNotes !== false && (
                <div className="md:col-span-2 bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm">
                    <h5 className="font-semibold mb-1">Analysis Notes</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{project.roiAnalysisNotes || 'No analysis notes provided.'}</p>
                </div>
            )}
        </div>
    </div>
);

const NPVTabContent: React.FC<{ project: Project }> = ({ project }) => (
    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
        <h4 className="font-bold text-lg mb-4 pb-2 border-b dark:border-gray-700">Net Present Value (NPV)</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {project.npvVisibility?.initialInvestment !== false && <div className="bg-white dark:bg-gray-800 p-4 rounded-md text-center shadow-sm"><p className="text-2xl font-bold">${project.initialInvestment?.toLocaleString()}</p><p className="text-sm text-gray-500">Initial Investment</p></div>}
            {project.npvVisibility?.discountRate !== false && <div className="bg-white dark:bg-gray-800 p-4 rounded-md text-center shadow-sm"><p className="text-2xl font-bold">{project.discountRate}%</p><p className="text-sm text-gray-500">Discount Rate</p></div>}
            {project.npvVisibility?.value !== false && <div className="bg-white dark:bg-gray-800 p-4 rounded-md text-center shadow-sm"><p className="text-2xl font-bold text-[color:var(--color-success)]">${project.npvValue?.toLocaleString()}</p><p className="text-sm text-gray-500">NPV</p></div>}
        </div>
        {project.npvVisibility?.analysisNotes !== false &&
            <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm">
                <h5 className="font-semibold mb-1">Analysis Notes</h5>
                <p className="text-sm text-gray-600 dark:text-gray-300">{project.npvAnalysisNotes || 'No analysis notes provided.'}</p>
            </div>
        }
    </div>
);

const BusinessValueTabContent: React.FC<{ project: Project }> = ({ project }) => (
    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
        <h4 className="font-bold text-lg mb-4 pb-2 border-b dark:border-gray-700">Business Value</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {project.businessValueVisibility?.score !== false && <div className="bg-white dark:bg-gray-800 p-4 rounded-md text-center shadow-sm"><p className="text-3xl font-bold">{project.businessValueScore}/100</p><p className="text-sm text-gray-500">Business Value Score</p></div>}
            {project.businessValueVisibility?.strategicAlignment !== false && <div className="bg-white dark:bg-gray-800 p-4 rounded-md text-center shadow-sm"><p className="text-3xl font-bold">{project.strategicAlignment}</p><p className="text-sm text-gray-500">Strategic Alignment</p></div>}
        </div>
        <div className="space-y-4">
            {project.businessValueVisibility?.marketOpportunity !== false && <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm"><h5 className="font-semibold mb-1">Market Opportunity</h5><p className="text-sm text-gray-600 dark:text-gray-300">{project.marketOpportunity || 'N/A'}</p></div>}
            {project.businessValueVisibility?.competitiveAdvantage !== false && <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm"><h5 className="font-semibold mb-1">Competitive Advantage</h5><p className="text-sm text-gray-600 dark:text-gray-300">{project.competitiveAdvantage || 'N/A'}</p></div>}
            {project.businessValueVisibility?.businessValueNotes !== false && <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm"><h5 className="font-semibold mb-1">Analysis Notes</h5><p className="text-sm text-gray-600 dark:text-gray-300">{project.businessValueNotes || 'N/A'}</p></div>}
        </div>
    </div>
);


const Projects: React.FC = () => {
    const { visibleProjects: projects, timelineEvents, settings, openProjectModal } = useAppContext();
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(projects.length > 0 ? projects[0].id : null);
    
    useEffect(() => {
        if (!selectedProjectId && projects.length > 0) {
            setSelectedProjectId(projects[0].id);
        } else if (projects.length > 0 && !projects.find(p => p.id === selectedProjectId)) {
            setSelectedProjectId(projects[0].id);
        } else if (projects.length === 0) {
            setSelectedProjectId(null);
        }
    }, [projects, selectedProjectId]);
    
    const selectedProject = useMemo(() => {
        return projects.find(p => p.id === selectedProjectId) || null;
    }, [selectedProjectId, projects]);

    const conflictingEvents = useMemo(() => {
        if (!selectedProject || !timelineEvents) return [];
        return getConflictingEvents(selectedProject, timelineEvents);
    }, [selectedProject, timelineEvents]);

    const financialMetrics = useMemo(() => {
        if (!selectedProject) return [];
        const metrics = [];
        if (selectedProject.isRoiIncluded) metrics.push('ROI');
        if (selectedProject.isNpvIncluded) metrics.push('NPV');
        if (selectedProject.isBusinessValueIncluded) metrics.push('Business Value');
        return metrics;
    }, [selectedProject]);

    const [activeFinancialTab, setActiveFinancialTab] = useState<string | null>(null);

    useEffect(() => {
        if (financialMetrics.length > 0 && !financialMetrics.includes(activeFinancialTab || '')) {
            setActiveFinancialTab(financialMetrics[0]);
        } else if (financialMetrics.length === 0) {
            setActiveFinancialTab(null);
        }
    }, [financialMetrics, activeFinancialTab]);


    const projectMetrics = useMemo(() => {
        if (!selectedProject) return null;
        const today = new Date();
        const startDate = new Date(selectedProject.startDate);
        const deliveryDate = new Date(selectedProject.deliveryDate);
        
        today.setHours(0, 0, 0, 0);
        startDate.setHours(0, 0, 0, 0);
        deliveryDate.setHours(0, 0, 0, 0);

        const totalDays = Math.max(1, Math.ceil((deliveryDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
        const daysElapsed = Math.max(0, Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
        const daysRemaining = Math.max(0, Math.ceil((deliveryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

        return { totalDays, daysElapsed, daysRemaining };
    }, [selectedProject]);

    const StatCard: React.FC<{ title: string; value: string | number; }> = ({ title, value }) => (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-center">
            <div className="text-3xl font-bold text-gray-800 dark:text-gray-100">{value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase mt-1">{title}</div>
        </div>
    );

    const DetailCard: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="flex items-center text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 border-b dark:border-gray-700 pb-2">
                <Icon className="w-4 h-4 mr-2" />
                {title}
            </h3>
            <div className="space-y-2">{children}</div>
        </div>
    );
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Project Management</h2>
                <button onClick={() => openProjectModal(null)} className="flex items-center px-4 py-2 bg-[color:var(--color-primary)] text-white rounded-md hover:opacity-90 shadow-sm">
                    <PlusCircle size={18} className="mr-2" />
                    Add New Project
                </button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border dark:border-gray-700">
                <label htmlFor="project-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Project to View Details:</label>
                <select
                    id="project-select"
                    value={selectedProjectId || ''}
                    onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:ring-[color:var(--color-primary)] focus:border-[color:var(--color-primary)]"
                >
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name} ({p.stage})</option>)}
                </select>
            </div>

            {selectedProject && projectMetrics ? (
                <>
                    {conflictingEvents.length > 0 && (
                        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-md dark:bg-yellow-900/20 dark:border-yellow-600 dark:text-yellow-200" role="alert">
                            <p className="font-bold flex items-center"><AlertTriangle className="mr-2" /> Timeline Conflict Warning</p>
                            <p className="text-sm">This project's schedule intersects with the following events:</p>
                            <ul className="list-disc list-inside mt-2 text-sm pl-2">
                                {conflictingEvents.map(event => (
                                    <li key={event.id}>
                                        <strong>{event.name}</strong> ({event.type})
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700 space-y-6">
                        {/* Header */}
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold">{selectedProject.name}</h2>
                                <div className="flex items-center flex-wrap gap-2 mt-2">
                                    {selectedProject.status === 'Red' && <span className="text-xs font-bold px-2 py-1 bg-red-100 text-red-800 rounded-full flex items-center"><AlertTriangle size={12} className="mr-1" /> AT RISK</span>}
                                    <span className="text-xs font-semibold px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">{selectedProject.stage}</span>
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${priorityColorMap[selectedProject.priority]}`}>{selectedProject.priority}</span>
                                    <span className="text-xs font-semibold px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">{selectedProject.technology}</span>
                                    <span className="text-xs font-semibold px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">{selectedProject.vendor}</span>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 mt-3">{selectedProject.description}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <div className={`flex items-center gap-2 text-sm font-semibold ${selectedProject.status === 'Red' ? 'text-red-500' : selectedProject.status === 'Amber' ? 'text-yellow-500' : 'text-green-500'}`}>
                                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: `var(--color-${selectedProject.status.toLowerCase()})`}}></div>
                                    {selectedProject.trend}
                                </div>
                                <button onClick={() => openProjectModal(selectedProject)} className="px-4 py-2 bg-[color:var(--color-primary)] text-white text-sm font-semibold rounded-md hover:opacity-90">
                                    Edit Project
                                </button>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            <StatCard title="Completion" value={`${selectedProject.completionPercentage}%`} />
                            <StatCard title="Total Days" value={projectMetrics.totalDays} />
                            <StatCard title="Days Elapsed" value={projectMetrics.daysElapsed} />
                            <StatCard title="Days Remaining" value={projectMetrics.daysRemaining} />
                            <StatCard title="Total Risks" value={selectedProject.risks.length} />
                            <StatCard title="Total Tasks" value={selectedProject.tasks.length} />
                        </div>
                        
                        {/* Financial Metrics Tabs */}
                        {financialMetrics.length > 0 && (
                            <div className="pt-6">
                                <div className="border-b border-gray-200 dark:border-gray-700">
                                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                                        {financialMetrics.map(metric => (
                                            <button key={metric} onClick={() => setActiveFinancialTab(metric)}
                                                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center ${activeFinancialTab === metric
                                                    ? 'border-[color:var(--color-primary)] text-[color:var(--color-primary)]'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300 dark:hover:border-gray-600'
                                                    }`}
                                            >
                                                {metric === 'ROI' && <BarChart2 size={16} className="mr-2"/>}
                                                {metric === 'NPV' && <DollarSign size={16} className="mr-2"/>}
                                                {metric === 'Business Value' && <BriefcaseIcon size={16} className="mr-2"/>}
                                                {metric}
                                            </button>
                                        ))}
                                    </nav>
                                </div>
                                <div className="mt-4">
                                    {activeFinancialTab === 'ROI' && <ROITabContent project={selectedProject} />}
                                    {activeFinancialTab === 'NPV' && <NPVTabContent project={selectedProject} />}
                                    {activeFinancialTab === 'Business Value' && <BusinessValueTabContent project={selectedProject} />}
                                </div>
                            </div>
                        )}

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-6">
                                <DetailCard title="Project Gantt View" icon={Calendar}>
                                    <div className="text-sm">
                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                            <span>{new Date(selectedProject.startDate).toLocaleDateString()}</span>
                                            <span>{new Date(selectedProject.deliveryDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
                                            <div className="bg-yellow-400 h-4 rounded-full text-black text-xs font-bold flex items-center justify-center" style={{ width: `${selectedProject.completionPercentage}%` }}>
                                                {selectedProject.completionPercentage}%
                                            </div>
                                        </div>
                                    </div>
                                </DetailCard>
                                <DetailCard title="Risk Management" icon={Shield}>
                                    {selectedProject.risks.length > 0 ? selectedProject.risks.map(risk => (
                                        <div key={risk.id} className="text-sm border-l-4 pl-2" style={{borderColor: risk.type === 'High' || risk.type === 'Critical' ? 'var(--color-danger)' : 'var(--color-warning)'}}>
                                            <span className="font-bold">{risk.type}:</span> {risk.description}
                                            <span className="text-xs text-gray-500 italic"> (Owner: {risk.owner})</span>
                                        </div>
                                    )) : <p className="text-sm text-gray-500">No risks identified.</p>}
                                </DetailCard>
                                <DetailCard title="Next Actions" icon={ListChecks}>
                                    {selectedProject.actions.length > 0 ? selectedProject.actions.map(action => (
                                        <div key={action.id} className="text-sm border-l-4 pl-2" style={{borderColor: action.priority === 'High' || action.priority === 'Urgent' ? 'var(--color-danger)' : 'var(--color-warning)'}}>
                                            <span className="font-bold">{action.priority}:</span> {action.description}
                                        </div>
                                    )) : <p className="text-sm text-gray-500">No actions defined.</p>}
                                </DetailCard>
                            </div>
                            <div className="space-y-6">
                                <DetailCard title={`Tasks (${selectedProject.tasks.filter(t=>t.isCompleted).length}/${selectedProject.tasks.length} completed)`} icon={CheckSquare}>
                                    {selectedProject.tasks.length > 0 ? selectedProject.tasks.map(task => (
                                        <div key={task.id} className="flex items-center text-sm">
                                            <CheckSquare size={16} className={`mr-2 ${task.isCompleted ? 'text-green-500' : 'text-gray-300'}`} />
                                            <span className={task.isCompleted ? 'line-through text-gray-500' : ''}>{task.description}</span>
                                        </div>
                                    )) : <p className="text-sm text-gray-500">No tasks defined.</p>}
                                </DetailCard>
                                <DetailCard title="Performance Metrics" icon={TrendingUp}>
                                    <div className="text-sm space-y-2">
                                        <p><strong>Cost Performance Index:</strong> 1</p>
                                        <p><strong>Schedule Performance Index:</strong> 1</p>
                                        <p className="flex items-center"><strong>RAG Status:</strong> <span className="w-3 h-3 rounded-full mx-2" style={{backgroundColor: `var(--color-${selectedProject.status.toLowerCase()})`}}></span> {selectedProject.status.toUpperCase()}</p>
                                        <p><strong>Trend:</strong> {selectedProject.trend}</p>
                                    </div>
                                </DetailCard>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg">
                    <p>No project selected or no projects exist.</p>
                </div>
            )}
        </div>
    );
};

export default Projects;

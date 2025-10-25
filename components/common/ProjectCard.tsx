
import React, { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowRightCircle, Database, Flag, ListTodo, ChevronsUpDown, Pencil, Edit3, Copy, Trash2, AlertTriangle } from 'lucide-react';
import type { Project, Action, Risk } from '../../types';

const statusIndicatorMap = {
    Green: 'text-[var(--color-success)]',
    Amber: 'text-[var(--color-warning)]',
    Red: 'text-[var(--color-danger)]',
};

const priorityColorMap = {
    'Low': 'bg-blue-100 text-blue-800',
    'Medium': 'bg-yellow-100 text-yellow-800',
    'High': 'bg-orange-100 text-orange-800',
    'Critical': 'bg-red-100 text-red-800',
    'Urgent': 'bg-purple-100 text-purple-800',
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 30) {
        const diffMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
        return `${diffMonths} months`;
    }
    return `${diffDays} days`;
};

const Tag: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => (
    <span className={`inline-block text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full uppercase whitespace-nowrap ${className}`}>
        {text}
    </span>
);

const DetailItem: React.FC<{ item: Action | Risk; icon: React.ElementType }> = ({ item, icon: Icon }) => (
    <div className="flex items-start text-sm p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50">
        <Icon className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-gray-500" />
        <p className="flex-grow"><span className={`font-bold px-1 rounded-sm ${'priority' in item ? priorityColorMap[item.priority] : 'type' in item ? priorityColorMap[item.type] : ''}`}>{('priority' in item ? item.priority : 'type' in item ? item.type : '')}:</span> {item.description}</p>
        <button className="ml-2 p-1 text-gray-400 hover:text-[color:var(--color-primary)]">
            <Pencil size={14} />
        </button>
    </div>
);

interface ProjectCardProps {
    project: Project;
    onDelete?: (id: number) => void;
    onClone?: (id: number) => void;
    onEdit?: (project: Project) => void;
    isExpanded?: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onDelete, onClone, onEdit, isExpanded = false }) => {
    const [detailsVisible, setDetailsVisible] = useState(isExpanded);
    const duration = calculateDuration(project.startDate, project.deliveryDate);
    
    const tags = [
        { text: project.stage, color: 'bg-gray-100 text-gray-800' },
        { text: project.priority, color: priorityColorMap[project.priority] },
        { text: project.technology, color: 'bg-gray-100 text-gray-800' },
        { text: project.vendor, color: 'bg-gray-100 text-gray-800' },
    ];

    const canShowFooter = onClone && onEdit && onDelete;

    return (
        <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md border-l-4 flex flex-col" 
            style={{ 
                borderColor: `var(--color-${project.status === 'Red' ? 'danger' : project.status === 'Amber' ? 'warning' : 'success'})`,
            }}
        >
            <div className="p-4 flex-grow">
                {/* Card Header */}
                <div className="flex justify-between items-start mb-2">
                    <div>
                        {project.status === 'Red' && <Tag text="At Risk" className="bg-[var(--color-danger)] text-white mb-1" />}
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{project.name}</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                        <ArrowRightCircle className={`w-6 h-6 ${statusIndicatorMap[project.status]}`} />
                    </div>
                </div>

                {/* Tags */}
                <div className="mb-4">
                    {tags.map(tag => <Tag key={tag.text} text={tag.text} className={tag.color} />)}
                </div>

                {/* Timeline */}
                <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg mb-4 text-sm">
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">START DATE</p>
                        <p className="font-bold">{formatDate(project.startDate)}</p>
                    </div>
                    <ArrowRightCircle size={20} className="text-gray-400" />
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">DELIVERY DATE</p>
                        <p className="font-bold">{formatDate(project.deliveryDate)}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">DURATION</p>
                        <p className="font-bold text-green-600">{duration}</p>
                    </div>
                </div>
                
                {/* Progress */}
                <div className="flex items-center space-x-4 mb-4">
                    <div className="w-full">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Start</span>
                            <span>Delivery</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                            <div className="bg-[var(--color-success)] h-2.5 rounded-full" style={{ width: `${project.completionPercentage}%` }}></div>
                        </div>
                    </div>
                    <div className="flex-shrink-0 relative w-20 h-20">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                 <Pie data={[{value: project.completionPercentage}, {value: 100-project.completionPercentage}]} dataKey="value" cx="50%" cy="50%" innerRadius="70%" outerRadius="90%" startAngle={90} endAngle={-270}>
                                    <Cell fill="var(--color-success)" stroke="var(--color-success)" />
                                    <Cell fill="#e0e0e0" stroke="#e0e0e0" />
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center text-lg font-bold">
                            {project.completionPercentage}%
                        </div>
                    </div>
                </div>
            </div>

            {/* Collapsible Details Section */}
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${detailsVisible || isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-4 pb-4">
                    {/* Financials Section */}
                    {project.isCostIncluded && (
                        <div className="mb-4 pt-4 border-t dark:border-gray-700">
                            <h4 className="font-bold text-sm flex items-center mb-2"><Database size={14} className="mr-2"/> Financials</h4>
                            <div className="text-sm space-y-2">
                                <div className="flex justify-between">
                                    <span>Budget:</span>
                                    <span className="font-bold">${(project.budget || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Actual Cost:</span>
                                    <span className="font-bold">${(project.actualCost || 0).toLocaleString()}</span>
                                </div>
                                <div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-1">
                                        <div 
                                            className="h-2.5 rounded-full" 
                                            style={{ 
                                                width: `${Math.min(100, ((project.actualCost || 0) / (project.budget || 1)) * 100)}%`,
                                                backgroundColor: (project.actualCost || 0) > (project.budget || 0) 
                                                    ? 'var(--color-danger)' 
                                                    : ((project.actualCost || 0) / (project.budget || 1)) > 0.9 
                                                    ? 'var(--color-warning)' 
                                                    : 'var(--color-success)'
                                            }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                        <span>0%</span>
                                        <span>{Math.round(((project.actualCost || 0) / (project.budget || 1)) * 100)}% Used</span>
                                        <span>100%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Risks and Actions */}
                    <div className="space-y-4 my-4 bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-lg">
                        <div>
                            <h4 className="font-bold text-sm flex items-center mb-1"><Flag size={14} className="mr-2"/> Project Risks</h4>
                            {project.risks.length > 0 ? project.risks.map(r => <DetailItem key={r.id} item={r} icon={AlertTriangle} />) : <p className="text-xs text-gray-500 pl-6">No risks identified.</p>}
                        </div>
                        <div>
                            <h4 className="font-bold text-sm flex items-center mb-1"><ListTodo size={14} className="mr-2"/> Next Actions</h4>
                            {project.actions.length > 0 ? project.actions.map(a => <DetailItem key={a.id} item={a} icon={ListTodo} />) : <p className="text-xs text-gray-500 pl-6">No actions defined.</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Buttons */}
            {canShowFooter &&
            <div className="flex-shrink-0 flex justify-between items-center border-t dark:border-gray-700 p-3">
                 <button onClick={() => setDetailsVisible(!detailsVisible)} className="flex items-center text-sm font-medium text-gray-600 hover:text-[color:var(--color-primary)]">
                    <ChevronsUpDown size={16} className="mr-1" />
                    {detailsVisible ? 'Hide Details' : 'Show Details'}
                </button>
                <div className="flex space-x-1">
                    <button onClick={() => onClone(project.id)} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md" aria-label={`Clone ${project.name}`}><Copy size={16} /></button>
                    <button onClick={() => onEdit(project)} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md" aria-label={`Edit ${project.name}`}><Edit3 size={16} /></button>
                    <button onClick={() => onDelete(project.id)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-md" aria-label={`Delete ${project.name}`}><Trash2 size={16} /></button>
                </div>
            </div>
            }
        </div>
    );
};

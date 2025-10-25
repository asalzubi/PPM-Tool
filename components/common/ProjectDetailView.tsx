import React, { useState, useMemo, useEffect } from 'react';
import type { Project, TimelineEvent } from '../../types';
import { FileText, CheckSquare, TrendingUp, AlertTriangle, ListChecks, Calendar, Shield, DollarSign, BarChart2, Briefcase as BriefcaseIcon } from 'lucide-react';

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

export const FinancialsDisplay: React.FC<{project: Project}> = ({ project }) => {
    const financialMetrics = useMemo(() => {
        if (!project) return [];
        const metrics = [];
        if (project.isRoiIncluded) metrics.push('ROI');
        if (project.isNpvIncluded) metrics.push('NPV');
        if (project.isBusinessValueIncluded) metrics.push('Business Value');
        return metrics;
    }, [project]);

    const [activeFinancialTab, setActiveFinancialTab] = useState<string | null>(null);

     useEffect(() => {
        if (financialMetrics.length > 0 && !financialMetrics.includes(activeFinancialTab || '')) {
            setActiveFinancialTab(financialMetrics[0]);
        } else if (financialMetrics.length === 0) {
            setActiveFinancialTab(null);
        }
    }, [financialMetrics, activeFinancialTab]);

    if(financialMetrics.length === 0) return null;

    return (
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
                {activeFinancialTab === 'ROI' && <ROITabContent project={project} />}
                {activeFinancialTab === 'NPV' && <NPVTabContent project={project} />}
                {activeFinancialTab === 'Business Value' && <BusinessValueTabContent project={project} />}
            </div>
        </div>
    )
}

const DetailCard: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="flex items-center text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 border-b dark:border-gray-700 pb-2">
            <Icon className="w-4 h-4 mr-2" />
            {title}
        </h3>
        <div className="space-y-2">{children}</div>
    </div>
);

export const ProjectDetailView: React.FC<{ project: Project; timelineEvents: TimelineEvent[] }> = ({ project, timelineEvents }) => {
    
    const conflictingEvents = useMemo(() => {
        if (!project || !timelineEvents) return [];
        return getConflictingEvents(project, timelineEvents);
    }, [project, timelineEvents]);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700 space-y-6 h-full overflow-y-auto">
            {conflictingEvents.length > 0 && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-md dark:bg-yellow-900/20 dark:border-yellow-600 dark:text-yellow-200" role="alert">
                    <p className="font-bold flex items-center"><AlertTriangle className="mr-2" /> Timeline Conflict Warning</p>
                    <p className="text-sm">This project's schedule intersects with: {conflictingEvents.map(e => e.name).join(', ')}</p>
                </div>
            )}
            
            {/* Details Grid */}
            <div className="grid grid-cols-1 gap-6">
                <DetailCard title="Project Gantt View" icon={Calendar}>
                    <div className="text-sm">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>{new Date(project.startDate).toLocaleDateString()}</span>
                            <span>{new Date(project.deliveryDate).toLocaleDateString()}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
                            <div className="bg-yellow-400 h-4 rounded-full text-black text-xs font-bold flex items-center justify-center" style={{ width: `${project.completionPercentage}%` }}>
                                {project.completionPercentage}%
                            </div>
                        </div>
                    </div>
                </DetailCard>
                <DetailCard title="Risk Management" icon={Shield}>
                    {project.risks.length > 0 ? project.risks.map(risk => (
                        <div key={risk.id} className="text-sm border-l-4 pl-2" style={{borderColor: risk.type === 'High' || risk.type === 'Critical' ? 'var(--color-danger)' : 'var(--color-warning)'}}>
                            <span className="font-bold">{risk.type}:</span> {risk.description}
                            <span className="text-xs text-gray-500 italic"> (Owner: {risk.owner})</span>
                        </div>
                    )) : <p className="text-sm text-gray-500">No risks identified.</p>}
                </DetailCard>
                <DetailCard title="Next Actions" icon={ListChecks}>
                    {project.actions.length > 0 ? project.actions.map(action => (
                        <div key={action.id} className="text-sm border-l-4 pl-2" style={{borderColor: action.priority === 'High' || action.priority === 'Urgent' ? 'var(--color-danger)' : 'var(--color-warning)'}}>
                            <span className="font-bold">{action.priority}:</span> {action.description}
                        </div>
                    )) : <p className="text-sm text-gray-500">No actions defined.</p>}
                </DetailCard>
                 <DetailCard title={`Tasks (${project.tasks.filter(t=>t.isCompleted).length}/${project.tasks.length} completed)`} icon={CheckSquare}>
                    {project.tasks.length > 0 ? project.tasks.map(task => (
                        <div key={task.id} className="flex items-center text-sm">
                            <CheckSquare size={16} className={`mr-2 ${task.isCompleted ? 'text-green-500' : 'text-gray-300'}`} />
                            <span className={task.isCompleted ? 'line-through text-gray-500' : ''}>{task.description}</span>
                        </div>
                    )) : <p className="text-sm text-gray-500">No tasks defined.</p>}
                </DetailCard>
            </div>
        </div>
    )
}

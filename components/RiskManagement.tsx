import React, { useState, useMemo } from 'react';
import type { Project, AppSettings, EnrichedRisk, User, CustomFieldDefinition, Risk } from '../types';
import { ShieldAlert, Columns, Download, ArrowUp, ArrowDown, ChevronsUpDown, BarChart } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import RiskEditModal from './common/RiskEditModal';
import { calculateRiskScore } from '../services/riskService';
import CustomizeRiskColumnsModal from './admin/CustomizeRiskColumnsModal';
import { useAppContext } from '../context/AppContext';

const baseFields: { key: keyof EnrichedRisk | string; label: string }[] = [
    { key: 'projectName', label: 'Project' },
    { key: 'score', label: 'Score' },
    { key: 'type', label: 'Risk Type' },
    { key: 'impact', label: 'Impact' },
    { key: 'description', label: 'Description' },
    { key: 'owner', label: 'Owner' },
    { key: 'mitigation', label: 'Mitigation' },
];

const RiskManagement: React.FC = () => {
    const { 
        visibleProjects: projects, 
        updateProject, 
        settings, 
        updateSettings: setSettings, 
        currentUser, 
        setRiskListRef
    } = useAppContext();
    
    const [riskTypeFilter, setRiskTypeFilter] = useState<string>('All');
    const [projectFilter, setProjectFilter] = useState<string>('All');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
    const [selectedRisk, setSelectedRisk] = useState<EnrichedRisk | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: keyof EnrichedRisk | string; direction: 'ascending' | 'descending' }>({ key: 'score', direction: 'descending' });
    
    const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
        const initial: Record<string, boolean> = {};
        baseFields.forEach(f => initial[f.key] = true);
        initial['mitigation'] = false;
        initial['owner'] = false;
        (settings.customFields?.risks || []).forEach(cf => initial[cf.id] = true);
        return initial;
    });

    const enrichedRisks = useMemo<EnrichedRisk[]>(() => {
        return projects.flatMap(p => 
            p.risks.map(r => ({
                ...r,
                projectId: p.id,
                projectName: p.name,
                projectStage: p.stage,
                projectStatus: p.status,
                score: calculateRiskScore(r, settings),
            }))
        );
    }, [projects, settings]);

    const allFields = useMemo(() => {
        const customFields = (settings.customFields?.risks || []).map(cf => ({
            key: `customFields.${cf.id}`,
            label: cf.name
        }));
        return [...baseFields, ...customFields];
    }, [settings.customFields?.risks]);


    const sortedAndFilteredRisks = useMemo(() => {
        const filtered = enrichedRisks.filter(risk => {
            const typeMatch = riskTypeFilter === 'All' || risk.type === riskTypeFilter;
            const projectMatch = projectFilter === 'All' || risk.projectId.toString() === projectFilter;
            return typeMatch && projectMatch;
        });

        return [...filtered].sort((a, b) => {
            let aValue: any;
            let bValue: any;

            if (sortConfig.key.startsWith('customFields.')) {
                const customKey = sortConfig.key.split('.')[1];
                aValue = a.customFields?.[customKey];
                bValue = b.customFields?.[customKey];
            } else {
                aValue = a[sortConfig.key as keyof EnrichedRisk];
                bValue = b[sortConfig.key as keyof EnrichedRisk];
            }

            if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        });
    }, [enrichedRisks, riskTypeFilter, projectFilter, sortConfig]);
    
    const chartData = useMemo(() => {
        return enrichedRisks.map(risk => ({
            x: settings.riskScoring.mappings.type[risk.type],
            y: settings.riskScoring.mappings.impact[risk.impact],
            score: risk.score,
            projectName: risk.projectName,
            description: risk.description,
            type: risk.type
        }));
    }, [enrichedRisks, settings]);

    const risksByTypeForChart = useMemo(() => ({
        Low: chartData.filter(d => d.type === 'Low'),
        Medium: chartData.filter(d => d.type === 'Medium'),
        High: chartData.filter(d => d.type === 'High'),
        Critical: chartData.filter(d => d.type === 'Critical'),
    }), [chartData]);
    
    const riskTypeColors = {
        'Low': settings.riskChartColorLow, 'Medium': settings.riskChartColorMedium,
        'High': settings.riskChartColorHigh, 'Critical': settings.riskChartColorCritical,
    };
    
    const axisTickFormatter = (value: number) => ({ 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Critical' }[value] || '');

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md border dark:border-gray-700">
                    <p className="font-bold">{data.projectName}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">{data.description}</p>
                    <p className="text-sm mt-1">Score: <span className="font-semibold">{data.score}</span></p>
                </div>
            );
        }
        return null;
    };

    const requestSort = (key: keyof EnrichedRisk | string) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') direction = 'descending';
        setSortConfig({ key, direction });
    };

    const handleEditRisk = (risk: EnrichedRisk) => {
        setSelectedRisk(risk);
        setIsEditModalOpen(true);
    };

    const handleSaveRisk = (updatedRisk: EnrichedRisk) => {
        const projectToUpdate = projects.find(p => p.id === updatedRisk.projectId);
        if (!projectToUpdate) return;
        
        const newRisks = projectToUpdate.risks.map(r => r.id === updatedRisk.id ? {
            id: updatedRisk.id, type: updatedRisk.type, impact: updatedRisk.impact,
            description: updatedRisk.description, owner: updatedRisk.owner, mitigation: updatedRisk.mitigation,
            isVisibleOnDashboard: updatedRisk.isVisibleOnDashboard, customFields: updatedRisk.customFields
        } : r);

        updateProject({ ...projectToUpdate, risks: newRisks });
        setIsEditModalOpen(false);
        setSelectedRisk(null);
    };
    
    const handleSaveCustomization = (newVisibleColumns: Record<string, boolean>, newCustomFields: CustomFieldDefinition[]) => {
        setVisibleColumns(newVisibleColumns);
        setSettings({ ...settings, customFields: { ...(settings.customFields || {}), risks: newCustomFields, } });
        setIsCustomizeModalOpen(false);
    };

    const exportToCsv = () => {
        const headers = allFields.filter(f => visibleColumns[f.key]).map(f => f.label);
        const rows = sortedAndFilteredRisks.map(r => {
            return allFields.filter(f => visibleColumns[f.key]).map(f => {
                let value = f.key.startsWith('customFields.') ? r.customFields?.[f.key.split('.')[1]] : r[f.key as keyof EnrichedRisk];
                return `"${String(value || '').replace(/"/g, '""')}"`;
            }).join(',');
        });

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", "risk_management_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const SortableHeader: React.FC<{ label: string; sortKey: keyof EnrichedRisk | string; }> = ({ label, sortKey }) => (
        <th className="p-3 font-semibold cursor-pointer" onClick={() => requestSort(sortKey)}>
            <div className="flex items-center">
                {label}
                <span className="ml-2">
                    {sortConfig.key === sortKey ? (sortConfig.direction === 'ascending' ? <ArrowUp size={14}/> : <ArrowDown size={14}/>) : <ChevronsUpDown size={14} className="text-gray-400"/>}
                </span>
            </div>
        </th>
    );
    
    const RiskTypeBadge: React.FC<{ type: 'Low' | 'Medium' | 'High' | 'Critical' }> = ({ type }) => {
        const colorMap = {
            'Low': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300', 'Medium': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
            'High': 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300', 'Critical': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        };
        return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${colorMap[type]}`}>{type.toUpperCase()}</span>;
    };

    const isAdmin = currentUser?.role === 'Admin' || currentUser?.role === 'Developer';

    const { heatmapData, maxCount } = useMemo(() => {
        const impactLevels: Risk['impact'][] = ['Low', 'Medium', 'High', 'Critical'];
        const typeLevels: Risk['type'][] = ['Low', 'Medium', 'High', 'Critical'];
        
        const data: Record<Risk['impact'], Record<Risk['type'], number>> = {
            'Critical': { 'Low': 0, 'Medium': 0, 'High': 0, 'Critical': 0 },
            'High': { 'Low': 0, 'Medium': 0, 'High': 0, 'Critical': 0 },
            'Medium': { 'Low': 0, 'Medium': 0, 'High': 0, 'Critical': 0 },
            'Low': { 'Low': 0, 'Medium': 0, 'High': 0, 'Critical': 0 },
        };
        let max = 0;
        enrichedRisks.forEach(risk => {
            if (data[risk.impact] && data[risk.impact][risk.type] !== undefined) {
                data[risk.impact][risk.type]++;
                if (data[risk.impact][risk.type] > max) {
                    max = data[risk.impact][risk.type];
                }
            }
        });
        return { heatmapData: data, maxCount: max };
    }, [enrichedRisks]);

    const getHeatmapColor = (count: number, max: number) => {
        if (count === 0) return 'transparent';
        if (max === 0) return `rgba(220, 38, 38, 0.5)`;
        
        const intensity = 0.1 + 0.9 * (count / max);
        const hex = settings.riskChartColorCritical; // e.g., '#DC2626'
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${intensity})`;
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Risk Management</h2>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md" ref={setRiskListRef}>
                <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                    <h3 className="text-lg font-semibold">Risk Register</h3>
                    <div className="flex flex-wrap items-center gap-2">
                        <select value={riskTypeFilter} onChange={e => setRiskTypeFilter(e.target.value)} className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm">
                            <option value="All">All Risk Types</option>
                            <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option><option value="Critical">Critical</option>
                        </select>
                         <select value={projectFilter} onChange={e => setProjectFilter(e.target.value)} className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm">
                            <option value="All">All Projects</option>
                            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        {isAdmin && (
                            <button onClick={() => setIsCustomizeModalOpen(true)} className="flex items-center px-3 py-2 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-md text-sm font-medium"><Columns size={16} className="mr-2"/> Customize Columns</button>
                        )}
                        <button onClick={exportToCsv} className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md text-sm font-medium"><Download size={16} className="mr-2"/> Export to CSV</button>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                            <tr>{allFields.filter(f => visibleColumns[f.key]).map(field => ( <SortableHeader key={field.key} label={field.label} sortKey={field.key} /> ))}</tr>
                        </thead>
                        <tbody>
                            {sortedAndFilteredRisks.map(risk => (
                                <tr key={risk.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer" onClick={() => handleEditRisk(risk)}>
                                   {allFields.filter(f => visibleColumns[f.key]).map(field => {
                                        let cellContent;
                                        if (field.key === 'type' || field.key === 'impact') cellContent = <RiskTypeBadge type={risk[field.key as 'type' | 'impact']} />;
                                        else if (field.key.startsWith('customFields.')) cellContent = risk.customFields?.[field.key.split('.')[1]] || '-';
                                        else cellContent = risk[field.key as keyof EnrichedRisk] || '-';
                                        return <td key={field.key} className="p-3 max-w-xs truncate" title={String(cellContent)}>{cellContent}</td>;
                                   })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {sortedAndFilteredRisks.length === 0 && <div className="text-center py-8 text-gray-500">No risks match the current filters.</div>}
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Risk Matrix Visualization</h3>
                <div style={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer>
                        <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" dataKey="x" name="Type" domain={[0.5, 4.5]} ticks={[1, 2, 3, 4]} tickFormatter={axisTickFormatter} />
                            <YAxis type="number" dataKey="y" name="Impact" domain={[0.5, 4.5]} ticks={[1, 2, 3, 4]} tickFormatter={axisTickFormatter} />
                            <ZAxis dataKey="score" range={[60, 400]} name="score" />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                            <Legend />
                            <Scatter name="Low" data={risksByTypeForChart.Low} fill={riskTypeColors.Low} shape="circle" />
                            <Scatter name="Medium" data={risksByTypeForChart.Medium} fill={riskTypeColors.Medium} shape="circle" />
                            <Scatter name="High" data={risksByTypeForChart.High} fill={riskTypeColors.High} shape="circle" />
                            <Scatter name="Critical" data={risksByTypeForChart.Critical} fill={riskTypeColors.Critical} shape="circle" />
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4 flex items-center"><BarChart size={20} className="mr-2"/> Risk Heatmap</h3>
                <div className="flex">
                    <div className="flex flex-col justify-between py-8 pr-2 text-sm font-bold text-right">
                        <span className="transform -rotate-90">Critical</span>
                        <span className="transform -rotate-90">High</span>
                        <span className="transform -rotate-90">Medium</span>
                        <span className="transform -rotate-90">Low</span>
                    </div>
                    <div className="flex-grow">
                        <table className="w-full h-full border-collapse">
                            <tbody>
                                {(['Critical', 'High', 'Medium', 'Low'] as Risk['impact'][]).map(impact => (
                                    <tr key={impact}>
                                        {(['Low', 'Medium', 'High', 'Critical'] as Risk['type'][]).map(type => {
                                            const count = heatmapData[impact]?.[type] || 0;
                                            const color = getHeatmapColor(count, maxCount);
                                            const textColor = count > maxCount / 2 ? 'text-white' : 'text-gray-800 dark:text-gray-100';
                                            return (
                                                <td
                                                    key={type}
                                                    className={`w-1/4 h-24 border dark:border-gray-700 text-center transition-colors duration-300 ${textColor}`}
                                                    style={{ backgroundColor: color }}
                                                    title={`${count} risk(s)`}
                                                >
                                                    <span className="text-2xl font-bold">{count}</span>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    {(['Low', 'Medium', 'High', 'Critical'] as Risk['type'][]).map(type => (
                                        <th key={type} className="pt-2 text-sm font-bold">{type}</th>
                                    ))}
                                </tr>
                                 <tr>
                                    <th colSpan={4} className="pt-2 text-center font-bold">Risk Type</th>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
            
            {isEditModalOpen && selectedRisk && ( <RiskEditModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSave={handleSaveRisk} risk={selectedRisk} settings={settings} /> )}
            {isCustomizeModalOpen && isAdmin && ( <CustomizeRiskColumnsModal isOpen={isCustomizeModalOpen} onClose={() => setIsCustomizeModalOpen(false)} onSave={handleSaveCustomization} baseFields={baseFields} initialVisibleColumns={visibleColumns} initialCustomFields={settings.customFields?.risks || []} /> )}
        </div>
    );
};

export default RiskManagement;

import React, { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ArrowRightCircle, AlertTriangle } from 'lucide-react';
import type { Project, Risk, AppSettings } from '../types';
import ConfirmationModal from './common/ConfirmationModal';
import { ProjectCard } from './common/ProjectCard';
import { useAppContext } from '../context/AppContext';

const CircularProgress: React.FC<{ percentage: number; color: string; value: string | number; }> = ({ percentage, color, value }) => (
    <div style={{ width: 120, height: 120, position: 'relative' }}>
        <ResponsiveContainer>
            <PieChart>
                <Pie
                    data={[{ value: percentage }, { value: 100 - percentage }]}
                    cx="50%"
                    cy="50%"
                    innerRadius="70%"
                    outerRadius="100%"
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    paddingAngle={0}
                    cornerRadius={5}
                >
                    <Cell fill={color} stroke={color} />
                    <Cell fill="var(--color-accent)" fillOpacity={0.1} stroke="transparent" />
                </Pie>
            </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-2xl font-bold">{value}</span>
        </div>
    </div>
);

const Dashboard: React.FC = () => {
    const { 
        visibleProjects: projects, 
        setProjects, 
        deleteProject, 
        openCloneModal, 
        openProjectModal, 
        isLayoutLocked, 
        settings, 
        setDashboardSummaryRef
    } = useAppContext();

    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
    const navigate = useNavigate();
    
    const dragItem = useRef<number | null>(null);
    const dragNode = useRef<HTMLDivElement | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: number) => {
        if (isLayoutLocked) return;
        setIsDragging(true);
        dragItem.current = id;
        dragNode.current = e.currentTarget;
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => {
            dragNode.current?.classList.add('dragging-card');
        }, 0);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropTargetId: number) => {
        e.preventDefault();
        if (isLayoutLocked) return;

        const dragItemId = dragItem.current;
        if (dragItemId === null || dragItemId === dropTargetId) return;

        const dragItemIndex = projects.findIndex(p => p.id === dragItemId);
        const dropTargetIndex = projects.findIndex(p => p.id === dropTargetId);

        if (dragItemIndex === -1 || dropTargetIndex === -1) return;

        const newProjects = [...projects];
        [newProjects[dragItemIndex], newProjects[dropTargetIndex]] = [newProjects[dropTargetIndex], newProjects[dragItemIndex]];

        setProjects(newProjects); // This is a frontend-only state change for ordering
    };

    const handleDragEnd = () => {
        setIsDragging(false);
        dragNode.current?.classList.remove('dragging-card');
        dragItem.current = null;
        dragNode.current = null;
    };

    const totalProjects = projects.length;
    
    const statusCounts = useMemo(() => projects.reduce((acc, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1;
        return acc;
    }, {} as Record<Project['status'], number>), [projects]);
    
    const greenPercentage = totalProjects > 0 ? Math.round(((statusCounts.Green || 0) / totalProjects) * 100) : 0;
    const atRiskProjectsCount = projects.filter(p => p.status === 'Red').length;
    
    const riskDistribution = useMemo(() => {
        const counts: { [key in Risk['type']]: number } = { 'Low': 0, 'Medium': 0, 'High': 0, 'Critical': 0 };
        projects.forEach(project => {
            project.risks.forEach(risk => {
                if (counts.hasOwnProperty(risk.type)) counts[risk.type]++;
            });
        });
        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .filter(item => item.value > 0);
    }, [projects]);

    const riskTypeColors: { [key in Risk['type']]: string } = {
        'Low': settings.riskChartColorLow,
        'Medium': settings.riskChartColorMedium,
        'High': settings.riskChartColorHigh,
        'Critical': settings.riskChartColorCritical,
    };

    const handleDeleteClick = (projectId: number) => {
        const project = projects.find(p => p.id === projectId);
        if (project) setProjectToDelete(project);
    };
    
    const confirmDelete = () => {
        if (projectToDelete) {
            deleteProject(projectToDelete.id);
            setProjectToDelete(null);
        }
    };

    if (!settings) return null; // Or a loading spinner

    return (
        <div className={`space-y-6 transition-all duration-300`}>
            <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-bold">Dashboard</h2>
            </div>
            
            <div ref={setDashboardSummaryRef}>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex flex-col items-center justify-center min-h-[180px] cursor-pointer hover:shadow-xl transition-shadow" onClick={() => navigate('/projects')} title="View Project Management">
                        <span className="text-5xl font-bold text-[color:var(--color-primary)]">{totalProjects}</span>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Total Projects</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex flex-col items-center justify-center min-h-[180px] cursor-pointer hover:shadow-xl transition-shadow" onClick={() => navigate('/program-view')} title="View Program View">
                        <CircularProgress percentage={greenPercentage} color="var(--color-success)" value={`${greenPercentage}%`}/>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 text-center text-sm font-medium">Program Status</p>
                        <p className="text-xs text-gray-400">{statusCounts.Green || 0} Green, {statusCounts.Amber || 0} Amber, {statusCounts.Red || 0} Red</p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex flex-col items-center justify-center min-h-[180px]">
                        <span className="text-5xl font-bold text-[color:var(--color-primary)]">{atRiskProjectsCount}</span>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Projects at Risk</p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col min-h-[180px] cursor-pointer hover:shadow-xl transition-shadow" onClick={() => navigate('/risk-management')} title="View Risk Management">
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 text-center mb-2">Risk Distribution</h4>
                        <div className="flex-grow">
                            <ResponsiveContainer width="100%" height="100%">
                                {riskDistribution.length > 0 ? (
                                    <PieChart>
                                        <Pie data={riskDistribution} dataKey="value" nameKey="name" cx="40%" cy="50%" outerRadius={60} labelLine={false}
                                            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                                const RADIAN = Math.PI / 180;
                                                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                                const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                                if (percent * 100 < 5) return null;
                                                return <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="12px" fontWeight="bold">
                                                        {`${(percent * 100).toFixed(0)}%`}
                                                    </text>;
                                            }}>
                                            {riskDistribution.map((entry) => <Cell key={`cell-${entry.name}`} fill={riskTypeColors[entry.name as keyof typeof riskTypeColors]} />)}
                                        </Pie>
                                        <Tooltip formatter={(value, name) => [value, name]} />
                                        <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px' }}/>
                                    </PieChart>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-sm text-gray-500">No risk data available.</div>
                                )}
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 items-start ${isDragging ? 'drag-grid-background' : ''}`}>
                {projects.map(project => (
                    <div key={project.id} className={`transition-all duration-200 ease-in-out rounded-lg ${!isLayoutLocked && !isDragging ? 'wiggling-card' : ''} ${!isLayoutLocked ? 'cursor-move' : ''}`}
                        draggable={!isLayoutLocked} onDragStart={(e) => handleDragStart(e, project.id)} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, project.id)} onDragEnd={handleDragEnd}>
                        <ProjectCard project={project} onDelete={handleDeleteClick} onClone={openCloneModal} onEdit={openProjectModal} />
                    </div>
                ))}
            </div>

            {projectToDelete && (
                <ConfirmationModal isOpen={!!projectToDelete} onClose={() => setProjectToDelete(null)} onConfirm={confirmDelete} title="Delete Project" message={`Are you sure you want to delete the project "${projectToDelete.name}"? This action cannot be undone.`} />
            )}
        </div>
    );
};

export default Dashboard;

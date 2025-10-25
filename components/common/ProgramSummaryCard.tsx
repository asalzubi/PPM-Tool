import React from 'react';
import type { Project } from '../../types';
import { AlertTriangle } from 'lucide-react';

interface ProgramSummaryCardProps {
    projects: Project[];
}

const statusDotColorMap: { [key in Project['status']]: string } = {
    Green: 'bg-[var(--color-success)]',
    Amber: 'bg-[var(--color-warning)]',
    Red: 'bg-[var(--color-danger)]',
};

const ProgramSummaryCard: React.FC<ProgramSummaryCardProps> = ({ projects }) => {
    const totalProjects = projects.length;

    const statusCounts = projects.reduce((acc, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1;
        return acc;
    }, { Green: 0, Amber: 0, Red: 0 } as Record<Project['status'], number>);

    const projectsOnTrack = statusCounts.Green;
    const projectsAtRiskSummary = statusCounts.Amber + statusCounts.Red;

    const criticalRisksCount = projects.reduce((acc, project) => {
        return acc + project.risks.filter(risk => risk.type === 'Critical').length;
    }, 0);

    const projectsWithHighOrCriticalRisks = projects.filter(p =>
        p.risks.some(r => r.type === 'High' || r.type === 'Critical')
    );
    
    const trendCounts = projects.reduce((acc, p) => {
        acc[p.trend] = (acc[p.trend] || 0) + 1;
        return acc;
    }, {} as Record<Project['trend'], number>);

    let overallTrend: Project['trend'] = 'Stable';
    if ((trendCounts.Up || 0) > (trendCounts.Down || 0) && (trendCounts.Up || 0) >= (trendCounts.Stable || 0)) {
        overallTrend = 'Up';
    } else if ((trendCounts.Down || 0) > (trendCounts.Up || 0) && (trendCounts.Down || 0) > (trendCounts.Stable || 0)) {
        overallTrend = 'Down';
    }
    
    const trendIndicator = {
        Up: { color: 'text-green-500' },
        Stable: { color: 'text-yellow-500' },
        Down: { color: 'text-red-500' }
    };
    
    const StatItem: React.FC<{ label: string; value: string | number; valueColor?: string; }> = ({ label, value, valueColor = '' }) => (
        <div className="flex justify-between items-center text-sm py-1">
            <span className={`text-gray-600 dark:text-gray-400 ${valueColor.replace('text-', 'font-semibold text-')}`}>{label}</span>
            <span className={`font-bold text-lg ${valueColor}`}>{value}</span>
        </div>
    );

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700 mb-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-4 border-b dark:border-gray-700 pb-2">
                <h3 className="text-lg font-bold">Program Status Summary</h3>
                <div className={`flex items-center text-sm font-semibold ${trendIndicator[overallTrend].color}`}>
                    <span className={`w-3 h-3 rounded-full mr-2 ${trendIndicator[overallTrend].color.replace('text-', 'bg-')}`}></span>
                    &rarr; {overallTrend}
                </div>
            </div>

            {/* Main Stats */}
            <div className="space-y-2 border-b dark:border-gray-700 pb-4 pt-2">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <div className="flex-1"><StatItem label="Total Projects:" value={totalProjects} /></div>
                    <div className="flex-1"><StatItem label="Projects on Track:" value={projectsOnTrack} /></div>
                    <div className="flex-1"><StatItem label="Projects at Risk:" value={projectsAtRiskSummary} /></div>
                </div>
                <StatItem label="Critical Risks:" value={criticalRisksCount} />
            </div>
            
            {/* Status Distribution */}
            <div className="pt-4 pb-4 border-b dark:border-gray-700">
                 <h4 className="text-md font-bold mb-3">Project Status Distribution</h4>
                 <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <div className="flex-1"><StatItem label="Green Projects:" value={statusCounts.Green} valueColor="text-[var(--color-success)]" /></div>
                    <div className="flex-1"><StatItem label="Amber Projects:" value={statusCounts.Amber} valueColor="text-[var(--color-warning)]" /></div>
                    <div className="flex-1"><StatItem label="Red Projects:" value={statusCounts.Red} valueColor="text-[var(--color-danger)]" /></div>
                </div>
            </div>

            {/* Projects at Risk List */}
            {projectsWithHighOrCriticalRisks.length > 0 && (
                <div className="pt-4">
                    <h4 className="text-md font-bold mb-2 flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2 text-[var(--color-warning)]" />
                        Projects at Risk
                    </h4>
                    <div className="space-y-2">
                        {projectsWithHighOrCriticalRisks.map(project => (
                             <div key={project.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md border-l-4 border-[var(--color-danger)]">
                                <div>
                                    <p className="font-bold">{project.name} - <span className="font-normal text-sm text-gray-600 dark:text-gray-400">{project.stage}</span></p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Status: {project.status.toUpperCase()} | Technology: {project.technology}</p>
                                </div>
                                <div className={`w-4 h-4 rounded-full flex-shrink-0 ${statusDotColorMap[project.status]}`}></div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProgramSummaryCard;

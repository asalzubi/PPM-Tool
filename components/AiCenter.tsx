
import React, { useState } from 'react';
import type { Project } from '../types';
import { summarizeProjects, summarizeProject } from '../services/geminiService';
import { Bot, FileText } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const AiCenter: React.FC = () => {
    const { allProjects: projects, settings } = useAppContext();
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(projects.length > 0 ? projects[0].id : null);
    const [portfolioSummary, setPortfolioSummary] = useState<string>('');
    const [projectSummary, setProjectSummary] = useState<string>('');
    const [isPortfolioLoading, setIsPortfolioLoading] = useState(false);
    const [isProjectLoading, setIsProjectLoading] = useState(false);

    if (!settings) return null; // Or a loading spinner

    const handleGeneratePortfolioSummary = async () => {
        setIsPortfolioLoading(true);
        const summary = await summarizeProjects(projects, settings.aiSettings.summarizationModel);
        setPortfolioSummary(summary);
        setIsPortfolioLoading(false);
    };

    const handleGenerateProjectSummary = async () => {
        if (!selectedProjectId) return;
        const project = projects.find(p => p.id === selectedProjectId);
        if (project) {
            setIsProjectLoading(true);
            const summary = await summarizeProject(project, settings.aiSettings.summarizationModel);
            setProjectSummary(summary);
            setIsProjectLoading(false);
        }
    };
    
    const SummaryDisplay: React.FC<{ title: string, content: string, isLoading: boolean, icon: React.ElementType }> = ({ title, content, isLoading, icon: Icon }) => (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
                <Icon className="w-6 h-6 mr-3 text-[color:var(--color-primary)]" />
                <h3 className="text-lg font-semibold">{title}</h3>
            </div>
            <div className="prose dark:prose-invert max-w-none bg-gray-50 dark:bg-gray-900/50 p-4 rounded-md min-h-[200px] overflow-y-auto">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[color:var(--color-primary)]"></div>
                    </div>
                ) : (
                    <div dangerouslySetInnerHTML={{ __html: content || `<p class="text-gray-500">Click the generate button to see an AI summary.</p>` }} />
                )}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">AI Insight Center</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <SummaryDisplay title="Program Summary" content={portfolioSummary} isLoading={isPortfolioLoading} icon={Bot} />
                    <button
                        onClick={handleGeneratePortfolioSummary}
                        disabled={isPortfolioLoading}
                        className="mt-4 w-full px-4 py-2 bg-[color:var(--color-primary)] text-white rounded-md hover:opacity-90 disabled:bg-gray-400"
                    >
                        {isPortfolioLoading ? 'Generating...' : 'Generate Program Summary'}
                    </button>
                </div>
                <div>
                    <SummaryDisplay title="Project Detail Summary" content={projectSummary} isLoading={isProjectLoading} icon={FileText} />
                     <div className="mt-4 flex gap-4">
                        <select
                            value={selectedProjectId || ''}
                            onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                        >
                            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <button
                            onClick={handleGenerateProjectSummary}
                            disabled={isProjectLoading || !selectedProjectId}
                            className="w-full px-4 py-2 bg-[color:var(--color-primary)] text-white rounded-md hover:opacity-90 disabled:bg-gray-400"
                        >
                            {isProjectLoading ? 'Generating...' : 'Generate Project Summary'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AiCenter;

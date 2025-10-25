

import React, { useState, useRef, useMemo } from 'react';
import type { Project } from '../types';
import { FileSliders, Mail } from 'lucide-react';
import { exportToSlides, emailReport } from '../services/reportingService';
import EmailReportModal from './common/EmailReportModal';
import ProgramProjectCard from './common/ProgramProjectCard';
import ProgramSummaryCard from './common/ProgramSummaryCard';
import { useAppContext } from '../context/AppContext';

const ProgramView: React.FC = () => {
    // FIX: Destructure programViewRef to get access to the DOM element.
    const { visibleProjects: projects, setProgramViewRef, programViewRef } = useAppContext();
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    
    const stages: Project['stage'][] = ['Planning', 'POC', 'Development', 'Testing', 'Deployment', 'Completed'];

    const projectsByStage = useMemo(() => {
        const grouped = {} as Record<Project['stage'], Project[]>;
        stages.forEach(stage => grouped[stage] = []);
        projects.forEach(project => {
            if (grouped[project.stage]) {
                grouped[project.stage].push(project);
            }
        });
        return grouped;
    }, [projects]);


    const handleExportSlides = () => {
        // FIX: Use the programViewRef state variable which holds the element.
        const reportContent = programViewRef;
        exportToSlides([{ element: reportContent }], 'program-view-report.pptx');
    };

    const handleEmailReport = (email: string) => {
        // FIX: Use the programViewRef state variable which holds the element.
        const reportContent = programViewRef;
        emailReport(reportContent, email, 'Program View Report');
        setIsEmailModalOpen(false);
    };


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Program View</h2>
                <div className="flex space-x-2">
                    <button onClick={handleExportSlides} className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700">
                        <FileSliders size={16} className="mr-2" />
                        Export to Slides
                    </button>
                    <button onClick={() => setIsEmailModalOpen(true)} className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700">
                        <Mail size={16} className="mr-2" />
                        Email Report
                    </button>
                </div>
            </div>
            
            <div ref={setProgramViewRef}>
                <ProgramSummaryCard projects={projects} />
                <div className="flex space-x-4 overflow-x-auto pb-4">
                    {stages.map(stage => (
                        <div key={stage} className="bg-gray-100 dark:bg-gray-900/50 rounded-lg p-3 w-80 flex-shrink-0">
                            <h3 className="font-semibold text-lg mb-4 px-1 border-b-2 border-[color:var(--color-primary)] pb-2">{stage} ({projectsByStage[stage].length})</h3>
                            <div className="space-y-3 h-full overflow-y-auto">
                                {projectsByStage[stage].length > 0 ? (
                                    projectsByStage[stage].map(project => (
                                        <ProgramProjectCard key={project.id} project={project} />
                                    ))
                                ) : (
                                    <div className="text-center text-sm text-gray-500 py-4">No projects in this stage.</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>


            <EmailReportModal
                isOpen={isEmailModalOpen}
                onClose={() => setIsEmailModalOpen(false)}
                onConfirm={handleEmailReport}
            />
        </div>
    );
};

export default ProgramView;

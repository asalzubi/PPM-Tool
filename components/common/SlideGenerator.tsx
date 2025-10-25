import React, { useRef, useEffect } from 'react';
import { ProjectCard } from './ProjectCard';
import { ProjectDetailView, FinancialsDisplay } from './ProjectDetailView';
import type { Project, AppSettings, TimelineEvent, Action } from '../../types';
import { ListTodo } from 'lucide-react';

interface SlideGeneratorProps {
    projects: Project[];
    settings: AppSettings;
    timelineEvents: TimelineEvent[];
    onReady: (slides: { element: HTMLElement | null; title?: string }[]) => void;
}

const AllActionsSlide: React.FC<{ projects: Project[] }> = ({ projects }) => {
    const allActions = projects.flatMap(p => p.actions.map(a => ({ ...a, projectName: p.name })));
    
    return (
        <div className="p-4 bg-white">
            <h3 className="text-xl font-bold mb-4">All Next Actions</h3>
            <div className="space-y-3">
                {allActions.length > 0 ? allActions.map(action => (
                    <div key={`${action.projectName}-${action.id}`} className="p-3 rounded-md bg-gray-50 border-l-4 border-blue-500">
                        <p className="font-semibold">{action.description}</p>
                        <p className="text-sm text-gray-600">
                            <strong>Project:</strong> {action.projectName} | <strong>Priority:</strong> {action.priority}
                        </p>
                    </div>
                )) : <p>No actions found across all projects.</p>}
            </div>
        </div>
    );
};

const ProjectSlide: React.FC<{ project: Project; timelineEvents: TimelineEvent[] }> = ({ project, timelineEvents }) => {
    return (
        <div className="grid grid-cols-2 gap-4 p-4 bg-white" style={{ height: '720px' }}>
            <div className="col-span-1">
                <ProjectCard project={project} isExpanded={true} />
            </div>
            <div className="col-span-1 flex flex-col gap-4">
                <div className="flex-grow">
                     <ProjectDetailView project={project} timelineEvents={timelineEvents} />
                </div>
                <div className="flex-shrink-0">
                    <FinancialsDisplay project={project} />
                </div>
            </div>
        </div>
    );
};


export const SlideGenerator: React.FC<SlideGeneratorProps> = ({ projects, settings, timelineEvents, onReady }) => {
    const titleRef = useRef<HTMLDivElement>(null);
    const actionsRef = useRef<HTMLDivElement>(null);
    const projectRefs = useRef<Record<string, HTMLDivElement | null>>({});

    useEffect(() => {
        // This effect runs after the component has rendered, ensuring refs are populated.
        // It then calls the onReady callback with the refs to be captured.
        const projectSlides = projects.map(p => ({
            element: projectRefs.current[p.id],
            title: `Project Details: ${p.name}`
        }));

        const slides = [
            { element: titleRef.current, title: '' },
            { element: actionsRef.current, title: 'All Next Actions' },
            ...projectSlides
        ];
        
        onReady(slides);
    }, []); // Empty dependency array means this runs once after initial render.

    return (
        <div style={{ position: 'absolute', left: '-9999px', top: 0, zIndex: -1, width: '1280px', fontFamily: 'sans-serif' }}>
            {/* Slide 1: Title */}
            <div ref={titleRef} className="p-10 bg-white text-center flex flex-col justify-center" style={{ height: '720px' }}>
                <h1 className="text-5xl font-bold text-[color:var(--blue-700)]">{settings.headerTitle}</h1>
                <p className="text-2xl mt-4 text-gray-600">{settings.headerSubtitle}</p>
                <p className="text-lg mt-10 text-gray-500">Generated on: {new Date().toLocaleDateString()}</p>
            </div>

            {/* Slide for each project */}
            {projects.map(project => (
                // FIX: Added curly braces to ref callback to avoid implicit return, satisfying the Ref type.
                <div key={project.id} ref={el => { projectRefs.current[project.id] = el; }}>
                    <ProjectSlide project={project} timelineEvents={timelineEvents} />
                </div>
            ))}
            
            {/* Slide for all actions */}
            <div ref={actionsRef}>
                <AllActionsSlide projects={projects} />
            </div>
        </div>
    );
};

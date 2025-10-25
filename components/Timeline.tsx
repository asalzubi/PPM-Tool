
import React, { useState, useMemo } from 'react';
import type { Project, TimelineEvent, AppSettings } from '../types';
import { PlusCircle, Edit, Trash2, AlertTriangle } from 'lucide-react';
import EventModal from './common/EventModal';
import ConfirmationModal from './common/ConfirmationModal';
import { useAppContext } from '../context/AppContext';

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-CA'); // YYYY-MM-DD
};

const formatDateRange = (start: string, end?: string) => {
    const startDate = new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!end || start === end) return startDate;
    const endDate = new Date(end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${startDate} - ${endDate}`;
};

const Timeline: React.FC = () => {
    const { 
        visibleProjects: projects, 
        timelineEvents, 
        saveTimelineEvent, 
        deleteTimelineEvent, 
        settings,
        setTimelineEventsRef,
        setTimelineGanttRef,
        timelineExportView,
        setTimelineExportView
    } = useAppContext();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
    const [eventToDelete, setEventToDelete] = useState<TimelineEvent | null>(null);
    const [expandedConflicts, setExpandedConflicts] = useState<number[]>([]);

    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [currentQuarter, setCurrentQuarter] = useState(Math.floor(new Date().getMonth() / 3) + 1);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    
    const getConflictingEvents = (project: Project, events: TimelineEvent[]): TimelineEvent[] => {
        const projectStart = new Date(project.startDate).getTime();
        const projectEnd = new Date(project.deliveryDate).getTime();
        
        return events.filter(event => {
            const eventStart = new Date(event.startDate).getTime();
            const eventEnd = event.endDate ? new Date(event.endDate).getTime() : eventStart;
            return Math.max(projectStart, eventStart) <= Math.min(projectEnd, eventEnd);
        });
    };
    
    const { chartStartDate, chartEndDate, timeUnitHeaders } = useMemo(() => {
        let startDate: Date, endDate: Date;
        const headers: { label: string, days: number }[] = [];

        switch(timelineExportView) {
            case 'yearly':
                startDate = new Date(currentYear, 0, 1);
                endDate = new Date(currentYear, 11, 31);
                for (let i = 0; i < 12; i++) {
                    headers.push({ label: new Date(currentYear, i).toLocaleString('default', { month: 'short' }), days: getDaysInMonth(currentYear, i) });
                }
                break;
            case 'quarterly':
                const startMonth = (currentQuarter - 1) * 3;
                startDate = new Date(currentYear, startMonth, 1);
                endDate = new Date(currentYear, startMonth + 3, 0);
                 for (let i = 0; i < 3; i++) {
                    const month = startMonth + i;
                    headers.push({ label: new Date(currentYear, month).toLocaleString('default', { month: 'long' }), days: getDaysInMonth(currentYear, month) });
                }
                break;
            case 'monthly':
            default:
                startDate = new Date(currentYear, currentMonth, 1);
                endDate = new Date(currentYear, currentMonth + 1, 0);
                const daysInMonth = getDaysInMonth(currentYear, currentMonth);
                for (let i = 1; i <= daysInMonth; i++) {
                    headers.push({ label: i.toString(), days: 1 });
                }
                break;
        }
        return { chartStartDate: startDate, chartEndDate: endDate, timeUnitHeaders: headers };

    }, [timelineExportView, currentYear, currentQuarter, currentMonth]);

    const handleAddNewEvent = () => {
        setSelectedEvent(null);
        setIsModalOpen(true);
    };

    const handleEditEvent = (event: TimelineEvent) => {
        setSelectedEvent(event);
        setIsModalOpen(true);
    };
    
    const handleDeleteClick = (event: TimelineEvent) => {
        setEventToDelete(event);
    }
    
    const confirmDelete = () => {
        if(eventToDelete) {
            deleteTimelineEvent(eventToDelete.id);
            setEventToDelete(null);
        }
    }

    const handleSave = (eventToSave: TimelineEvent) => {
        saveTimelineEvent(eventToSave);
        setIsModalOpen(false);
    };
    
    const handleToggleConflicts = (projectId: number) => {
        setExpandedConflicts(prev => 
            prev.includes(projectId) 
                ? prev.filter(id => id !== projectId)
                : [...prev, projectId]
        );
    };

    const renderGanttChart = () => {
        const totalDays = (chartEndDate.getTime() - chartStartDate.getTime()) / (1000 * 3600 * 24) + 1;
        const dayWidth = 100 / totalDays;
        
        const dateToPosition = (dateStr: string) => {
            const date = new Date(dateStr);
            const clampedDate = new Date(Math.max(chartStartDate.getTime(), Math.min(date.getTime(), chartEndDate.getTime())));
            const diff = (clampedDate.getTime() - chartStartDate.getTime()) / (1000 * 3600 * 24);
            return diff * dayWidth;
        };

        return (
            <div className="min-w-[800px]">
                {/* Header */}
                <div className="flex sticky top-0 bg-white dark:bg-gray-800 z-10">
                    <div className="w-48 px-2 font-semibold border-r border-b dark:border-gray-700 h-10 flex items-center">Project</div>
                    <div className="flex-1 flex border-b dark:border-gray-700">
                        {timeUnitHeaders.map((header, index) => (
                            <div key={index} className="text-center font-semibold border-r dark:border-gray-700 h-10 flex items-center justify-center" style={{ width: `${(header.days / totalDays) * 100}%`}}>
                                {header.label}
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Body */}
                <div>
                    {projects.map(project => {
                         const conflictingEvents = getConflictingEvents(project, timelineEvents);
                         const start = new Date(project.startDate);
                         const end = new Date(project.deliveryDate);
            
                         const effectiveStart = start > chartStartDate ? start : chartStartDate;
                         const effectiveEnd = end < chartEndDate ? end : chartEndDate;

                         const left = dateToPosition(formatDate(effectiveStart));
                         const duration = (effectiveEnd.getTime() - effectiveStart.getTime()) / (1000 * 3600 * 24) + 1;
                         const width = duration * dayWidth;

                         return (
                             <React.Fragment key={project.id}>
                                <div className="flex items-center h-12 border-b dark:border-gray-700">
                                    <div className="w-48 px-2 border-r dark:border-gray-700 h-full flex flex-col justify-center">
                                        <p className="font-semibold truncate">{project.name}</p>
                                        {conflictingEvents.length > 0 && (
                                            <button onClick={() => handleToggleConflicts(project.id)} className="text-xs text-red-500 dark:text-red-400 truncate text-left hover:underline" title={`Conflicts with: ${conflictingEvents.map(e => e.name).join(', ')}`}>
                                                <AlertTriangle size={12} className="inline mr-1" /> Conflict ({conflictingEvents.length})
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex-1 relative h-full">
                                        { (left >= 0 || (left + width > 0)) &&
                                            <div title={`${project.name} (${formatDateRange(project.startDate, project.deliveryDate)})`} className="absolute h-8 top-2 rounded bg-blue-500 flex items-center px-2 text-white text-xs font-semibold truncate" style={{ left: `${left}%`, width: `${width}%` }} >
                                                {project.name}
                                            </div>
                                        }
                                    </div>
                                </div>
                                {expandedConflicts.includes(project.id) && conflictingEvents.length > 0 && (
                                    <div className="flex border-b dark:border-gray-700 bg-red-50 dark:bg-red-900/20">
                                        <div className="w-48 px-2 border-r dark:border-gray-700 flex-shrink-0"></div>
                                        <div className="flex-1 p-2 text-xs">
                                            <h5 className="font-bold mb-1 text-red-800 dark:text-red-200">Conflict Details:</h5>
                                            <ul className="list-disc list-inside pl-2 space-y-1">
                                                {conflictingEvents.map(event => ( <li key={event.id}><strong>{event.name}</strong> ({event.type}): {formatDateRange(event.startDate, event.endDate)}</li> ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </React.Fragment>
                         )
                    })}
                </div>
            </div>
        );
    };
    
    const eventTypeColors: { [key in TimelineEvent['type']]: string } = {
        'Milestone': 'border-blue-500', 'Code Freeze': 'border-red-500', 'Holiday Freeze': 'border-red-500', 'Freeze': 'border-red-500',
        'Deployment Window': 'border-green-500', 'Deployment': 'border-green-500', 'Go-Live': 'border-green-500', 'Security Audit': 'border-yellow-500',
    };

    if (!settings) return null;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Program Timeline</h2>
            
            <div className="flex flex-col gap-6">
                {/* Event List */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md" ref={setTimelineEventsRef}>
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Global Events</h3>
                        <button onClick={handleAddNewEvent} className="flex items-center px-3 py-1 bg-[color:var(--color-primary)] text-white rounded-md hover:opacity-90 shadow-sm text-sm">
                            <PlusCircle size={16} className="mr-2" /> Add Event
                        </button>
                    </div>
                    <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
                       {timelineEvents.map(event => (
                           <div key={event.id} className={`p-3 rounded-lg border-l-4 ${eventTypeColors[event.type] || 'border-gray-500'} bg-gray-50 dark:bg-gray-900/50`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold">{event.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{event.type}</p>
                                    </div>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">{formatDateRange(event.startDate, event.endDate)}</p>
                                </div>
                                {event.description && ( <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{event.description}</p> )}
                                <div className="flex justify-end mt-2 space-x-2">
                                     <button onClick={() => handleEditEvent(event)} className="p-1 text-gray-500 hover:text-blue-500"><Edit size={14} /></button>
                                     <button onClick={() => handleDeleteClick(event)} className="p-1 text-gray-500 hover:text-red-500"><Trash2 size={14} /></button>
                                </div>
                           </div>
                       ))}
                    </div>
                </div>

                {/* Gantt Chart */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md overflow-x-auto" ref={setTimelineGanttRef}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Project Gantt View</h3>
                         <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                            <button onClick={() => setTimelineExportView('monthly')} className={`px-3 py-1 text-sm rounded-md ${timelineExportView === 'monthly' ? 'bg-white dark:bg-gray-900 shadow' : ''}`}>Month</button>
                            <button onClick={() => setTimelineExportView('quarterly')} className={`px-3 py-1 text-sm rounded-md ${timelineExportView === 'quarterly' ? 'bg-white dark:bg-gray-900 shadow' : ''}`}>Quarter</button>
                            <button onClick={() => setTimelineExportView('yearly')} className={`px-3 py-1 text-sm rounded-md ${timelineExportView === 'yearly' ? 'bg-white dark:bg-gray-900 shadow' : ''}`}>Year</button>
                        </div>
                    </div>
                    {renderGanttChart()}
                </div>
            </div>

            {isModalOpen && ( <EventModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} event={selectedEvent} settings={settings} /> )}
            
            {eventToDelete && ( <ConfirmationModal isOpen={!!eventToDelete} onClose={() => setEventToDelete(null)} onConfirm={confirmDelete} title="Delete Event" message={`Are you sure you want to delete the event "${eventToDelete.name}"? This action cannot be undone.`} /> )}
        </div>
    );
};

export default Timeline;

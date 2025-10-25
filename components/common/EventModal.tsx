
import React, { useState, useEffect } from 'react';
import type { TimelineEvent, AppSettings } from '../../types';
import { X, Save, Calendar } from 'lucide-react';
import { EnrichableTextarea } from '../Projects';

interface EventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (event: TimelineEvent) => void;
    event: TimelineEvent | null;
    settings: AppSettings;
}

const eventTypes: TimelineEvent['type'][] = ['Milestone', 'Code Freeze', 'Deployment Window', 'Security Audit', 'Go-Live', 'Holiday Freeze'];

const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, onSave, event, settings }) => {
    const [editedEvent, setEditedEvent] = useState({
        id: Date.now(),
        name: '',
        type: 'Milestone' as TimelineEvent['type'],
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        description: '',
    });

    useEffect(() => {
        if (isOpen) {
            setEditedEvent(
                event ? { ...event, endDate: event.endDate || '', description: event.description || '' } : {
                    id: Date.now(),
                    name: '',
                    type: 'Milestone',
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: '',
                    description: '',
                }
            );
        }
    }, [event, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditedEvent(prev => ({ ...prev, [name]: value }));
    };

    const handleEnrich = (fieldName: string, enrichedText: string) => {
        if (fieldName === 'description') {
            setEditedEvent(prev => ({ ...prev, description: enrichedText }));
        }
    };

    const handleSave = () => {
        if (editedEvent.name.trim() && editedEvent.startDate) {
            onSave({
                ...editedEvent,
                endDate: editedEvent.endDate || undefined,
                description: editedEvent.description || undefined,
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg m-4">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center">
                        <Calendar className="mr-2" /> {event ? 'Edit Event' : 'Add New Event'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-300">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="event-name" className="block text-sm font-medium">Event Name</label>
                        <input type="text" id="event-name" name="name" value={editedEvent.name} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div>
                        <label htmlFor="event-type" className="block text-sm font-medium">Event Type</label>
                        <select id="event-type" name="type" value={editedEvent.type} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                            {eventTypes.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="event-description" className="block text-sm font-medium">Description</label>
                        <EnrichableTextarea
                            name="description"
                            value={editedEvent.description}
                            onChange={handleChange}
                            rows={3}
                            context="A brief summary of a global timeline event in a project management tool."
                            onEnrich={handleEnrich}
                            model={settings.aiSettings.enrichmentModel}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="start-date" className="block text-sm font-medium">Start Date</label>
                            <input type="date" id="start-date" name="startDate" value={editedEvent.startDate} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                        <div>
                            <label htmlFor="end-date" className="block text-sm font-medium">End Date (Optional)</label>
                            <input type="date" id="end-date" name="endDate" value={editedEvent.endDate} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end p-4 bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700 space-x-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md font-semibold">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-[color:var(--color-primary)] text-white rounded-md font-semibold">
                        <Save size={16} className="inline mr-2" /> Save Event
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventModal;

import React, { useState, useEffect } from 'react';
import type { Project } from '../../types';
import { X, CopyCheck, FolderGit2, AlertTriangle, ListTodo, ShieldAlert } from 'lucide-react';

interface CloneOptions {
    risks: boolean;
    tasks: boolean;
    actions: boolean;
}

interface CloneProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (newName: string, options: CloneOptions) => void;
    projectToClone: Project;
}

const CloneProjectModal: React.FC<CloneProjectModalProps> = ({ isOpen, onClose, onConfirm, projectToClone }) => {
    const [newName, setNewName] = useState('');
    const [options, setOptions] = useState<CloneOptions>({
        risks: true,
        tasks: true,
        actions: true,
    });

    useEffect(() => {
        if (projectToClone) {
            setNewName(`${projectToClone.name} (Copy)`);
            // Reset options on new project
            setOptions({
                risks: true,
                tasks: true,
                actions: true,
            });
        }
    }, [projectToClone]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (newName.trim()) {
            onConfirm(newName, options);
        }
    };
    
    const CheckboxOption: React.FC<{
        id: keyof CloneOptions;
        label: string;
        checked: boolean;
        onChange: (id: keyof CloneOptions, checked: boolean) => void;
        icon: React.ElementType;
    }> = ({ id, label, checked, onChange, icon: Icon }) => (
        <label htmlFor={`clone-${id}`} className="flex items-center p-3 rounded-md bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">
            <input
                type="checkbox"
                id={`clone-${id}`}
                checked={checked}
                onChange={(e) => onChange(id, e.target.checked)}
                className="h-5 w-5 rounded border-gray-300 text-[color:var(--color-primary)] focus:ring-[color:var(--color-primary)]"
            />
            <Icon className="w-5 h-5 mx-3 text-gray-500 dark:text-gray-400" />
            <span className="font-medium text-gray-700 dark:text-gray-200">{label}</span>
        </label>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg m-4">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <div className="flex items-center">
                        <FolderGit2 className="w-6 h-6 mr-3 text-[color:var(--color-primary)]" />
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Clone Project</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-300">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-6 space-y-6">
                    <div>
                        <label htmlFor="new-project-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            New Project Name
                        </label>
                        <input
                            type="text"
                            id="new-project-name"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[color:var(--color-primary)] focus:border-[color:var(--color-primary)] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        />
                    </div>
                     <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select data to clone:</h4>
                        <div className="space-y-3">
                            <CheckboxOption id="risks" label={`Risks (${projectToClone.risks.length})`} checked={options.risks} onChange={(id, checked) => setOptions(prev => ({...prev, [id]: checked}))} icon={ShieldAlert} />
                            <CheckboxOption id="tasks" label={`Tasks (${projectToClone.tasks.length})`} checked={options.tasks} onChange={(id, checked) => setOptions(prev => ({...prev, [id]: checked}))} icon={ListTodo} />
                            <CheckboxOption id="actions" label={`Actions (${projectToClone.actions.length})`} checked={options.actions} onChange={(id, checked) => setOptions(prev => ({...prev, [id]: checked}))} icon={AlertTriangle} />
                        </div>
                    </div>
                </div>
                <div className="flex justify-end p-4 bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700 space-x-3 rounded-b-lg">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md font-semibold hover:bg-gray-300 dark:hover:bg-gray-500"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!newName.trim()}
                        className="flex items-center px-4 py-2 bg-[color:var(--color-primary)] text-white rounded-md font-semibold hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        <CopyCheck size={16} className="mr-2" />
                        Confirm Clone
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CloneProjectModal;
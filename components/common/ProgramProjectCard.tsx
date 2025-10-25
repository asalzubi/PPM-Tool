import React from 'react';
import type { Project } from '../../types';

const statusColorMap = {
    Green: 'border-[var(--color-success)]',
    Amber: 'border-[var(--color-warning)]',
    Red: 'border-[var(--color-danger)]',
};

const priorityColorMap = {
    'Low': 'bg-blue-100 text-blue-800',
    'Medium': 'bg-yellow-100 text-yellow-800',
    'High': 'bg-orange-100 text-orange-800',
    'Critical': 'bg-red-100 text-red-800',
};

interface ProgramProjectCardProps {
    project: Project;
}

const ProgramProjectCard: React.FC<ProgramProjectCardProps> = ({ project }) => {
    return (
        <div className={`bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border-l-4 ${statusColorMap[project.status]} mb-4`}>
            <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-2">{project.name}</h4>
            
            <div className="flex justify-between items-center mb-2">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${priorityColorMap[project.priority]}`}>
                    {project.priority}
                </span>
                 <span className="text-xs text-gray-500 dark:text-gray-400">
                    {project.completionPercentage}%
                </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                <div 
                    className="bg-[var(--color-primary)] h-1.5 rounded-full" 
                    style={{ width: `${project.completionPercentage}%` }}
                ></div>
            </div>
        </div>
    );
};

export default ProgramProjectCard;

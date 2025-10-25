
import React, { useState } from 'react';
import type { AppSettings } from '../../types';
import { Database, Table, Code } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

type TableName = 'Projects' | 'Users' | 'Settings' | 'Timeline Events';

const schemas: Record<TableName, { field: string; type: string; description: string }[]> = {
    'Projects': [
        { field: 'id', type: 'number', description: 'Unique identifier for the project' },
        { field: 'name', type: 'string', description: 'Name of the project' },
        { field: 'description', type: 'string', description: 'A brief description of the project' },
        { field: 'stage', type: 'string', description: 'Current stage (e.g., Planning, Development)' },
        { field: 'priority', type: 'string', description: 'Priority level (e.g., Low, High, Critical)' },
        { field: 'completionPercentage', type: 'number', description: 'Percentage of project completion' },
        { field: 'status', type: 'string', description: 'RAG status (Green, Amber, Red)' },
    ],
    'Users': [
        { field: 'id', type: 'number', description: 'Unique identifier for the user' },
        { field: 'username', type: 'string', description: 'Login username' },
        { field: 'email', type: 'string', description: 'User\'s email address' },
        { field: 'role', type: 'string', description: 'User role (Admin or User)' },
        { field: 'status', type: 'string', description: 'User status (Active or Disabled)' },
        { field: 'createdAt', type: 'string', description: 'Date of user creation' },
    ],
    'Settings': [
        { field: 'appName', type: 'string', description: 'The name of the application' },
        { field: 'colorPrimary', type: 'string', description: 'Primary theme color (hex)' },
        { field: 'riskScoring', type: 'object', description: 'Configuration for risk scoring logic' },
    ],
    'Timeline Events': [
        { field: 'id', type: 'number', description: 'Unique identifier for the event' },
        { field: 'name', type: 'string', description: 'Name of the timeline event' },
        { field: 'type', type: 'string', description: 'Type of event (Milestone, Freeze, etc.)' },
        { field: 'startDate', type: 'string', description: 'Start date of the event' },
    ],
};


const DatabaseManagement: React.FC = () => {
    const { allProjects, users, settings, timelineEvents } = useAppContext();
    const [selectedTable, setSelectedTable] = useState<TableName>('Projects');

    const dataMap: Record<TableName, any> = {
        'Projects': allProjects,
        'Users': users,
        'Settings': settings,
        'Timeline Events': timelineEvents,
    };

    const tableNames = Object.keys(schemas) as TableName[];

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Database Inspector</h3>
            <p className="text-sm text-gray-500 mb-6">
                This is a read-only inspector for viewing the application's data structures and the current mock data.
            </p>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar with table names */}
                <div className="md:w-1/4">
                    <h4 className="font-semibold mb-2 flex items-center">
                        <Database size={16} className="mr-2" /> Data Models
                    </h4>
                    <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible">
                        {tableNames.map(name => (
                            <button
                                key={name}
                                onClick={() => setSelectedTable(name)}
                                className={`w-full text-left p-2 rounded-md mb-1 text-sm whitespace-nowrap ${selectedTable === name ? 'bg-[color:var(--color-primary)] text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                            >
                                {name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main content area */}
                <div className="md:w-3/4">
                    {/* Schema View */}
                    <div>
                        <h4 className="font-semibold mb-2 flex items-center">
                            <Table size={16} className="mr-2" /> Schema: {selectedTable}
                        </h4>
                        <div className="overflow-x-auto border rounded-lg dark:border-gray-700">
                             <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-900/50">
                                    <tr>
                                        <th className="p-2 font-semibold">Field</th>
                                        <th className="p-2 font-semibold">Type</th>
                                        <th className="p-2 font-semibold">Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {schemas[selectedTable].map(fieldInfo => (
                                        <tr key={fieldInfo.field} className="border-t dark:border-gray-700">
                                            <td className="p-2 font-mono">{fieldInfo.field}</td>
                                            <td className="p-2 text-purple-600 dark:text-purple-400">{fieldInfo.type}</td>
                                            <td className="p-2 text-gray-600 dark:text-gray-400">{fieldInfo.description}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Data View */}
                    <div className="mt-6">
                        <h4 className="font-semibold mb-2 flex items-center">
                           <Code size={16} className="mr-2" /> Live Data (Read-only)
                        </h4>
                         <div className="bg-gray-900 text-white p-4 rounded-lg text-xs overflow-x-auto max-h-96">
                            <pre><code>{JSON.stringify(dataMap[selectedTable], null, 2)}</code></pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DatabaseManagement;

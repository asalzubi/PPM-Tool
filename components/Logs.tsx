
import React, { useState, useMemo } from 'react';
import type { LogEntry, LogAction } from '../types';
import { History, Filter, Search } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const actionTypes: LogAction[] = ['Project Updated', 'Project Added', 'Email Sent', 'Slides Exported', 'Settings Updated', 'Data Imported', 'Data Cleared', 'User Logged In', 'User Logged Out'];

const Logs: React.FC = () => {
    const { logs } = useAppContext();
    const [filterAction, setFilterAction] = useState<string>('All');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const actionMatch = filterAction === 'All' || log.action === filterAction;
            const searchMatch = searchTerm === '' || 
                                log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                log.user.toLowerCase().includes(searchTerm.toLowerCase());
            return actionMatch && searchMatch;
        });
    }, [logs, filterAction, searchTerm]);

    const formatTimestamp = (isoString: string) => {
        return new Date(isoString).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
    };
    
    const ActionBadge: React.FC<{ action: LogAction }> = ({ action }) => {
        const colorMap: { [key in LogAction]?: string } = {
            'Project Added': 'bg-green-100 text-green-800',
            'Project Updated': 'bg-blue-100 text-blue-800',
            'Data Cleared': 'bg-red-100 text-red-800',
            'Email Sent': 'bg-purple-100 text-purple-800',
            'Slides Exported': 'bg-indigo-100 text-indigo-800',
            'Settings Updated': 'bg-yellow-100 text-yellow-800',
            'User Logged In': 'bg-sky-100 text-sky-800',
            'User Logged Out': 'bg-gray-100 text-gray-800',
            'Data Imported': 'bg-teal-100 text-teal-800',
        };
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colorMap[action] || 'bg-gray-100 text-gray-800'}`}>{action}</span>;
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center"><History className="mr-3"/> Audit Logs</h2>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex-grow flex items-center relative">
                        <Search className="absolute left-3 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search details or user..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full max-w-sm p-2 pl-10 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                    <div className="flex items-center">
                        <Filter className="w-5 h-5 mr-2 text-gray-500" />
                        <select
                            value={filterAction}
                            onChange={(e) => setFilterAction(e.target.value)}
                            className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                        >
                            <option value="All">All Actions</option>
                            {actionTypes.map(action => (
                                <option key={action} value={action}>{action}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th className="p-3 font-semibold">Timestamp</th>
                                <th className="p-3 font-semibold">User</th>
                                <th className="p-3 font-semibold">Action</th>
                                <th className="p-3 font-semibold">Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.map(log => (
                                <tr key={log.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="p-3 whitespace-nowrap text-gray-500 dark:text-gray-400">{formatTimestamp(log.timestamp)}</td>
                                    <td className="p-3 font-medium">{log.user}</td>
                                    <td className="p-3"><ActionBadge action={log.action} /></td>
                                    <td className="p-3 text-gray-600 dark:text-gray-300">{log.details}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 {filteredLogs.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        <p>No log entries found for the current filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Logs;

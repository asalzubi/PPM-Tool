import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import type { Stakeholder } from '../types';
import { PlusCircle, Users, Edit, Trash2, X, Save } from 'lucide-react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Label } from 'recharts';
import ConfirmationModal from './common/ConfirmationModal';

const engagementColors: { [key in Stakeholder['engagementLevel']]: string } = {
    'Supportive': '#22c55e', // green-500
    'Leading': '#3b82f6', // blue-500
    'Neutral': '#6b7280', // gray-500
    'Resistant': '#f97316', // orange-500
    'Unaware': '#a855f7', // purple-500
};

const levelToNumber = (level: 'Low' | 'Medium' | 'High') => {
    if (level === 'Low') return 1;
    if (level === 'Medium') return 2;
    if (level === 'High') return 3;
    return 0;
};

const StakeholderModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (stakeholder: Stakeholder) => void;
    stakeholder: Stakeholder | null;
}> = ({ isOpen, onClose, onSave, stakeholder }) => {
    const { allProjects } = useAppContext();
    const [edited, setEdited] = useState<Omit<Stakeholder, 'id'>>(() => stakeholder ? { ...stakeholder } : {
        name: '', role: '', projectId: allProjects[0]?.id || 0, engagementLevel: 'Neutral',
        influence: 'Medium', interest: 'Medium', communicationPlan: ''
    });

    if (!isOpen) return null;
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEdited(prev => ({ ...prev, [name]: name === 'projectId' ? Number(value) : value }));
    };

    const handleSave = () => {
        const newStakeholder: Stakeholder = {
            id: stakeholder?.id || Date.now(),
            ...edited
        };
        onSave(newStakeholder);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg m-4">
                 <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold">{stakeholder ? 'Edit' : 'Add'} Stakeholder</h2>
                    <button onClick={onClose}><X /></button>
                </div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    {/* Form fields */}
                    <input name="name" value={edited.name} onChange={handleChange} placeholder="Name" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    <input name="role" value={edited.role} onChange={handleChange} placeholder="Role" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    <select name="projectId" value={edited.projectId} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                        {allProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <div className="grid grid-cols-3 gap-4">
                        <select name="engagementLevel" value={edited.engagementLevel} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                            <option>Supportive</option><option>Leading</option><option>Neutral</option><option>Resistant</option><option>Unaware</option>
                        </select>
                        <select name="influence" value={edited.influence} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                            <option>High</option><option>Medium</option><option>Low</option>
                        </select>
                        <select name="interest" value={edited.interest} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                            <option>High</option><option>Medium</option><option>Low</option>
                        </select>
                    </div>
                    <textarea name="communicationPlan" value={edited.communicationPlan} onChange={handleChange} placeholder="Communication Plan" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" rows={3}></textarea>
                </div>
                <div className="flex justify-end p-4 bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700">
                    <button onClick={onClose} className="px-4 py-2 mr-2 bg-gray-200 dark:bg-gray-600 rounded">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded flex items-center"><Save size={16} className="mr-2"/> Save</button>
                </div>
            </div>
        </div>
    );
};

const Quadrant: React.FC<{title: string, description: string}> = ({title, description}) => (
    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg flex flex-col items-center justify-center p-2 text-center text-gray-700 dark:text-gray-300">
        <h4 className="font-bold text-sm tracking-wider">{title}</h4>
        <p className="text-xs mt-1">{description}</p>
    </div>
);

const StakeholderManagement: React.FC = () => {
    const { stakeholders, allProjects, saveStakeholder, deleteStakeholder } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selected, setSelected] = useState<Stakeholder | null>(null);
    const [toDelete, setToDelete] = useState<Stakeholder | null>(null);
    const [projectFilter, setProjectFilter] = useState('All');

    const filteredStakeholders = useMemo(() => {
        if (projectFilter === 'All') return stakeholders;
        return stakeholders.filter(s => s.projectId === Number(projectFilter));
    }, [stakeholders, projectFilter]);

    const chartData = useMemo(() => (
        Object.entries(engagementColors).map(([level, color]) => ({
            name: level,
            color,
            data: filteredStakeholders
                .filter(s => s.engagementLevel === level)
                .map(s => ({
                    x: levelToNumber(s.interest),
                    y: levelToNumber(s.influence),
                    z: s.name, // for tooltip
                    role: s.role
                }))
        }))
    ), [filteredStakeholders]);

    const handleAdd = () => {
        setSelected(null);
        setIsModalOpen(true);
    };

    const handleEdit = (stakeholder: Stakeholder) => {
        setSelected(stakeholder);
        setIsModalOpen(true);
    };
    
    const handleSave = (stakeholder: Stakeholder) => {
        saveStakeholder(stakeholder);
        setIsModalOpen(false);
    };
    
    const handleDeleteConfirm = () => {
        if(toDelete) {
            deleteStakeholder(toDelete.id);
            setToDelete(null);
        }
    }
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center"><Users className="mr-3" /> Stakeholder Management</h2>
                <button onClick={handleAdd} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    <PlusCircle size={18} className="mr-2" /> Add Stakeholder
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                 <h3 className="text-lg font-semibold mb-4 text-center">Stakeholder Engagement Strategy</h3>
                 <div className="relative h-[400px]">
                    {/* Quadrant Backgrounds */}
                    <div className="absolute inset-x-0 inset-y-12 grid grid-cols-2 grid-rows-2 gap-2 text-gray-700 dark:text-gray-300">
                        <Quadrant title="KEEP SATISFIED" description="Meet their needs. Handle with care." />
                        <Quadrant title="MANAGE CLOSELY" description="Your top priority stakeholders." />
                        <Quadrant title="MONITOR" description="Update when required only." />
                        <Quadrant title="KEEP INFORMED" description="Likely to have low participation levels." />
                    </div>
                    {/* Axes */}
                    <div className="absolute inset-0 flex flex-col items-center justify-between p-2 pointer-events-none text-purple-600 dark:text-purple-300 font-bold">
                        <span>High Influence</span>
                        <div className="w-px h-full bg-purple-400 dark:bg-purple-500 relative">
                            <div className="absolute -top-1 -left-1.5 border-t-8 border-x-4 border-x-transparent border-t-purple-400 dark:border-t-purple-500"></div>
                            <div className="absolute -bottom-1 -left-1.5 border-b-8 border-x-4 border-x-transparent border-b-purple-400 dark:border-b-purple-500"></div>
                        </div>
                        <span>Low Influence</span>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-between p-2 pointer-events-none text-purple-600 dark:text-purple-300 font-bold">
                        <span className="transform -rotate-90">Low Interest</span>
                        <div className="h-px w-full bg-purple-400 dark:bg-purple-500 relative">
                             <div className="absolute -right-1 -top-1.5 border-r-8 border-y-4 border-y-transparent border-r-purple-400 dark:border-r-purple-500"></div>
                             <div className="absolute -left-1 -top-1.5 border-l-8 border-y-4 border-y-transparent border-l-purple-400 dark:border-l-purple-500"></div>
                        </div>
                        <span className="transform -rotate-90">High Interest</span>
                    </div>

                    <div className="absolute inset-0 z-10">
                        <ResponsiveContainer width="100%" height="100%">
                             <ScatterChart margin={{ top: 40, right: 40, bottom: 40, left: 40 }}>
                                <XAxis type="number" dataKey="x" name="Interest" domain={[0.5, 3.5]} tick={false} axisLine={false} />
                                <YAxis type="number" dataKey="y" name="Influence" domain={[0.5, 3.5]} tick={false} axisLine={false} />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        return <div className="bg-white dark:bg-gray-800 p-2 border rounded shadow-lg">
                                            <p className="font-bold">{data.z}</p>
                                            <p className="text-sm">{data.role}</p>
                                        </div>
                                    }
                                    return null;
                                }} />
                                <Legend />
                                {chartData.map(series => <Scatter key={series.name} name={series.name} data={series.data} fill={series.color} /> )}
                            </ScatterChart>
                         </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="p-4 border-b dark:border-gray-700">
                    <h3 className="text-lg font-semibold mb-2">Stakeholder List</h3>
                    <label htmlFor="project-filter" className="text-sm font-medium">Filter by Project:</label>
                    <select id="project-filter" value={projectFilter} onChange={e => setProjectFilter(e.target.value)} className="w-full md:w-1/3 p-2 mt-1 border rounded dark:bg-gray-700 dark:border-gray-600">
                         <option value="All">All Projects</option>
                         {allProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                     </select>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                {['Name', 'Role', 'Project', 'Engagement', 'Influence', 'Interest', 'Actions'].map(h => <th key={h} className="p-3 font-semibold">{h}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStakeholders.map(s => (
                                <tr key={s.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="p-3 font-medium">{s.name}</td>
                                    <td className="p-3">{s.role}</td>
                                    <td className="p-3">{allProjects.find(p=>p.id === s.projectId)?.name}</td>
                                    <td className="p-3"><span className="font-semibold" style={{color: engagementColors[s.engagementLevel]}}>{s.engagementLevel}</span></td>
                                    <td className="p-3">{s.influence}</td>
                                    <td className="p-3">{s.interest}</td>
                                    <td className="p-3">
                                        <button onClick={() => handleEdit(s)} className="p-1 text-gray-500 hover:text-blue-500"><Edit size={16}/></button>
                                        <button onClick={() => setToDelete(s)} className="p-1 text-gray-500 hover:text-red-500"><Trash2 size={16}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {isModalOpen && <StakeholderModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} stakeholder={selected} />}
            {toDelete && <ConfirmationModal isOpen={!!toDelete} onClose={() => setToDelete(null)} onConfirm={handleDeleteConfirm} title="Delete Stakeholder" message={`Are you sure you want to delete ${toDelete.name}?`} />}
        </div>
    );
};

export default StakeholderManagement;
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import type { WeeklyTask } from '../types';
import { ListTodo, Plus, ChevronLeft, ChevronRight, CheckCircle, ArrowRightCircle, AlertCircle } from 'lucide-react';

const getMonday = (d: Date): Date => {
    const date = new Date(d);
    date.setHours(0, 0, 0, 0);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
};

const getMondaysOfMonth = (year: number, month: number): Date[] => {
    const mondays: Date[] = [];
    const d = new Date(year, month, 1);
    
    let dayOfWeek = d.getDay();
    if (dayOfWeek === 0) dayOfWeek = 7; // Sunday is 0, make it 7
    if (dayOfWeek !== 1) { // If not Monday
        d.setDate(d.getDate() + (1 - dayOfWeek));
    }
    
    // If first Monday is in the previous month, start from there.
    if(d.getMonth() !== month) d.setDate(d.getDate() + 7);

    while (d.getMonth() === month) {
        mondays.push(new Date(d));
        d.setDate(d.getDate() + 7);
    }
    return mondays;
};

const statusConfig: { [key in WeeklyTask['status']]: { icon: React.ElementType, color: string } } = {
    'To Do': { icon: ArrowRightCircle, color: 'text-gray-500' },
    'In Progress': { icon: ArrowRightCircle, color: 'text-blue-500 animate-pulse' },
    'Done': { icon: CheckCircle, color: 'text-green-500' },
    'Blocked': { icon: AlertCircle, color: 'text-red-500' },
};

const MiniCalendar: React.FC<{
    viewDate: Date;
    setViewDate: (date: Date) => void;
    viewYear: number;
    viewMonth: number;
}> = ({ viewDate, setViewDate, viewYear, viewMonth }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const calendarGrid = useMemo(() => {
        const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
        const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
        
        const grid: (Date | null)[] = [];
        const dayOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

        for (let i = 0; i < dayOffset; i++) {
            grid.push(null);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            grid.push(new Date(viewYear, viewMonth, i));
        }
        
        return grid;
    }, [viewYear, viewMonth]);

    const selectedWeekStart = getMonday(viewDate).getTime();
    const selectedWeekEnd = new Date(selectedWeekStart + 6 * 24 * 60 * 60 * 1000).getTime();

    const handleDayClick = (day: Date) => {
        setViewDate(getMonday(day));
    };

    const dayNames = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
    
    const getDayCellClass = (day: Date | null): string => {
        if (!day) return '';
        const dayTime = day.getTime();
        const isToday = dayTime === today.getTime();
        const isSelectedWeek = dayTime >= selectedWeekStart && dayTime <= selectedWeekEnd;

        let baseClasses = 'p-2 rounded-full cursor-pointer transition-colors text-sm flex items-center justify-center h-8 w-8 mx-auto';

        if (isToday && isSelectedWeek) {
            return `${baseClasses} bg-blue-500 text-white font-bold`;
        }
        if (isSelectedWeek) {
            return `${baseClasses} bg-blue-200 dark:bg-blue-800`;
        }
        if (isToday) {
            return `${baseClasses} font-bold ring-2 ring-blue-500`;
        }
        return `${baseClasses} hover:bg-gray-200 dark:hover:bg-gray-700`;
    };

    return (
        <div>
             <h3 className="font-semibold mb-2 text-center">{new Date(viewYear, viewMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {dayNames.map(day => <div key={day} className="font-bold text-gray-500 dark:text-gray-400">{day}</div>)}
                {calendarGrid.map((day, index) => (
                    <div key={day ? day.toISOString() : `empty-${index}`} className="h-10 flex items-center justify-center">
                        {day ? (
                            <div className={getDayCellClass(day)} onClick={() => handleDayClick(day)}>
                                {day.getDate()}
                            </div>
                        ) : <div></div>}
                    </div>
                ))}
            </div>
        </div>
    );
};


const WeeklyPlan: React.FC = () => {
    const { weeklyTasks, allProjects, currentUser, saveWeeklyTask } = useAppContext();
    const [viewDate, setViewDate] = useState(getMonday(new Date()));

    const [newTask, setNewTask] = useState({ description: '', priority: 'Medium' as WeeklyTask['priority'], projectId: undefined as number | undefined });

    const viewYear = viewDate.getFullYear();
    const viewMonth = viewDate.getMonth();

    const weeksInMonth = useMemo(() => getMondaysOfMonth(viewYear, viewMonth), [viewYear, viewMonth]);
    
    const lastMonday = useMemo(() => new Date(viewDate.getTime() - 7 * 24 * 60 * 60 * 1000), [viewDate]);
    const currentMondayStr = viewDate.toISOString().split('T')[0];
    const lastMondayStr = lastMonday.toISOString().split('T')[0];

    const { lastWeekTasks, thisWeekTasks } = useMemo(() => {
        if (!currentUser) return { lastWeekTasks: [], thisWeekTasks: [] };
        const userTasks = weeklyTasks.filter(t => t.ownerId === currentUser.id);
        return {
            lastWeekTasks: userTasks.filter(t => t.weekStartDate === lastMondayStr),
            thisWeekTasks: userTasks.filter(t => t.weekStartDate === currentMondayStr),
        };
    }, [weeklyTasks, currentUser, lastMondayStr, currentMondayStr]);

    const lastWeekStats = useMemo(() => {
        const total = lastWeekTasks.length;
        if (total === 0) return 'No tasks last week.';
        const done = lastWeekTasks.filter(t => t.status === 'Done').length;
        return `${done} of ${total} tasks completed (${Math.round((done/total)*100)}%)`;
    }, [lastWeekTasks]);

    const handleAddTask = () => {
        if (!newTask.description.trim() || !currentUser) return;
        const task: WeeklyTask = {
            id: Date.now(),
            ...newTask,
            weekStartDate: currentMondayStr,
            status: 'To Do',
            ownerId: currentUser.id
        };
        saveWeeklyTask(task);
        setNewTask({ description: '', priority: 'Medium', projectId: undefined });
    };

    const handleStatusChange = (task: WeeklyTask, status: WeeklyTask['status']) => {
        saveWeeklyTask({ ...task, status });
    };
    
    const handleDateChange = (year: number, month: number, day?: number) => {
        const newDate = new Date(year, month, day || 1);
        setViewDate(getMonday(newDate));
    };
    
    const years = Array.from({length: 2040 - 2020 + 1}, (_, i) => 2020 + i);
    const months = Array.from({length: 12}, (_, i) => ({ value: i, name: new Date(0, i).toLocaleString('en-US', { month: 'long' })}));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center"><ListTodo className="mr-3" /> Weekly Plan</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    {/* Left side: Date selectors & Navigation */}
                    <div className="md:col-span-1 space-y-4">
                        <div>
                            <label htmlFor="year-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">Year</label>
                            <select id="year-select" value={viewYear} onChange={(e) => handleDateChange(parseInt(e.target.value), viewMonth)} className="w-full mt-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="month-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">Month</label>
                            <select id="month-select" value={viewMonth} onChange={(e) => handleDateChange(viewYear, parseInt(e.target.value))} className="w-full mt-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                                {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="week-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">Week</label>
                            <select id="week-select" value={viewDate.toISOString()} onChange={(e) => setViewDate(new Date(e.target.value))} className="w-full mt-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                                {weeksInMonth.map(monday => (
                                    <option key={monday.toISOString()} value={monday.toISOString()}>
                                        Week of {monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
                            <button onClick={() => setViewDate(d => getMonday(new Date(d.setDate(d.getDate() - 7))))} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md"><ChevronLeft/></button>
                            <span className="font-semibold text-center">Navigate Weeks</span>
                            <button onClick={() => setViewDate(d => getMonday(new Date(d.setDate(d.getDate() + 7))))} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md"><ChevronRight/></button>
                        </div>
                    </div>
                    
                    {/* Right side: Mini Calendar */}
                    <div className="md:col-span-1">
                        <MiniCalendar
                            viewDate={viewDate}
                            setViewDate={setViewDate}
                            viewYear={viewYear}
                            viewMonth={viewMonth}
                        />
                    </div>
                </div>

                {/* Last Week */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-1">Last Week's Review</h3>
                    <p className="text-sm text-gray-500 mb-4">{lastWeekStats}</p>
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                        {lastWeekTasks.map(task => <TaskItem key={task.id} task={task} projects={allProjects} onStatusChange={handleStatusChange} />)}
                    </div>
                </div>
            </div>

            {/* This Week */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                 <h3 className="text-lg font-semibold mb-4">Plan for week of {viewDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric'})}</h3>
                 {/* Add task form */}
                 <div className="flex flex-wrap gap-2 mb-4 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                     <input
                        type="text"
                        value={newTask.description}
                        onChange={(e) => setNewTask(p => ({...p, description: e.target.value}))}
                        placeholder="Add a new task for this week..."
                        className="flex-grow p-2 border rounded dark:bg-gray-700 dark:border-gray-600 min-w-[200px]"
                     />
                     <button onClick={handleAddTask} className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"><Plus/></button>
                 </div>
                 <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                     {thisWeekTasks.map(task => <TaskItem key={task.id} task={task} projects={allProjects} onStatusChange={handleStatusChange} />)}
                 </div>
            </div>
        </div>
    );
};

const TaskItem: React.FC<{ task: WeeklyTask, projects: any[], onStatusChange: (t: WeeklyTask, s: WeeklyTask['status']) => void }> = ({ task, projects, onStatusChange }) => {
    const project = task.projectId ? projects.find(p => p.id === task.projectId) : null;
    const { icon: Icon, color } = statusConfig[task.status];
    
    return (
        <div className="p-2 rounded-md border-l-4" style={{borderColor: project?.status === 'Red' ? 'var(--color-danger)' : project?.status === 'Amber' ? 'var(--color-warning)' : 'var(--color-primary)'}}>
            <div className="flex justify-between items-center">
                <p className="font-medium">{task.description}</p>
                <select value={task.status} onChange={e => onStatusChange(task, e.target.value as WeeklyTask['status'])} className="text-sm border-none bg-transparent dark:bg-gray-800 rounded focus:ring-0">
                    {Object.keys(statusConfig).map(s => <option key={s}>{s}</option>)}
                </select>
            </div>
            <div className="flex items-center text-xs text-gray-500 mt-1 gap-2">
                <Icon size={14} className={color} />
                <span>{task.priority} Priority</span>
                {project && <span>| <strong>{project.name}</strong></span>}
            </div>
        </div>
    );
}

export default WeeklyPlan;
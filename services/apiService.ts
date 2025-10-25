import { mockAppSettings } from '../data/mockData';
import type { Project, User, AppSettings, TimelineEvent, LogEntry, LogAction, Stakeholder, WeeklyTask } from '../types';
import * as db from './dbService';

const LATENCY = 200; // ms

// Helper to simulate network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- PROJECTS API ---
export const fetchProjects = async (): Promise<Project[]> => {
    await delay(LATENCY);
    return db.getAll<Project>('projects');
};

export const saveProject = async (project: Project): Promise<Project> => {
    await delay(LATENCY);
    await db.put<Project>('projects', project);
    return project;
};

export const removeProject = async (projectId: number): Promise<number> => {
    await delay(LATENCY);
    await db.remove('projects', projectId);
    return projectId;
};

// --- USERS API ---
export const fetchUsers = async (): Promise<User[]> => {
    await delay(LATENCY);
    return db.getAll<User>('users');
};

export const saveUser = async (user: User): Promise<User> => {
    await delay(LATENCY);
    await db.put<User>('users', user);
    return user;
};

export const authenticate = async (username: string, pass: string): Promise<User | null> => {
    await delay(LATENCY + 200);
    const users = await db.getAll<User>('users');
    const foundUser = users.find(u => u.username === username && u.password === pass && u.status === 'Active');
    if (foundUser) {
        localStorage.setItem('ppm-currentUser', JSON.stringify(foundUser));
        return foundUser;
    }
    return null;
};

export const checkSession = (): User | null => {
    try {
        return JSON.parse(localStorage.getItem('ppm-currentUser') || 'null');
    } catch {
        return null;
    }
};

export const clearSession = () => {
    localStorage.removeItem('ppm-currentUser');
};


// --- SETTINGS API ---
export const fetchSettings = async (): Promise<AppSettings> => {
    await delay(LATENCY);
    // Settings are stored with a fixed key since there's only one settings object
    return await db.get<AppSettings>('settings', 'current') || mockAppSettings;
};

export const saveSettings = async (settings: AppSettings): Promise<AppSettings> => {
    await delay(LATENCY);
    await db.put<AppSettings>('settings', settings, 'current');
    return settings;
};

// --- TIMELINE EVENTS API ---
export const fetchTimelineEvents = async (): Promise<TimelineEvent[]> => {
    await delay(LATENCY);
    return db.getAll<TimelineEvent>('timelineEvents');
};

export const saveTimelineEvent = async (event: TimelineEvent): Promise<TimelineEvent> => {
    await delay(LATENCY);
    await db.put<TimelineEvent>('timelineEvents', event);
    return event;
};

export const removeTimelineEvent = async (eventId: number): Promise<number> => {
    await delay(LATENCY);
    await db.remove('timelineEvents', eventId);
    return eventId;
};

// --- STAKEHOLDERS API ---
export const fetchStakeholders = async (): Promise<Stakeholder[]> => {
    await delay(LATENCY);
    return db.getAll<Stakeholder>('stakeholders');
};

export const saveStakeholder = async (stakeholder: Stakeholder): Promise<Stakeholder> => {
    await delay(LATENCY);
    await db.put<Stakeholder>('stakeholders', stakeholder);
    return stakeholder;
};

export const removeStakeholder = async (stakeholderId: number): Promise<number> => {
    await delay(LATENCY);
    await db.remove('stakeholders', stakeholderId);
    return stakeholderId;
};

// --- WEEKLY TASKS API ---
export const fetchWeeklyTasks = async (): Promise<WeeklyTask[]> => {
    await delay(LATENCY);
    return db.getAll<WeeklyTask>('weeklyTasks');
};

export const saveWeeklyTask = async (task: WeeklyTask): Promise<WeeklyTask> => {
    await delay(LATENCY);
    await db.put<WeeklyTask>('weeklyTasks', task);
    return task;
};

export const removeWeeklyTask = async (taskId: number): Promise<number> => {
    await delay(LATENCY);
    await db.remove('weeklyTasks', taskId);
    return taskId;
};


// --- LOGS API ---
export const fetchLogs = async (): Promise<LogEntry[]> => {
    await delay(LATENCY);
    const logs = await db.getAll<LogEntry>('logs');
    // Sort descending by ID (timestamp)
    return logs.sort((a, b) => b.id - a.id);
};

export const addLog = async (action: LogAction, details: string, user: string): Promise<LogEntry> => {
    await delay(50); // Shorter latency for logging
    const newLog: LogEntry = { id: Date.now(), timestamp: new Date().toISOString(), action, details, user };
    await db.put<LogEntry>('logs', newLog);
    // Efficiently cap the number of log entries in the database
    await db.capStore('logs', 200);
    return newLog;
};

// --- BULK/SYSTEM API ---
export const fetchAllData = async () => {
    await delay(LATENCY + 200);
    return {
        projects: await db.getAll<Project>('projects'),
        settings: await fetchSettings(),
        timelineEvents: await db.getAll<TimelineEvent>('timelineEvents'),
        stakeholders: await db.getAll<Stakeholder>('stakeholders'),
        weeklyTasks: await db.getAll<WeeklyTask>('weeklyTasks'),
        users: await db.getAll<User>('users'),
        logs: await db.getAll<LogEntry>('logs'),
    };
};

export const clearAllData = async () => {
    await delay(LATENCY);
    // This completely deletes the database. It will be re-created and re-seeded on the next app load.
    await db.deleteDatabase();
    clearSession();
};

export const importAllData = async (data: { projects: Project[], settings: AppSettings, timelineEvents: TimelineEvent[], stakeholders: Stakeholder[], weeklyTasks: WeeklyTask[] }) => {
    await delay(LATENCY);
    await db.importAllData(data as any);
};

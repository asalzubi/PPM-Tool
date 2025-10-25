import { mockProjects, mockUsers, mockAppSettings, mockTimelineEvents, mockStakeholders, mockWeeklyTasks } from '../data/mockData';
import type { Project, User, AppSettings, TimelineEvent, LogEntry, LogAction, Stakeholder, WeeklyTask } from '../types';

const LATENCY = 300; // ms

class SimulatedDatabase {
    private static instance: SimulatedDatabase;

    private constructor() {
        this.init('projects', mockProjects);
        this.init('users', mockUsers);
        this.init('settings', mockAppSettings);
        this.init('timelineEvents', mockTimelineEvents);
        this.init('stakeholders', mockStakeholders);
        this.init('weeklyTasks', mockWeeklyTasks);
        this.init('logs', []);
    }

    public static getInstance(): SimulatedDatabase {
        if (!SimulatedDatabase.instance) {
            SimulatedDatabase.instance = new SimulatedDatabase();
        }
        return SimulatedDatabase.instance;
    }

    private init<T>(key: string, mockData: T) {
        if (!localStorage.getItem(`ppm-${key}`)) {
            localStorage.setItem(`ppm-${key}`, JSON.stringify(mockData));
        }
    }

    private read<T>(key: string): T {
        try {
            return JSON.parse(localStorage.getItem(`ppm-${key}`) || 'null') as T;
        } catch (e) {
            console.error(`Failed to read ${key} from localStorage`, e);
            return null as T;
        }
    }

    private write<T>(key: string, data: T) {
        try {
            localStorage.setItem(`ppm-${key}`, JSON.stringify(data));
        } catch (e) {
            console.error(`Failed to write ${key} to localStorage`, e);
        }
    }

    // --- Public API ---

    public getProjects = (): Project[] => this.read<Project[]>('projects') || [];
    public saveProjects = (data: Project[]) => this.write('projects', data);

    public getUsers = (): User[] => this.read<User[]>('users') || [];
    public saveUsers = (data: User[]) => this.write('users', data);
    
    public getSettings = (): AppSettings => this.read<AppSettings>('settings') || mockAppSettings;
    public saveSettings = (data: AppSettings) => this.write('settings', data);

    public getTimelineEvents = (): TimelineEvent[] => this.read<TimelineEvent[]>('timelineEvents') || [];
    public saveTimelineEvents = (data: TimelineEvent[]) => this.write('timelineEvents', data);

    public getStakeholders = (): Stakeholder[] => this.read<Stakeholder[]>('stakeholders') || [];
    public saveStakeholders = (data: Stakeholder[]) => this.write('stakeholders', data);

    public getWeeklyTasks = (): WeeklyTask[] => this.read<WeeklyTask[]>('weeklyTasks') || [];
    public saveWeeklyTasks = (data: WeeklyTask[]) => this.write('weeklyTasks', data);

    public getLogs = (): LogEntry[] => this.read<LogEntry[]>('logs') || [];
    public saveLogs = (data: LogEntry[]) => this.write('logs', data);

    public clearAll = () => {
        localStorage.removeItem('ppm-projects');
        localStorage.removeItem('ppm-users');
        localStorage.removeItem('ppm-settings');
        localStorage.removeItem('ppm-timelineEvents');
        localStorage.removeItem('ppm-stakeholders');
        localStorage.removeItem('ppm-weeklyTasks');
        localStorage.removeItem('ppm-logs');
        localStorage.removeItem('ppm-currentUser');
    };
}

const db = SimulatedDatabase.getInstance();

// Helper to simulate network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- PROJECTS API ---
export const fetchProjects = async (): Promise<Project[]> => {
    await delay(LATENCY);
    return db.getProjects();
};

export const saveProject = async (project: Project): Promise<Project> => {
    await delay(LATENCY);
    let projects = db.getProjects();
    const index = projects.findIndex(p => p.id === project.id);
    if (index > -1) {
        projects[index] = project;
    } else {
        projects.push(project);
    }
    db.saveProjects(projects);
    return project;
};

export const removeProject = async (projectId: number): Promise<number> => {
    await delay(LATENCY);
    let projects = db.getProjects();
    projects = projects.filter(p => p.id !== projectId);
    db.saveProjects(projects);
    return projectId;
};

// --- USERS API ---
export const fetchUsers = async (): Promise<User[]> => {
    await delay(LATENCY);
    return db.getUsers();
};

export const saveUser = async (user: User): Promise<User> => {
    await delay(LATENCY);
    let users = db.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index > -1) {
        users[index] = user;
    }
    db.saveUsers(users);
    return user;
};

export const authenticate = async (username: string, pass: string): Promise<User | null> => {
    await delay(LATENCY + 200);
    const users = db.getUsers();
    const foundUser = users.find(u => u.username === username && u.password === pass);
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
    return db.getSettings();
};

export const saveSettings = async (settings: AppSettings): Promise<AppSettings> => {
    await delay(LATENCY);
    db.saveSettings(settings);
    return settings;
};

// --- TIMELINE EVENTS API ---
export const fetchTimelineEvents = async (): Promise<TimelineEvent[]> => {
    await delay(LATENCY);
    return db.getTimelineEvents();
};

export const saveTimelineEvent = async (event: TimelineEvent): Promise<TimelineEvent> => {
    await delay(LATENCY);
    let events = db.getTimelineEvents();
    const index = events.findIndex(e => e.id === event.id);
    if (index > -1) {
        events[index] = event;
    } else {
        events.push(event);
    }
    db.saveTimelineEvents(events);
    return event;
};

export const removeTimelineEvent = async (eventId: number): Promise<number> => {
    await delay(LATENCY);
    let events = db.getTimelineEvents();
    events = events.filter(e => e.id !== eventId);
    db.saveTimelineEvents(events);
    return eventId;
};

// --- STAKEHOLDERS API ---
export const fetchStakeholders = async (): Promise<Stakeholder[]> => {
    await delay(LATENCY);
    return db.getStakeholders();
};

export const saveStakeholder = async (stakeholder: Stakeholder): Promise<Stakeholder> => {
    await delay(LATENCY);
    let stakeholders = db.getStakeholders();
    const index = stakeholders.findIndex(s => s.id === stakeholder.id);
    if (index > -1) {
        stakeholders[index] = stakeholder;
    } else {
        stakeholders.push(stakeholder);
    }
    db.saveStakeholders(stakeholders);
    return stakeholder;
};

export const removeStakeholder = async (stakeholderId: number): Promise<number> => {
    await delay(LATENCY);
    let stakeholders = db.getStakeholders();
    stakeholders = stakeholders.filter(s => s.id !== stakeholderId);
    db.saveStakeholders(stakeholders);
    return stakeholderId;
};

// --- WEEKLY TASKS API ---
export const fetchWeeklyTasks = async (): Promise<WeeklyTask[]> => {
    await delay(LATENCY);
    return db.getWeeklyTasks();
};

export const saveWeeklyTask = async (task: WeeklyTask): Promise<WeeklyTask> => {
    await delay(LATENCY);
    let tasks = db.getWeeklyTasks();
    const index = tasks.findIndex(t => t.id === task.id);
    if (index > -1) {
        tasks[index] = task;
    } else {
        tasks.push(task);
    }
    db.saveWeeklyTasks(tasks);
    return task;
};

export const removeWeeklyTask = async (taskId: number): Promise<number> => {
    await delay(LATENCY);
    let tasks = db.getWeeklyTasks();
    tasks = tasks.filter(t => t.id !== taskId);
    db.saveWeeklyTasks(tasks);
    return taskId;
};


// --- LOGS API ---
export const fetchLogs = async (): Promise<LogEntry[]> => {
    await delay(LATENCY);
    return db.getLogs();
};

export const addLog = async (action: LogAction, details: string, user: string): Promise<LogEntry> => {
    await delay(50); // Shorter latency for logging
    const newLog: LogEntry = { id: Date.now(), timestamp: new Date().toISOString(), action, details, user };
    let logs = db.getLogs();
    logs = [newLog, ...logs].slice(0, 200); // Keep logs capped
    db.saveLogs(logs);
    return newLog;
};

// --- BULK/SYSTEM API ---
export const fetchAllData = async () => {
    await delay(LATENCY + 200);
    return {
        projects: db.getProjects(),
        settings: db.getSettings(),
        timelineEvents: db.getTimelineEvents(),
        stakeholders: db.getStakeholders(),
        weeklyTasks: db.getWeeklyTasks(),
        users: db.getUsers(),
        logs: db.getLogs(),
    };
};

export const clearAllData = async () => {
    await delay(LATENCY);
    db.clearAll();
};

export const importAllData = async (data: { projects: Project[], settings: AppSettings, timelineEvents: TimelineEvent[], stakeholders: Stakeholder[], weeklyTasks: WeeklyTask[] }) => {
    await delay(LATENCY);
    db.saveProjects(data.projects);
    db.saveSettings(data.settings);
    db.saveTimelineEvents(data.timelineEvents);
    db.saveStakeholders(data.stakeholders);
    db.saveWeeklyTasks(data.weeklyTasks);
};
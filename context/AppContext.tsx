import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/apiService';
import { exportData, importData } from '../services/dataService';
import { emailReport, exportToSlides } from '../services/reportingService';
import type { AppSettings, Project, TimelineEvent, User, LogEntry, LogAction, Stakeholder, WeeklyTask } from '../types';

interface IAppContext {
    // State
    isLoading: boolean;
    isAuthenticated: boolean;
    currentUser: User | null;
    settings: AppSettings;
    allProjects: Project[];
    visibleProjects: Project[];
    timelineEvents: TimelineEvent[];
    stakeholders: Stakeholder[];
    weeklyTasks: WeeklyTask[];
    users: User[];
    logs: LogEntry[];
    isLayoutLocked: boolean;
    
    // Actions
    login: (user: string, pass: string) => Promise<boolean>;
    logout: () => void;
    createLog: (action: LogAction, details: string) => void;
    setProjects: (projects: Project[]) => void;
    updateSettings: (settings: AppSettings) => Promise<void>;
    saveProject: (project: Project) => Promise<void>;
    // FIX: Add updateProject to context for updates without side effects.
    updateProject: (project: Project) => Promise<void>;
    deleteProject: (projectId: number) => Promise<void>;
    updateUser: (user: User) => Promise<void>;
    saveTimelineEvent: (event: TimelineEvent) => Promise<void>;
    deleteTimelineEvent: (eventId: number) => Promise<void>;
    saveStakeholder: (stakeholder: Stakeholder) => Promise<void>;
    deleteStakeholder: (stakeholderId: number) => Promise<void>;
    saveWeeklyTask: (task: WeeklyTask) => Promise<void>;
    deleteWeeklyTask: (taskId: number) => Promise<void>;
    toggleLayoutLock: () => void;
    exportAllData: () => void;
    importAllData: () => void;
    clearAllData: () => void;
    
    // UI State & Modals
    openProjectModal: (project: Project | null) => void;
    isProjectModalOpen: boolean;
    selectedProject: Project | null;
    closeProjectModal: () => void;
    
    openCloneModal: (projectId: number) => void;
    isCloneModalOpen: boolean;
    projectToClone: Project | null;
    closeCloneModal: () => void;
    confirmCloneProject: (newName: string, options: { risks: boolean; tasks: boolean; actions: boolean; }) => void;

    openClearDataModal: () => void;
    isClearDataModalOpen: boolean;
    closeClearDataModal: () => void;
    confirmClearData: () => void;
    
    openProfileModal: () => void;
    isProfileModalOpen: boolean;
    closeProfileModal: () => void;
    
    openEmailModal: () => void;
    isEmailModalOpen: boolean;
    closeEmailModal: () => void;
    emailReportHandler: (email: string) => Promise<void>;

    // Reporting refs
    // FIX: Expose ref values for components to access the DOM elements.
    dashboardSummaryRef: HTMLDivElement | null;
    programViewRef: HTMLDivElement | null;
    timelineEventsRef: HTMLDivElement | null;
    timelineGanttRef: HTMLDivElement | null;
    riskListRef: HTMLDivElement | null;
    setDashboardSummaryRef: React.Dispatch<React.SetStateAction<HTMLDivElement | null>>;
    setProgramViewRef: React.Dispatch<React.SetStateAction<HTMLDivElement | null>>;
    setTimelineEventsRef: React.Dispatch<React.SetStateAction<HTMLDivElement | null>>;
    setTimelineGanttRef: React.Dispatch<React.SetStateAction<HTMLDivElement | null>>;
    setRiskListRef: React.Dispatch<React.SetStateAction<HTMLDivElement | null>>;
    
    // Slide Export
    startSlideExport: () => void;
    isExportingSlides: boolean;
    slideExportStatus: string;
    slidesForExport: { projects: Project[], settings: AppSettings, timelineEvents: TimelineEvent[] } | null;
    onSlidesReadyForExport: (slides: { element: HTMLElement | null; title?: string }[]) => void;
    timelineExportView: 'monthly' | 'quarterly' | 'yearly';
    setTimelineExportView: React.Dispatch<React.SetStateAction<'monthly' | 'quarterly' | 'yearly'>>;
    
    setToast: (toast: {message: string, type: 'success' | 'error'} | null) => void;
}

const AppContext = createContext<IAppContext>(null!);

export const useAppContext = () => useContext(AppContext);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [allProjects, setAllProjects] = useState<Project[]>([]);
    const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
    const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
    const [weeklyTasks, setWeeklyTasks] = useState<WeeklyTask[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isLayoutLocked, setIsLayoutLocked] = useState(true);
    const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const navigate = useNavigate();

    // --- Modal State ---
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
    const [projectToClone, setProjectToClone] = useState<Project | null>(null);
    const [isClearDataModalOpen, setIsClearDataModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

    // --- Reporting State ---
    const [dashboardSummaryRef, setDashboardSummaryRef] = useState<HTMLDivElement | null>(null);
    const [programViewRef, setProgramViewRef] = useState<HTMLDivElement | null>(null);
    const [timelineEventsRef, setTimelineEventsRef] = useState<HTMLDivElement | null>(null);
    const [timelineGanttRef, setTimelineGanttRef] = useState<HTMLDivElement | null>(null);
    const [riskListRef, setRiskListRef] = useState<HTMLDivElement | null>(null);
    const [isExportingSlides, setIsExportingSlides] = useState(false);
    const [slideExportStatus, setSlideExportStatus] = useState('');
    const [slidesForExport, setSlidesForExport] = useState<{ projects: Project[], settings: AppSettings, timelineEvents: TimelineEvent[] } | null>(null);
    const [timelineExportView, setTimelineExportView] = useState<'monthly' | 'quarterly' | 'yearly'>('yearly');


    // Initial data load
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            const user = api.checkSession();
            if (user) {
                const data = await api.fetchAllData();
                setAllProjects(data.projects);
                setSettings(data.settings);
                setTimelineEvents(data.timelineEvents);
                setStakeholders(data.stakeholders);
                setWeeklyTasks(data.weeklyTasks);
                setUsers(data.users);
                setLogs(data.logs);
                setCurrentUser(user);
                setIsAuthenticated(true);
                applyTheme(data.settings);
            }
            setIsLoading(false);
        };
        loadData();
    }, []);

    const applyTheme = (themeSettings: AppSettings) => {
        document.documentElement.style.setProperty('--color-primary', themeSettings.colorPrimary);
    };

    const createLog = useCallback(async (action: LogAction, details: string) => {
        if (!settings || !currentUser) return;
        const logSettings = settings.logSettings;
        const shouldLog = {
            'Project Updated': logSettings.logProjectUpdates, 'Project Added': logSettings.logProjectAdditions,
            'Email Sent': logSettings.logEmailSent, 'Slides Exported': logSettings.logSlidesExported,
        }[action] ?? true;

        if (!shouldLog) return;
        const newLog = await api.addLog(action, details, `${currentUser.firstName} ${currentUser.lastName}`);
        setLogs(prev => [newLog, ...prev]);
    }, [currentUser, settings]);

    const login = async (user: string, pass: string) => {
        const authedUser = await api.authenticate(user, pass);
        if (authedUser) {
            setCurrentUser(authedUser);
            setIsAuthenticated(true);
            await createLog('User Logged In', `${authedUser.firstName} ${authedUser.lastName} logged in.`);
            // Fetch data after login
            const data = await api.fetchAllData();
            setAllProjects(data.projects);
            setSettings(data.settings);
            setTimelineEvents(data.timelineEvents);
            setStakeholders(data.stakeholders);
            setWeeklyTasks(data.weeklyTasks);
            setUsers(data.users);
            setLogs(data.logs);
            applyTheme(data.settings);
            navigate('/');
            return true;
        }
        return false;
    };
    
    const logout = () => {
        createLog('User Logged Out', `${currentUser?.firstName} ${currentUser?.lastName} logged out.`);
        api.clearSession();
        setIsAuthenticated(false);
        setCurrentUser(null);
        navigate('/login');
    };

    const visibleProjects = useMemo(() => {
        if (!currentUser) return [];
        if (currentUser.role === 'Admin' || currentUser.role === 'Developer') return allProjects;
        return allProjects.filter(p => p.ownerId === currentUser.id);
    }, [allProjects, currentUser]);
    
    const updateSettings = async (newSettings: AppSettings) => {
        const updated = await api.saveSettings(newSettings);
        setSettings(updated);
        applyTheme(updated);
    };

    const saveProject = async (project: Project) => {
        const isNew = !allProjects.some(p => p.id === project.id);
        const saved = await api.saveProject(project);
        setAllProjects(prev => isNew ? [...prev, saved] : prev.map(p => p.id === saved.id ? saved : p));
        createLog(isNew ? 'Project Added' : 'Project Updated', `Project '${saved.name}' was ${isNew ? 'created' : 'updated'}.`);
        closeProjectModal();
    };

    const updateProject = async (project: Project) => {
        const isNew = !allProjects.some(p => p.id === project.id);
        const saved = await api.saveProject(project);
        setAllProjects(prev => isNew ? [...prev, saved] : prev.map(p => p.id === saved.id ? saved : p));
        createLog(isNew ? 'Project Added' : 'Project Updated', `Project '${saved.name}' was ${isNew ? 'created' : 'updated'}.`);
    };

    const deleteProject = async (projectId: number) => {
        const projectName = allProjects.find(p => p.id === projectId)?.name || 'Unknown';
        await api.removeProject(projectId);
        setAllProjects(prev => prev.filter(p => p.id !== projectId));
        createLog('Project Updated', `Project '${projectName}' was deleted.`);
    };

    const updateUser = async (user: User) => {
        const saved = await api.saveUser(user);
        setUsers(prev => prev.map(u => u.id === saved.id ? saved : u));
        if (currentUser?.id === saved.id) setCurrentUser(saved);
        createLog('Settings Updated', `User profile for '${saved.firstName} ${saved.lastName}' was updated.`);
    };
    
    const saveTimelineEvent = async (event: TimelineEvent) => {
        const saved = await api.saveTimelineEvent(event);
        setTimelineEvents(prev => prev.some(e => e.id === saved.id) ? prev.map(e => e.id === saved.id ? saved : e) : [...prev, saved]);
    };

    const deleteTimelineEvent = async (eventId: number) => {
        await api.removeTimelineEvent(eventId);
        setTimelineEvents(prev => prev.filter(e => e.id !== eventId));
    };

    const saveStakeholder = async (stakeholder: Stakeholder) => {
        const saved = await api.saveStakeholder(stakeholder);
        setStakeholders(prev => prev.some(s => s.id === saved.id) ? prev.map(s => s.id === saved.id ? saved : s) : [...prev, saved]);
    };

    const deleteStakeholder = async (stakeholderId: number) => {
        await api.removeStakeholder(stakeholderId);
        setStakeholders(prev => prev.filter(s => s.id !== stakeholderId));
    };

    const saveWeeklyTask = async (task: WeeklyTask) => {
        const saved = await api.saveWeeklyTask(task);
        setWeeklyTasks(prev => prev.some(t => t.id === saved.id) ? prev.map(t => t.id === saved.id ? saved : t) : [...prev, saved]);
    };

    const deleteWeeklyTask = async (taskId: number) => {
        await api.removeWeeklyTask(taskId);
        setWeeklyTasks(prev => prev.filter(t => t.id !== taskId));
    };


    const toggleLayoutLock = () => setIsLayoutLocked(p => !p);

    const exportAllData = () => exportData({ projects: allProjects, settings: settings!, timelineEvents, stakeholders, weeklyTasks });
    
    const importAllData = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            const text = await file.text();
            try {
                const data = importData(text);
                if (window.confirm('Importing will overwrite all current data. Continue?')) {
                    await api.importAllData(data);
                    setAllProjects(data.projects);
                    setSettings(data.settings);
                    setTimelineEvents(data.timelineEvents);
                    setStakeholders(data.stakeholders);
                    setWeeklyTasks(data.weeklyTasks);
                    applyTheme(data.settings);
                    createLog('Data Imported', 'Data was imported from a file.');
                    setToast({ message: 'Data imported successfully!', type: 'success' });
                }
            } catch (error) {
                setToast({ message: `Error importing data: ${error instanceof Error ? error.message : 'Unknown'}`, type: 'error' });
            }
        };
        input.click();
    };

    const clearAllData = () => openClearDataModal();
    const confirmClearData = async () => {
        await api.clearAllData();
        createLog('Data Cleared', 'All application data was cleared.');
        closeClearDataModal();
        logout();
        setToast({ message: 'Session ended and all data has been cleared.', type: 'success' });
    };

    const openProjectModal = (project: Project | null) => { setSelectedProject(project); setIsProjectModalOpen(true); };
    const closeProjectModal = () => setIsProjectModalOpen(false);

    const openCloneModal = (projectId: number) => {
        const project = allProjects.find(p => p.id === projectId);
        if (project) { setProjectToClone(project); setIsCloneModalOpen(true); }
    };
    const closeCloneModal = () => setIsCloneModalOpen(false);
    const confirmCloneProject = (newName: string, options: any) => {
        if (!projectToClone) return;
        const clonedProject: Project = { ...JSON.parse(JSON.stringify(projectToClone)), id: Date.now(), name: newName, risks: options.risks ? JSON.parse(JSON.stringify(projectToClone.risks)) : [], tasks: options.tasks ? JSON.parse(JSON.stringify(projectToClone.tasks)) : [], actions: options.actions ? JSON.parse(JSON.stringify(projectToClone.actions)) : [] };
        saveProject(clonedProject);
        closeCloneModal();
    };
    
    const openClearDataModal = () => setIsClearDataModalOpen(true);
    const closeClearDataModal = () => setIsClearDataModalOpen(false);
    
    const openProfileModal = () => setIsProfileModalOpen(true);
    const closeProfileModal = () => setIsProfileModalOpen(false);

    const openEmailModal = () => setIsEmailModalOpen(true);
    const closeEmailModal = () => setIsEmailModalOpen(false);

    const emailReportHandler = async (email: string) => {
        try {
            await emailReport(dashboardSummaryRef, email, 'Dashboard Status Report');
            createLog('Email Sent', `Dashboard report emailed to ${email}.`);
            setToast({ message: `Report sent to ${email}`, type: 'success' });
        } catch (error) {
            setToast({ message: 'Failed to send email report.', type: 'error' });
        } finally {
            closeEmailModal();
        }
    };
    
    const startSlideExport = () => {
        setSlideExportStatus('Preparing slides...');
        setSlidesForExport({ projects: allProjects, settings: settings!, timelineEvents });
        setIsExportingSlides(true);
    };

    const onSlidesReadyForExport = async (hiddenSlides: { element: HTMLElement | null; title?: string }[]) => {
        setSlideExportStatus('Capturing Timeline...');
        setTimelineExportView('quarterly');
    
        await new Promise(resolve => setTimeout(resolve, 300));

        const slidesToExport = [
            ...hiddenSlides,
            { element: dashboardSummaryRef, title: 'Dashboard Summary' },
            { element: programViewRef, title: 'Program View' },
            { element: timelineEventsRef, title: 'Global Timeline Events' },
            { element: timelineGanttRef, title: 'Quarterly Project Timeline' },
            { element: riskListRef, title: 'Risk Register' },
        ];

        setSlideExportStatus('Generating Presentation...');
        await exportToSlides(slidesToExport, 'PPM-Report.pptx');
        createLog('Slides Exported', 'A slide presentation was generated.');
        setToast({ message: 'Slides exported successfully!', type: 'success' });

        setTimelineExportView('yearly');
        setIsExportingSlides(false);
        setSlideExportStatus('');
        setSlidesForExport(null);
    };

    const value = {
        isLoading, isAuthenticated, currentUser, settings: settings!, allProjects, visibleProjects, timelineEvents, stakeholders, weeklyTasks, users, logs, isLayoutLocked,
        login, logout, createLog, setProjects: setAllProjects, updateSettings, saveProject, updateProject, deleteProject, updateUser, saveTimelineEvent, deleteTimelineEvent, saveStakeholder, deleteStakeholder, saveWeeklyTask, deleteWeeklyTask, toggleLayoutLock,
        exportAllData, importAllData, clearAllData,
        openProjectModal, isProjectModalOpen, selectedProject, closeProjectModal,
        openCloneModal, isCloneModalOpen, projectToClone, closeCloneModal, confirmCloneProject,
        openClearDataModal, isClearDataModalOpen, closeClearDataModal, confirmClearData,
        openProfileModal, isProfileModalOpen, closeProfileModal,
        openEmailModal, isEmailModalOpen, closeEmailModal, emailReportHandler,
        dashboardSummaryRef, programViewRef, timelineEventsRef, timelineGanttRef, riskListRef,
        setDashboardSummaryRef, setProgramViewRef, setTimelineEventsRef, setTimelineGanttRef, setRiskListRef,
        startSlideExport, isExportingSlides, slideExportStatus, slidesForExport, onSlidesReadyForExport,
        timelineExportView, setTimelineExportView,
        setToast
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

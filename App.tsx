
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Home, Briefcase, Bot, ShieldAlert, Settings, LayoutDashboard, CalendarDays, Database, Upload, Download, Trash2, Lock, Unlock, LogOut, User as UserIconLucide, Settings2, ArrowRightLeft, ChevronsRight, ChevronsLeft, FileSliders, Mail, KanbanSquare, History, Users, ListTodo } from 'lucide-react';

import Dashboard from './components/Dashboard';
import Projects, { ProjectModal } from './components/Projects';
import AiCenter from './components/AiCenter';
import AdminSettings from './components/AdminSettings';
import Timeline from './components/Timeline';
import ProgramView from './components/ProgramView';
import RiskManagement from './components/RiskManagement';
import StakeholderManagement from './components/StakeholderManagement';
import WeeklyPlan from './components/WeeklyPlan';
import Logs from './components/Logs';
import type { User } from './types';
import CloneProjectModal from './components/common/CloneProjectModal';
import ConfirmationModal from './components/common/ConfirmationModal';
import LoginPage from './components/LoginPage';
import ProfileModal from './components/common/ProfileModal';
import AboutModal from './components/common/AboutModal';
import EmailReportModal from './components/common/EmailReportModal';
import { SlideGenerator } from './components/common/SlideGenerator';
import { AppProvider, useAppContext } from './context/AppContext';
import Spinner from './components/common/Spinner';

const Header: React.FC = () => {
    const { settings, updateSettings, currentUser, openProfileModal } = useAppContext();

    const handleSettingChange = (key: keyof typeof settings, newValue: string) => {
        if (settings) {
            updateSettings({ ...settings, [key]: newValue });
        }
    };

    if (!settings || !currentUser) return null;

    return (
        <header className="m-4 rounded-xl shadow-lg text-white p-4 flex items-center justify-between transition-all duration-300"
            style={{ background: 'linear-gradient(90deg, var(--blue-700), var(--blue-500))' }}
        >
            <div className="flex items-center flex-shrink min-w-0">
                {settings.appLogo && (
                    <div className="bg-white rounded-lg p-2 mr-4 shadow-md flex-shrink-0">
                        <img src={settings.appLogo} alt="Logo" className="h-12 w-auto object-contain" />
                    </div>
                )}
                <div className="min-w-0">
                    <h1 className="text-2xl font-bold truncate block">{settings.headerTitle}</h1>
                    <p className="text-sm opacity-90 truncate block">{settings.headerSubtitle}</p>
                </div>
            </div>
            <div className="flex items-center space-x-4">
                 <button onClick={openProfileModal} className="p-1 rounded-full hover:bg-black/20" title="My Profile">
                     <img className="w-12 h-12 rounded-full ring-2 ring-white/50" src="https://picsum.photos/100" alt="User Avatar" />
                 </button>
                 <div className="text-right">
                     <p className="font-bold">{currentUser?.firstName} {currentUser?.lastName}</p>
                     <p className="text-xs opacity-90">{settings.appVersion}</p>
                 </div>
            </div>
        </header>
    );
};

const Sidebar: React.FC = () => {
    const { 
        currentUser, 
        isLayoutLocked, toggleLayoutLock, 
        logout,
        exportAllData, importAllData, clearAllData,
        openEmailModal,
        startSlideExport
    } = useAppContext();

    const location = useLocation();
    const [isDataMenuOpen, setIsDataMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const dataMenuRef = useRef<HTMLDivElement>(null);
    const profileMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dataMenuRef.current && !dataMenuRef.current.contains(event.target as Node)) setIsDataMenuOpen(false);
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) setIsProfileMenuOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const navItems = useMemo(() => [
        { path: '/', icon: Home, label: 'Dashboard' },
        { path: '/projects', icon: Briefcase, label: 'Project Management' },
        { path: '/program-view', icon: LayoutDashboard, label: 'Program View' },
        { path: '/timeline', icon: CalendarDays, label: 'Timeline' },
        { path: '/weekly-plan', icon: ListTodo, label: 'Weekly Plan' },
        { path: '/risk-management', icon: ShieldAlert, label: 'Risk Management' },
        { path: '/stakeholders', icon: Users, label: 'Stakeholders' },
        { path: '/ai-center', icon: Bot, label: 'AI Center' },
        { path: '/logs', icon: History, label: 'Audit Logs' },
    ], []);

    return (
        <aside className={`bg-white dark:bg-gray-800 shadow-md flex flex-col transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
            <div className={`p-4 flex items-center h-[72px] ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
                 {isSidebarCollapsed ? (
                    <button onClick={() => setIsSidebarCollapsed(false)} className="p-1" title="Expand sidebar"><KanbanSquare className="w-8 h-8 text-[color:var(--color-primary)]" /></button>
                 ) : (
                    <span className="text-xl font-bold text-[color:var(--color-primary)]">PPM Tool</span>
                 )}
            </div>
            <nav className="flex-grow mt-2">
                {navItems.map(item => (
                    <Link key={item.path} to={item.path} title={isSidebarCollapsed ? item.label : undefined} className={`flex items-center py-3 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 relative ${isSidebarCollapsed ? 'px-0 justify-center' : 'px-6'} ${location.pathname === item.path ? 'bg-gray-200 dark:bg-gray-700' : ''}`}>
                        {location.pathname === item.path && <div className="absolute left-0 top-0 h-full w-1 bg-[color:var(--color-primary)]"></div>}
                        <item.icon className="w-6 h-6" />
                        {!isSidebarCollapsed && <span className="mx-4 font-medium">{item.label}</span>}
                    </Link>
                ))}
            </nav>
            <div className="p-2 border-t dark:border-gray-700 space-y-1">
                <button onClick={toggleLayoutLock} className={`p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : ''}`} title={isLayoutLocked ? "Unlock layout" : "Lock layout"}>
                    {isLayoutLocked ? <Lock size={20} /> : <Unlock size={20} />}
                    {!isSidebarCollapsed && <span className="ml-2 font-medium">{isLayoutLocked ? "Unlock Layout" : "Lock Layout"}</span>}
                </button>
                <div className="relative" ref={dataMenuRef}>
                    <button onClick={() => setIsDataMenuOpen(p => !p)} className={`p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : ''}`} title="Data Management">
                        <Database size={20} />
                        {!isSidebarCollapsed && <span className="ml-2 font-medium">Data Management</span>}
                    </button>
                    {isDataMenuOpen && (
                        <div className={`absolute bottom-full mb-2 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-20 border dark:border-gray-600 ${isSidebarCollapsed ? 'left-full ml-2' : 'right-0 w-52'}`}>
                            <p className="px-4 pt-2 pb-1 text-xs text-gray-400">Reporting</p>
                            <button onClick={() => { openEmailModal(); setIsDataMenuOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"><Mail size={14} className="mr-2" /> Email Dashboard</button>
                            <div className="border-t dark:border-gray-600 my-1"></div>
                             <p className="px-4 pt-2 pb-1 text-xs text-gray-400">Data I/O</p>
                            <button onClick={() => { importAllData(); setIsDataMenuOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"><Upload size={14} className="mr-2" /> Import Data</button>
                            <button onClick={() => { exportAllData(); setIsDataMenuOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"><Download size={14} className="mr-2" /> Export Data</button>
                            <div className="border-t dark:border-gray-600 my-1"></div>
                            <button onClick={() => { clearAllData(); setIsDataMenuOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50">
                                <Trash2 size={14} className="mr-2" /> Clear All Data
                            </button>
                        </div>
                    )}
                </div>
                {(currentUser?.role === 'Admin' || currentUser?.role === 'Developer') && (
                    <Link to="/admin" className={`p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : ''}`} title="Admin Settings">
                        <Settings size={20} />
                        {!isSidebarCollapsed && <span className="ml-2 font-medium">Admin Settings</span>}
                    </Link>
                )}
            </div>
             <div className="p-2 border-t dark:border-gray-700">
                <div className="relative" ref={profileMenuRef}>
                    <button onClick={() => setIsProfileMenuOpen(p => !p)} className={`p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : ''}`} title="Profile">
                        <img className="w-8 h-8 rounded-full" src="https://picsum.photos/100" alt="User Avatar" />
                        {!isSidebarCollapsed && <span className="text-sm font-medium ml-2 truncate">{currentUser?.firstName}</span>}
                    </button>
                     {isProfileMenuOpen && (
                        <div className={`absolute bottom-full mb-2 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-20 border dark:border-gray-600 ${isSidebarCollapsed ? 'left-full ml-2 w-56' : 'right-0 w-56'}`}>
                            <div className="px-4 py-2 border-b dark:border-gray-700">
                                <p className="text-sm font-semibold">{currentUser?.firstName} {currentUser?.lastName}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{currentUser?.role}</p>
                            </div>
                            <button onClick={() => { /* Implement profile modal opening via context */ setIsProfileMenuOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                                <UserIconLucide size={14} className="mr-2" /> My Profile
                            </button>
                             {(currentUser?.role === 'Admin' || currentUser?.role === 'Developer') && (
                                <Link to="/admin" onClick={() => setIsProfileMenuOpen(false)} className="w-full text-left flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <Settings2 size={14} className="mr-2" /> Admin Settings
                                </Link>
                            )}
                            <div className="border-t dark:border-gray-700 my-1"></div>
                            <button onClick={() => { logout(); setIsProfileMenuOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50">
                                <LogOut size={14} className="mr-2" /> Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
             <div className="p-2 border-t dark:border-gray-700">
                 <button onClick={() => setIsSidebarCollapsed(p => !p)} className="w-full p-2 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md" title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
                    {isSidebarCollapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
                </button>
            </div>
        </aside>
    );
};


const AppContent: React.FC = () => {
    const {
        isLoading, isAuthenticated, currentUser,
        visibleProjects, settings, timelineEvents, logs,
        isProjectModalOpen, isCloneModalOpen, isClearDataModalOpen, isProfileModalOpen, isEmailModalOpen,
        selectedProject, projectToClone,
        closeProjectModal, closeCloneModal, closeClearDataModal, closeProfileModal, closeEmailModal,
        saveProject, confirmCloneProject, confirmClearData, updateUser,
        emailReportHandler,
        isExportingSlides, slideExportStatus, slidesForExport, onSlidesReadyForExport
    } = useAppContext();

    if (isLoading) {
        return <Spinner message="Loading application data..." />;
    }

    return (
        <>
            {isExportingSlides && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex flex-col justify-center items-center z-[100]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                    <p className="text-white mt-4 font-semibold">{slideExportStatus}</p>
                </div>
            )}
            {isExportingSlides && slidesForExport && (
                <SlideGenerator 
                    projects={slidesForExport.projects}
                    settings={slidesForExport.settings}
                    timelineEvents={slidesForExport.timelineEvents}
                    onReady={onSlidesReadyForExport}
                />
            )}
            <Routes>
                <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
                <Route path="/*" element={
                    isAuthenticated && currentUser && settings ? (
                        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
                            <Sidebar />
                            <div className="flex-1 flex flex-col overflow-hidden">
                                <Header />
                                <main className="flex-1 overflow-x-hidden overflow-y-auto px-6 pb-6">
                                    <Routes>
                                        <Route path="/" element={<Dashboard />} />
                                        <Route path="/projects" element={<Projects />} />
                                        <Route path="/program-view" element={<ProgramView />} />
                                        <Route path="/timeline" element={<Timeline />} />
                                        <Route path="/weekly-plan" element={<WeeklyPlan />} />
                                        <Route path="/risk-management" element={<RiskManagement />} />
                                        <Route path="/stakeholders" element={<StakeholderManagement />} />
                                        <Route path="/ai-center" element={<AiCenter />} />
                                        <Route path="/logs" element={<Logs />} />
                                        {(currentUser?.role === 'Admin' || currentUser?.role === 'Developer') && <Route path="/admin" element={<AdminSettings />} />}
                                    </Routes>
                                </main>
                            </div>
                        </div>
                    ) : <Navigate to="/login" replace />
                } />
            </Routes>
            {isProjectModalOpen && <ProjectModal project={selectedProject} onClose={closeProjectModal} onSave={saveProject} settings={settings} />}
            {isCloneModalOpen && projectToClone && <CloneProjectModal isOpen={isCloneModalOpen} onClose={closeCloneModal} onConfirm={confirmCloneProject} projectToClone={projectToClone} />}
            {isClearDataModalOpen && <ConfirmationModal isOpen={isClearDataModalOpen} onClose={closeClearDataModal} onConfirm={confirmClearData} title="Clear All Data & Logout" message="Are you sure you want to proceed? This will permanently delete all projects, settings, and events, and then log you out. This action cannot be undone." />}
            {isProfileModalOpen && <ProfileModal isOpen={isProfileModalOpen} onClose={closeProfileModal} onSave={updateUser} user={currentUser} />}
            <EmailReportModal
                isOpen={isEmailModalOpen}
                onClose={closeEmailModal}
                onConfirm={emailReportHandler}
            />
            {/* AboutModal can be added here if needed */}
        </>
    );
};

const App: React.FC = () => (
    <HashRouter>
        <AppProvider>
            <AppContent />
        </AppProvider>
    </HashRouter>
);

export default App;

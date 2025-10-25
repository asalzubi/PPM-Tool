import React, { useState, useEffect, useRef } from 'react';
import type { AppSettings, User, SmtpSettings, Project, LogAction } from '../types';
import UserManagement from './admin/UserManagement';
import UserDetailsModal from './admin/UserDetailsModal';
import DatabaseManagement from './admin/DatabaseManagement';
import { Bot, CheckCircle, Info, Mail, Server, XCircle, History, Edit, FilePlus, FileUp, Share2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const ColorInput: React.FC<{ label: string; value: string; name: keyof AppSettings; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ label, value, name, onChange }) => (
    <div className="flex items-center justify-between">
        <label className="text-gray-600 dark:text-gray-300">{label}</label>
        <div className="flex items-center gap-2">
            <input type="text" name={name} value={value} onChange={onChange} className="w-24 p-1 border rounded dark:bg-gray-700 dark:border-gray-600" />
            <input type="color" value={value} onChange={(e) => onChange({ target: { name, value: e.target.value } } as any)} className="w-8 h-8 p-0 border-none rounded" />
        </div>
    </div>
);

const NumberInput: React.FC<{ label: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; helpText?: string; }> = ({ label, value, onChange, helpText }) => (
    <div className="flex items-center justify-between">
        <div>
            <label className="text-gray-600 dark:text-gray-300">{label}</label>
            {helpText && <p className="text-xs text-gray-400">{helpText}</p>}
        </div>
        <input type="number" value={value} onChange={onChange} className="w-24 p-1 border rounded dark:bg-gray-700 dark:border-gray-600" />
    </div>
);


const AdminSettings: React.FC = () => {
    const { settings, updateSettings, allProjects: projects, users, updateUser, createLog, setToast } = useAppContext();
    const [localSettings, setLocalSettings] = useState<AppSettings | null>(settings);
    const [activeTab, setActiveTab] = useState<'branding' | 'users' | 'scoring' | 'services' | 'database' | 'logging' | 'about'>('branding');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const isApiKeySet = process.env.API_KEY && process.env.API_KEY.length > 0;
    const [smtpTestStatus, setSmtpTestStatus] = useState<'idle' | 'testing' | 'success' | 'error' | null>(null);

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    const handleSelectUser = (user: User) => {
        setSelectedUser(user);
        setIsUserModalOpen(true);
    };

    const handleSaveUser = async (updatedUser: User) => {
        await updateUser(updatedUser);
        setIsUserModalOpen(false);
        setSelectedUser(null);
    };

    if (!localSettings) return null; // Or a loading spinner

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLocalSettings(prev => prev ? ({ ...prev, [name]: value }) : null);
    };

    const handleAiSettingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setLocalSettings(prev => prev ? ({ ...prev, aiSettings: { ...prev.aiSettings, [name]: value } }) : null);
    };
    
    const handleScoringChange = (category: 'weights' | 'mappings', key: string, value: string, subkey?: string) => {
        setLocalSettings(prev => {
            if (!prev) return null;
            const newScoring = JSON.parse(JSON.stringify(prev.riskScoring));
            if (category === 'weights' && (key === 'type' || key === 'impact')) newScoring.weights[key] = parseFloat(value) || 0;
            if (category === 'mappings' && (key === 'type' || key === 'impact') && subkey) newScoring.mappings[key][subkey] = parseInt(value, 10) || 0;
            return { ...prev, riskScoring: newScoring };
        });
    };
    
    const handleSmtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setLocalSettings(prev => prev ? ({ ...prev, smtpSettings: { ...prev.smtpSettings, [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value, 10) || 0 : value } }) : null);
    };
    
    const handleLogSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setLocalSettings(prev => prev ? ({ ...prev, logSettings: { ...prev.logSettings, [name]: checked } }) : null);
    };

    const handleTestSmtp = () => {
        setSmtpTestStatus('testing');
        setTimeout(() => {
            setSmtpTestStatus(localSettings.smtpSettings.server && localSettings.smtpSettings.user && localSettings.smtpSettings.pass ? 'success' : 'error');
            setTimeout(() => setSmtpTestStatus(null), 4000);
        }, 1500);
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setLocalSettings(prev => prev ? ({ ...prev, appLogo: reader.result as string }) : null);
            reader.readAsDataURL(file);
        }
    };
    
    const handleSave = (section: string) => {
        if (localSettings) {
            updateSettings(localSettings);
            setToast({ message: `${section} settings saved successfully!`, type: 'success' });
            createLog('Settings Updated', `Settings in the '${section}' section were updated.`);
        }
    };
    
    const TabButton: React.FC<{ tabName: typeof activeTab; label: string; }> = ({ tabName, label }) => (
         <button onClick={() => setActiveTab(tabName)} className={`px-4 py-2 font-semibold rounded-t-lg border-b-2 ${activeTab === tabName ? 'border-[color:var(--color-primary)] text-[color:var(--color-primary)]' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            {label}
        </button>
    );

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold">Admin Panel</h2>
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-6">
                    <TabButton tabName="branding" label="Theme & Branding" />
                    <TabButton tabName="services" label="AI & Services" />
                    <TabButton tabName="logging" label="Logging" />
                    <TabButton tabName="users" label="User Management" />
                    <TabButton tabName="scoring" label="Risk Scoring" />
                    <TabButton tabName="database" label="Database Management" />
                    <TabButton tabName="about" label="About" />
                </nav>
            </div>

            {activeTab === 'branding' && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                             <h4 className="font-medium mb-4">Branding</h4>
                             <div className="space-y-4">
                                <FormRowText label="Header Title" name="headerTitle" value={localSettings.headerTitle} onChange={handleChange} />
                                <FormRowText label="Header Subtitle" name="headerSubtitle" value={localSettings.headerSubtitle} onChange={handleChange} />
                                <FormRowText label="Version" name="appVersion" value={localSettings.appVersion} onChange={handleChange} />
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Application Logo</label>
                                    <div className="flex items-center gap-4">
                                        <img src={localSettings.appLogo} alt="Current Logo" className="h-16 w-auto p-1 border dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700" />
                                        <input type="file" ref={logoInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
                                        <button onClick={() => logoInputRef.current?.click()} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 border dark:border-gray-600 rounded-md font-semibold text-sm">Change Logo</button>
                                    </div>
                                </div>
                             </div>
                        </div>
                        <div>
                             <h4 className="font-medium mb-4">Color Palette</h4>
                            <div className="space-y-4">
                                <ColorInput label="Primary Color" name="colorPrimary" value={localSettings.colorPrimary} onChange={handleChange} />
                                <ColorInput label="Accent Color" name="colorAccent" value={localSettings.colorAccent} onChange={handleChange} />
                                <ColorInput label="Success" name="colorSuccess" value={localSettings.colorSuccess} onChange={handleChange} />
                                <ColorInput label="Warning" name="colorWarning" value={localSettings.colorWarning} onChange={handleChange} />
                                <ColorInput label="Danger" name="colorDanger" value={localSettings.colorDanger} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="md:col-span-2 border-t dark:border-gray-700 pt-6 mt-6">
                            <h4 className="font-medium mb-4">Chart Colors</h4>
                            <div className="space-y-4 max-w-sm">
                                <h5 className="font-semibold text-sm text-gray-500 dark:text-gray-400">Risk Distribution Chart</h5>
                                <ColorInput label="Low Risk" name="riskChartColorLow" value={localSettings.riskChartColorLow} onChange={handleChange} />
                                <ColorInput label="Medium Risk" name="riskChartColorMedium" value={localSettings.riskChartColorMedium} onChange={handleChange} />
                                <ColorInput label="High Risk" name="riskChartColorHigh" value={localSettings.riskChartColorHigh} onChange={handleChange} />
                                <ColorInput label="Critical Risk" name="riskChartColorCritical" value={localSettings.riskChartColorCritical} onChange={handleChange} />
                            </div>
                        </div>
                    </div>
                     <div className="flex justify-end mt-6">
                        <button onClick={() => handleSave('Branding')} className="px-6 py-2 bg-[color:var(--color-primary)] text-white font-semibold rounded-md hover:opacity-90 transition-opacity">Save Branding</button>
                    </div>
                </div>
            )}
            
            {activeTab === 'services' && (
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-8">
                    {/* Gemini AI Settings */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center"><Bot size={20} className="mr-2"/> Gemini AI Configuration</h3>
                        <div className="space-y-4 max-w-lg">
                            <div className="flex items-center justify-between">
                                <label className="text-gray-600 dark:text-gray-300 font-medium">API Key Status</label>
                                {isApiKeySet ? (
                                    <span className="flex items-center text-sm font-semibold px-2 py-1 bg-green-100 text-green-800 rounded-full"><CheckCircle size={14} className="mr-1"/> Connected</span>
                                ) : (
                                    <span className="flex items-center text-sm font-semibold px-2 py-1 bg-red-100 text-red-800 rounded-full"><XCircle size={14} className="mr-1"/>Not Configured</span>
                                )}
                            </div>
                             <p className="text-xs text-gray-500 dark:text-gray-400 flex items-start"><Info size={14} className="mr-2 mt-0.5 flex-shrink-0"/> The Gemini API key must be set as an environment variable (`API_KEY`) on the server where this application is hosted. It cannot be configured through this interface.</p>
                             <FormRowSelect label="Summarization Model" name="summarizationModel" value={localSettings.aiSettings.summarizationModel} onChange={handleAiSettingChange}>
                                 <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended)</option>
                                 <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                             </FormRowSelect>
                             <FormRowSelect label="Text Enrichment Model" name="enrichmentModel" value={localSettings.aiSettings.enrichmentModel} onChange={handleAiSettingChange}>
                                 <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended)</option>
                                 <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                             </FormRowSelect>
                        </div>
                    </div>
                     {/* SMTP Settings */}
                     <div className="border-t dark:border-gray-700 pt-8">
                        <h3 className="text-lg font-semibold mb-4 flex items-center"><Mail size={20} className="mr-2"/> SMTP Email Configuration</h3>
                        <p className="text-sm text-gray-500 mb-6">Configure the settings for sending reports and notifications. Below are suggested settings for a Gmail account.</p>
                        <div className="space-y-4 max-w-lg">
                            <div className="flex items-center justify-between">
                                 <label htmlFor="smtp-enabled" className="font-medium text-gray-600 dark:text-gray-300">Enable Email Service</label>
                                 <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                    <input type="checkbox" name="enabled" id="smtp-enabled" checked={localSettings.smtpSettings.enabled} onChange={handleSmtpChange} className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"/>
                                    <label htmlFor="smtp-enabled" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 dark:bg-gray-600 cursor-pointer"></label>
                                </div>
                            </div>
                            <FormRow label="SMTP Server" name="server" value={localSettings.smtpSettings.server} onChange={handleSmtpChange} placeholder="smtp.gmail.com" />
                            <FormRow label="Port" name="port" type="number" value={localSettings.smtpSettings.port} onChange={handleSmtpChange} placeholder="587" />
                            <FormRow label="Username" name="user" value={localSettings.smtpSettings.user} onChange={handleSmtpChange} placeholder="your-email@gmail.com" />
                            <FormRow label="Password" name="pass" type="password" value={localSettings.smtpSettings.pass} onChange={handleSmtpChange} placeholder="Gmail App Password"/>
                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-start -mt-2 ml-4">
                                <Info size={14} className="mr-2 mt-0.5 flex-shrink-0"/> If you use Gmail with 2-Factor Authentication, you must generate and use an <a href="https://support.google.com/accounts/answer/185833" target="_blank" rel="noopener noreferrer" className="text-[color:var(--color-primary)] underline">App Password</a>.
                            </p>
                            <FormRow label="'From' Email" name="from" value={localSettings.smtpSettings.from} onChange={handleSmtpChange} placeholder="your-email@gmail.com" />
                            <div className="flex justify-end pt-2">
                                <button onClick={handleTestSmtp} disabled={!localSettings.smtpSettings.enabled || smtpTestStatus === 'testing'} className="flex items-center px-4 py-2 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50">
                                    {smtpTestStatus === 'testing' ? (
                                        <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div> Testing...</>
                                    ) : (
                                        <><Server size={16} className="mr-2"/> Test Connection</>
                                    )}
                                </button>
                            </div>
                            {smtpTestStatus === 'success' && <p className="text-sm text-green-600 dark:text-green-400 text-right">✓ Mock connection successful!</p>}
                            {smtpTestStatus === 'error' && <p className="text-sm text-red-600 dark:text-red-400 text-right">✗ Mock connection failed. Check credentials.</p>}
                        </div>
                    </div>
                    <div className="flex justify-end mt-6">
                        <button onClick={() => handleSave('Service')} className="px-6 py-2 bg-[color:var(--color-primary)] text-white font-semibold rounded-md hover:opacity-90 transition-opacity">Save Service Settings</button>
                    </div>
                 </div>
            )}

            {activeTab === 'logging' && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-2 flex items-center"><History size={20} className="mr-2"/> Logging Configuration</h3>
                    <p className="text-sm text-gray-500 mb-6">Select which actions should be recorded in the audit logs. System events like login/logout and settings changes are always logged.</p>
                    <div className="space-y-4 max-w-md">
                        <CheckboxRow name="logProjectAdditions" label="Project Created" icon={FilePlus} checked={localSettings.logSettings.logProjectAdditions} onChange={handleLogSettingChange} />
                        <CheckboxRow name="logProjectUpdates" label="Project Updated / Deleted" icon={Edit} checked={localSettings.logSettings.logProjectUpdates} onChange={handleLogSettingChange} />
                        <CheckboxRow name="logEmailSent" label="Email Sent" icon={Mail} checked={localSettings.logSettings.logEmailSent} onChange={handleLogSettingChange} />
                        <CheckboxRow name="logSlidesExported" label="Slides Exported" icon={Share2} checked={localSettings.logSettings.logSlidesExported} onChange={handleLogSettingChange} />
                    </div>
                    <div className="flex justify-end mt-6">
                        <button onClick={() => handleSave('Logging')} className="px-6 py-2 bg-[color:var(--color-primary)] text-white font-semibold rounded-md hover:opacity-90 transition-opacity">Save Logging Settings</button>
                    </div>
                </div>
            )}
            
            {activeTab === 'users' && (
                <div>
                    {users.length === 0 ? (
                         <div className="flex justify-center items-center h-48"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--color-primary)]"></div></div>
                    ) : (
                        <UserManagement users={users} onSelectUser={handleSelectUser} />
                    )}
                </div>
            )}
            
            {activeTab === 'scoring' && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Risk Scoring Configuration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h4 className="font-medium border-b dark:border-gray-700 pb-2">Factor Weights</h4>
                            <NumberInput label="Type Weight" value={localSettings.riskScoring.weights.type} onChange={(e) => handleScoringChange('weights', 'type', e.target.value)} helpText="Contribution of risk type to the score." />
                            <NumberInput label="Impact Weight" value={localSettings.riskScoring.weights.impact} onChange={(e) => handleScoringChange('weights', 'impact', e.target.value)} helpText="Contribution of risk impact to the score." />
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-medium border-b dark:border-gray-700 pb-2">Value Mappings</h4>
                            {Object.entries(localSettings.riskScoring.mappings).map(([key, valueMap]) => (
                                <div key={key}>
                                    <h5 className="font-semibold capitalize mb-2">{key} Points</h5>
                                    <div className="space-y-2 pl-4 border-l-2 dark:border-gray-700">
                                        {Object.entries(valueMap).map(([level, points]) => ( <NumberInput key={level} label={level} value={points as number} onChange={(e) => handleScoringChange('mappings', key, e.target.value, level)} /> ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                     <div className="flex justify-end mt-6">
                        <button onClick={() => handleSave('Scoring')} className="px-6 py-2 bg-[color:var(--color-primary)] text-white font-semibold rounded-md hover:opacity-90 transition-opacity">Save Scoring Logic</button>
                    </div>
                </div>
            )}
            
            {activeTab === 'database' && ( <DatabaseManagement /> )}

            {activeTab === 'about' && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4 flex items-center"><Info size={20} className="mr-2"/> About This Application</h3>
                    <div className="space-y-4 text-gray-700 dark:text-gray-300">
                        <p className="text-sm">
                            This Enterprise Project Portfolio Management (PPM) application is a comprehensive tool designed to provide a centralized platform for managing projects, tracking risks, monitoring timelines, and gaining AI-powered insights into the overall program health.
                        </p>
                        <div className="border-t dark:border-gray-700 pt-4 mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="font-semibold text-base">Developer Information</p>
                                <p><strong>Name:</strong> Abdel Rahman Al Zu'bi</p>
                                <p><strong>Contact:</strong> <a href="mailto:asalzubi@gmail.com" className="text-[color:var(--color-primary)] hover:underline">asalzubi@gmail.com</a></p>
                            </div>
                            <div>
                                 <p className="font-semibold text-base">Application Details</p>
                                <p><strong>Version:</strong> {localSettings.appVersion}</p>
                            </div>
                        </div>
                        
                        <div className="border-t dark:border-gray-700 pt-4 mt-4">
                            <p className="font-semibold text-base">Technology Stack</p>
                            <ul className="list-disc list-inside text-sm pl-4 mt-2 space-y-1">
                                <li><strong>React & TypeScript:</strong> For a robust and scalable frontend.</li>
                                <li><strong>TailwindCSS:</strong> For rapid and modern UI development.</li>
                                <li><strong>Gemini API:</strong> Powering AI-driven summaries and text enrichment.</li>
                                <li><strong>Recharts:</strong> For interactive and beautiful data visualizations.</li>
                            </ul>
                        </div>

                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 pt-4 border-t dark:border-gray-700 mt-4">
                            Created with Google AI Studio.
                        </p>
                    </div>
                </div>
            )}

            {isUserModalOpen && selectedUser && ( <UserDetailsModal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} onSave={handleSaveUser} user={selectedUser} projects={projects} /> )}
        </div>
    );
};

const FormRowText: React.FC<{ label: string; name: keyof AppSettings; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ label, name, value, onChange }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{label}</label>
        <input type="text" id={name} name={name} value={value} onChange={onChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
    </div>
);

const FormRowSelect: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; children: React.ReactNode; }> = ({ label, name, value, onChange, children }) => (
    <div className="flex items-center justify-between">
        <label htmlFor={name} className="text-gray-600 dark:text-gray-300 font-medium">{label}</label>
        <select id={name} name={name} value={value} onChange={onChange} className="w-64 p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
            {children}
        </select>
    </div>
);


interface FormRowProps {
    label: string;
    name: keyof SmtpSettings;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    placeholder?: string;
}

const FormRow: React.FC<FormRowProps> = ({ label, name, value, onChange, type = 'text', placeholder }) => (
    <div className="flex items-center justify-between">
        <label htmlFor={name} className="text-gray-600 dark:text-gray-300">{label}</label>
        <input type={type} id={name} name={name} value={value} onChange={onChange} placeholder={placeholder} className="w-64 p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
    </div>
);

const CheckboxRow: React.FC<{name: string, label: string, icon: React.ElementType, checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void}> = ({ name, label, icon: Icon, checked, onChange }) => (
    <label htmlFor={name} className="flex items-center p-3 rounded-md bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">
        <input
            type="checkbox"
            id={name}
            name={name}
            checked={checked}
            onChange={onChange}
            className="h-5 w-5 rounded border-gray-300 text-[color:var(--color-primary)] focus:ring-[color:var(--color-primary)]"
        />
        <Icon className="w-5 h-5 mx-3 text-gray-500 dark:text-gray-400" />
        <span className="font-medium text-gray-700 dark:text-gray-200">{label}</span>
    </label>
);

export default AdminSettings;
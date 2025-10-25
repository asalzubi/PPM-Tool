import React, { useState, useEffect } from 'react';
import type { User, Project } from '../../types';
import { X, Save, User as UserIcon, Calendar, LogIn, Mail, Power, KeyRound, Briefcase } from 'lucide-react';

interface UserDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (user: User) => void;
    user: User;
    projects: Project[];
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ isOpen, onClose, onSave, user, projects }) => {
    const [editedUser, setEditedUser] = useState<User>(user);
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        setEditedUser(user);
        setNewPassword(''); // Reset password field when user changes
    }, [user]);

    if (!isOpen) return null;

    const assignedProjects = projects.filter(p => p.ownerId === user.id);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditedUser(prev => ({ ...prev, [name]: value as any }));
    };
    
    const handleSave = () => {
        const userToSave = { ...editedUser };
        if (newPassword) {
            userToSave.password = newPassword;
        }
        onSave(userToSave);
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const InfoRow: React.FC<{ icon: React.ElementType, label: string, children: React.ReactNode }> = ({ icon: Icon, label, children }) => (
        <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                <Icon size={14} className="mr-2" />
                {label}
            </label>
            <div className="mt-1">{children}</div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl m-4">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <div className="flex items-center">
                        <UserIcon className="w-6 h-6 mr-3 text-[color:var(--color-primary)]" />
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">User Details</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-300">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoRow icon={UserIcon} label="First Name">
                            <input
                                type="text"
                                name="firstName"
                                value={editedUser.firstName}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[color:var(--color-primary)] focus:border-[color:var(--color-primary)] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                            />
                        </InfoRow>
                        <InfoRow icon={UserIcon} label="Last Name">
                            <input
                                type="text"
                                name="lastName"
                                value={editedUser.lastName}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[color:var(--color-primary)] focus:border-[color:var(--color-primary)] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                            />
                        </InfoRow>
                        <InfoRow icon={UserIcon} label="Username">
                            <input
                                type="text"
                                name="username"
                                value={editedUser.username}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[color:var(--color-primary)] focus:border-[color:var(--color-primary)] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                            />
                        </InfoRow>
                         <InfoRow icon={Mail} label="Email">
                            <input
                                type="email"
                                name="email"
                                value={editedUser.email}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[color:var(--color-primary)] focus:border-[color:var(--color-primary)] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                            />
                        </InfoRow>
                    </div>

                    <InfoRow icon={KeyRound} label="New Password">
                        <input
                            type="password"
                            name="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Leave blank to keep unchanged"
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[color:var(--color-primary)] focus:border-[color:var(--color-primary)] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        />
                    </InfoRow>
                    
                    <div className="grid grid-cols-2 gap-4">
                         <InfoRow icon={UserIcon} label="Role">
                             <select
                                name="role"
                                value={editedUser.role}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[color:var(--color-primary)] focus:border-[color:var(--color-primary)] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                            >
                                <option value="User">User</option>
                                <option value="Admin">Admin</option>
                                <option value="Developer">Developer</option>
                            </select>
                         </InfoRow>
                         <InfoRow icon={Power} label="Status">
                              <select
                                name="status"
                                value={editedUser.status}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[color:var(--color-primary)] focus:border-[color:var(--color-primary)] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                            >
                                <option value="Active">Active</option>
                                <option value="Disabled">Disabled</option>
                            </select>
                         </InfoRow>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         <InfoRow icon={Calendar} label="Member Since">
                             <p className="p-2 bg-gray-100 dark:bg-gray-700/50 rounded-md text-gray-800 dark:text-gray-200">{formatDate(editedUser.createdAt)}</p>
                         </InfoRow>
                        <InfoRow icon={LogIn} label="Last Login">
                            <p className="p-2 bg-gray-100 dark:bg-gray-700/50 rounded-md text-gray-800 dark:text-gray-200">{formatDate(editedUser.lastLogin)}</p>
                        </InfoRow>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center border-t dark:border-gray-700 pt-4 mt-4">
                            <Briefcase size={14} className="mr-2" />
                            Assigned Projects
                        </h3>
                        <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                            {assignedProjects.length > 0 ? (
                                assignedProjects.map(p => (
                                    <p key={p.id} className="p-2 bg-gray-100 dark:bg-gray-700/50 rounded-md text-gray-800 dark:text-gray-200 text-sm">
                                        {p.name}
                                    </p>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500 italic p-2">No projects assigned to this user.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end p-4 bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700 space-x-3 rounded-b-lg">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md font-semibold hover:bg-gray-300 dark:hover:bg-gray-500"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex items-center px-4 py-2 bg-[color:var(--color-primary)] text-white rounded-md font-semibold hover:opacity-90"
                    >
                        <Save size={16} className="mr-2" />
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserDetailsModal;
import React, { useState, useEffect } from 'react';
import type { User } from '../../types';
import { X, Save, User as UserIcon, Mail, KeyRound } from 'lucide-react';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (user: User) => void;
    user: User | null;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, onSave, user }) => {
    const [editedUser, setEditedUser] = useState<User | null>(user);
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        setEditedUser(user);
        setNewPassword(''); // Reset password field when modal opens
    }, [user, isOpen]);

    if (!isOpen || !editedUser) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditedUser(prev => prev ? ({ ...prev, [name]: value as any }) : null);
    };
    
    const handleSave = () => {
        if (editedUser) {
            const userToSave = { ...editedUser };
            if (newPassword) {
                userToSave.password = newPassword;
            }
            onSave(userToSave);
            onClose();
        }
    }

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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg m-4">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">My Profile</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-300">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoRow icon={UserIcon} label="First Name">
                            <input type="text" name="firstName" value={editedUser.firstName} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                        </InfoRow>
                        <InfoRow icon={UserIcon} label="Last Name">
                            <input type="text" name="lastName" value={editedUser.lastName} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                        </InfoRow>
                    </div>
                    <InfoRow icon={Mail} label="Email">
                        <input type="email" name="email" value={editedUser.email} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    </InfoRow>
                    <InfoRow icon={UserIcon} label="Username">
                        <input type="text" name="username" value={editedUser.username} onChange={handleChange} className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-700/50" disabled />
                    </InfoRow>
                    <InfoRow icon={KeyRound} label="New Password">
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Leave blank to keep unchanged" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    </InfoRow>
                </div>

                <div className="flex justify-end p-4 bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700 space-x-3 rounded-b-lg">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md font-semibold">Cancel</button>
                    <button onClick={handleSave} className="flex items-center px-4 py-2 bg-[color:var(--color-primary)] text-white rounded-md font-semibold hover:opacity-90">
                        <Save size={16} className="mr-2" />
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;

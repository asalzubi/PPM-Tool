import React from 'react';
import type { User } from '../../types';
import { ShieldCheck, User as UserIcon, CheckCircle, XCircle } from 'lucide-react';

interface UserManagementProps {
    users: User[];
    onSelectUser: (user: User) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, onSelectUser }) => {

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const RoleBadge: React.FC<{ role: User['role'] }> = ({ role }) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
            role === 'Admin' ? 'bg-indigo-100 text-indigo-800' :
            role === 'Developer' ? 'bg-teal-100 text-teal-800' :
            'bg-gray-100 text-gray-800'
        }`}>
            {role}
        </span>
    );

    const StatusBadge: React.FC<{ status: 'Active' | 'Disabled' }> = ({ status }) => (
        <span className={`flex items-center px-2 py-1 text-xs font-semibold rounded-full ${status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {status === 'Active' ? <CheckCircle size={12} className="mr-1" /> : <XCircle size={12} className="mr-1" />}
            {status}
        </span>
    );

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2 dark:border-gray-700">User Roster</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b dark:border-gray-700">
                        <tr>
                            <th className="py-2">User</th>
                            <th className="py-2">Role</th>
                            <th className="py-2">Status</th>
                            <th className="py-2">Member Since</th>
                            <th className="py-2">Last Login</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr
                                key={user.id}
                                className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                                onClick={() => onSelectUser(user)}
                            >
                                <td className="py-3 font-medium">
                                    <div className="flex items-center">
                                        {user.role === 'Admin' || user.role === 'Developer'
                                            ? <ShieldCheck size={16} className="mr-2 text-[color:var(--color-primary)]" />
                                            : <UserIcon size={16} className="mr-2 text-gray-500" />
                                        }
                                        <span>{user.firstName} {user.lastName}</span>
                                    </div>
                                    <span className="text-xs text-gray-500 ml-6">{user.username}</span>
                                </td>
                                <td className="py-3">
                                    <RoleBadge role={user.role} />
                                </td>
                                <td className="py-3">
                                    <StatusBadge status={user.status} />
                                </td>
                                <td className="py-3">{formatDate(user.createdAt)}</td>
                                <td className="py-3">{formatDate(user.lastLogin)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagement;
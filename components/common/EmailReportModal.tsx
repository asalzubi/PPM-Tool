import React, { useState } from 'react';
import { X, Send } from 'lucide-react';

interface EmailReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (email: string) => void;
    title?: string;
}

const EmailReportModal: React.FC<EmailReportModalProps> = ({ isOpen, onClose, onConfirm, title = "Email Report" }) => {
    const [email, setEmail] = useState('');
    const [isValid, setIsValid] = useState(true);

    if (!isOpen) return null;

    const handleConfirm = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(email)) {
            setIsValid(true);
            onConfirm(email);
            onClose(); // Close modal on successful submission
        } else {
            setIsValid(false);
        }
    };
    
    const handleClose = () => {
        setEmail('');
        setIsValid(true);
        onClose();
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-4">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">{title}</h2>
                    <button onClick={handleClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-300">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-gray-600 dark:text-gray-300">
                        Enter the recipient's email address to send this report.
                    </p>
                    <div>
                        <label htmlFor="email-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Recipient Email
                        </label>
                        <input
                            type="email"
                            id="email-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="recipient@example.com"
                            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm dark:bg-gray-700 dark:text-gray-200 ${!isValid ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                        />
                        {!isValid && <p className="mt-2 text-sm text-red-600 dark:text-red-400">Please enter a valid email address.</p>}
                    </div>
                </div>
                <div className="flex justify-end p-4 bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700 space-x-3 rounded-b-lg">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md font-semibold hover:bg-gray-300 dark:hover:bg-gray-500"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="flex items-center px-4 py-2 bg-[color:var(--color-primary)] text-white rounded-md font-semibold hover:opacity-90"
                    >
                        <Send size={16} className="mr-2" />
                        Send Report
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmailReportModal;
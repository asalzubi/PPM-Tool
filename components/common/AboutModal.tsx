
import React from 'react';
import { X, Info } from 'lucide-react';

interface AboutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const devInfo = {
        name: "Abdel Rahman Al Zu'bi",
        email: 'asalzubi@gmail.com',
        version: '2.2',
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-4">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center">
                        <Info className="mr-2" /> About PPM Tool
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-300">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <p><strong>Application Version:</strong> {devInfo.version}</p>
                    <p><strong>Developer:</strong> {devInfo.name}</p>
                    <p><strong>Contact:</strong> <a href={`mailto:${devInfo.email}`} className="text-[color:var(--color-primary)] hover:underline">{devInfo.email}</a></p>
                    
                    <div className="border-t dark:border-gray-700 pt-4 mt-4">
                        <p className="font-semibold">Technology Stack</p>
                        <ul className="list-disc list-inside text-sm pl-4 mt-1 space-y-1">
                            <li><strong>React & TypeScript</strong></li>
                            <li><strong>TailwindCSS</strong></li>
                            <li><strong>Gemini API</strong></li>
                        </ul>
                    </div>
                    
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 pt-4 border-t dark:border-gray-700 mt-4">
                        Created with Google AI Studio.
                    </p>
                </div>
                 <div className="flex justify-end p-4 bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700 rounded-b-lg">
                    <button 
                        onClick={onClose} 
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md font-semibold hover:bg-gray-300 dark:hover:bg-gray-500"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AboutModal;
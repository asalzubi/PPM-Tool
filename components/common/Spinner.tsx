
import React from 'react';

interface SpinnerProps {
    message?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ message = "Loading..." }) => {
    return (
        <div className="fixed inset-0 bg-gray-100 dark:bg-gray-900 flex flex-col justify-center items-center z-[200]">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[color:var(--color-primary)]"></div>
            {message && <p className="text-lg font-semibold mt-4 text-gray-700 dark:text-gray-300">{message}</p>}
        </div>
    );
};

export default Spinner;

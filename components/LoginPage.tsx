
import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const LoginPage: React.FC = () => {
    const { login, settings } = useAppContext();
    const [username, setUsername] = useState('j.doe');
    const [password, setPassword] = useState('password');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const success = await login(username, password);
            if (!success) {
                setError('Invalid username or password.');
            }
        } catch (err) {
            setError('An error occurred during login.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <div className="flex flex-col items-center">
                    {settings?.appLogo && (
                        <div className="w-48 h-auto mb-4">
                            <img src={settings.appLogo} alt="App Logo" className="w-full h-full object-contain" />
                        </div>
                    )}
                    <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100">
                        PPM Tool Login
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="username" className="sr-only">Username</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-[color:var(--color-primary)] focus:border-[color:var(--color-primary)] focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password-input" className="sr-only">Password</label>
                            <input
                                id="password-input"
                                name="password"
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-[color:var(--color-primary)] focus:border-[color:var(--color-primary)] focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[color:var(--color-primary)] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[color:var(--color-accent)] disabled:bg-gray-400"
                        >
                            {isLoading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                <>
                                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                    <Lock className="h-5 w-5 text-indigo-400 group-hover:text-indigo-300" aria-hidden="true" />
                                </span>
                                Sign in
                                </>
                            )}
                        </button>
                    </div>
                </form>
                 <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                    Hint: j.doe (Admin) or s.smith (User). Pass: 'password'
                </p>
            </div>
        </div>
    );
};

export default LoginPage;

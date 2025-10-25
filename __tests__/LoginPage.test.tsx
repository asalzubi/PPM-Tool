

/**
 * @jest-environment jsdom
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginPage from '../components/LoginPage';
import { AppProvider } from '../context/AppContext';
import { HashRouter } from 'react-router-dom';

// Mock the context to provide a login function
const mockLogin = jest.fn();

// We need to mock the entire context because LoginPage consumes it
jest.mock('../context/AppContext', () => ({
    ...jest.requireActual('../context/AppContext'),
    useAppContext: () => ({
        login: mockLogin,
        settings: { appLogo: 'test-logo.png' },
    }),
}));


describe('LoginPage', () => {
    beforeEach(() => {
        mockLogin.mockClear();
        render(
            <HashRouter>
                <AppProvider>
                    <LoginPage />
                </AppProvider>
            </HashRouter>
        );
    });

    it('renders the login form with default values', () => {
        expect(screen.getByPlaceholderText(/username/i)).toHaveValue('j.doe');
        expect(screen.getByPlaceholderText(/password/i)).toHaveValue('password');
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('allows user to type in username and password fields', () => {
        const usernameInput = screen.getByPlaceholderText(/username/i);
        const passwordInput = screen.getByPlaceholderText(/password/i);

        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(passwordInput, { target: { value: 'testpass' } });

        expect(usernameInput).toHaveValue('testuser');
        expect(passwordInput).toHaveValue('testpass');
    });

    it('calls the login function from context on submit with the correct credentials', async () => {
        mockLogin.mockResolvedValue(true); // Simulate successful login

        const usernameInput = screen.getByPlaceholderText(/username/i);
        const passwordInput = screen.getByPlaceholderText(/password/i);
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        fireEvent.change(usernameInput, { target: { value: 's.smith' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledTimes(1);
            expect(mockLogin).toHaveBeenCalledWith('s.smith', 'password123');
        });
    });

    it('displays an error message on failed login', async () => {
        mockLogin.mockResolvedValue(false); // Simulate failed login

        const submitButton = screen.getByRole('button', { name: /sign in/i });
        fireEvent.click(submitButton);

        // Wait for the async login function to complete and the error message to appear
        const errorMessage = await screen.findByText(/invalid username or password/i);
        expect(errorMessage).toBeInTheDocument();
    });
});
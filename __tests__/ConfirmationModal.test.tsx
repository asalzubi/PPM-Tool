

/**
 * @jest-environment jsdom
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConfirmationModal from '../components/common/ConfirmationModal';

describe('ConfirmationModal', () => {
    const mockOnClose = jest.fn();
    const mockOnConfirm = jest.fn();
    const props = {
        isOpen: true,
        onClose: mockOnClose,
        onConfirm: mockOnConfirm,
        title: 'Test Title',
        message: 'Are you sure?',
    };

    beforeEach(() => {
        // Clear mock history before each test
        mockOnClose.mockClear();
        mockOnConfirm.mockClear();
    });

    it('should not render when isOpen is false', () => {
        render(<ConfirmationModal {...props} isOpen={false} />);
        expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
    });

    it('should render with correct title and message when isOpen is true', () => {
        render(<ConfirmationModal {...props} />);
        expect(screen.getByText('Test Title')).toBeInTheDocument();
        expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    });

    it('should call onConfirm when the confirm button is clicked', () => {
        render(<ConfirmationModal {...props} />);
        const confirmButton = screen.getByRole('button', { name: /confirm/i });
        fireEvent.click(confirmButton);
        expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when the cancel button is clicked', () => {
        render(<ConfirmationModal {...props} />);
        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        fireEvent.click(cancelButton);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when the close icon (X) is clicked', () => {
        render(<ConfirmationModal {...props} />);
        // The close button is the one without text content, let's find it by its parent structure
        const closeButton = screen.getByRole('button', { name: "" }); // Find button with no accessible name
        fireEvent.click(closeButton);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
});
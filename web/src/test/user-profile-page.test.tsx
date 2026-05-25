import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import UserProfilePage from '@/pages/user-profile-page';
import * as useUserProfileModule from '@/hooks/use-user-profile';
import type { UserProfile } from '@/types/user';

jest.mock('@/hooks/use-user-profile');
const mockUseUserProfile = jest.spyOn(useUserProfileModule, 'useUserProfile');

jest.mock('@/components/ui/button', () => ({
    Button: ({ children, onClick, disabled }: any) => (
        <button onClick={onClick} disabled={disabled}>
            {children}
        </button>
    ),
}));

jest.mock('@/components/ui/input', () => ({
    Input: ({ label, name, value, onChange }: any) => (
        <div>
            <label htmlFor={name}>{label}</label>
            <input id={name} name={name} value={value} onChange={onChange} data-testid={`input-${name}`} />
        </div>
    ),
}));

jest.mock('@/components/ui/alert', () => ({
    Alert: ({ children, title, variant, onClose }: any) => (
        <div role="alert" data-testid={`alert-${variant}`}>
            <strong>{title}</strong>
            <span>{children}</span>
            <button onClick={onClose} data-testid="close-alert">×</button>
        </div>
    ),
}));

jest.mock('@/components/profile/profile-header', () => ({
    ProfileHeader: ({ name }: any) => <div data-testid="profile-header">{name}</div>,
}));

jest.mock('@/components/profile/brand-memberships', () => ({
    BrandMemberships: () => <div data-testid="brand-memberships">Brand Memberships</div>,
}));

jest.mock('@/components/profile/delete-account-section', () => ({
    DeleteAccountSection: () => <div data-testid="delete-account-section">Delete Account Section</div>,
}));

const mockUser: UserProfile = {
    id: 1,
    name: 'Rostyslav',
    email: 'rostyslav@example.com',
    is_superadmin: false,
    created_at: '2026-03-01T00:00:00Z',
    memberships: [],
};

const baseHookState = {
    user: mockUser,
    isLoading: false,
    formData: { name: 'Rostyslav', email: 'rostyslav@example.com' },
    isSaving: false,
    isDirty: false,
    alert: null,
    setAlert: jest.fn(),
    handleInputChange: jest.fn(),
    handleSave: jest.fn(),
    handleCancel: jest.fn(),
};

function renderPage() {
    return render(
        <MemoryRouter>
            <UserProfilePage />
        </MemoryRouter>
    );
}

describe('UserProfilePage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shows a loading message while fetching profile', () => {
        mockUseUserProfile.mockReturnValue({ ...baseHookState, isLoading: true, user: null });
        renderPage();

        expect(screen.getByText('Loading profile...')).toBeInTheDocument();
        expect(screen.queryByTestId('profile-header')).not.toBeInTheDocument();
    });

    it('shows a not found message when user is null and not loading', () => {
        mockUseUserProfile.mockReturnValue({ ...baseHookState, user: null });
        renderPage();

        expect(screen.getByText('Profile not found.')).toBeInTheDocument();
    });

    it('renders all main sections when user data is loaded', () => {
        mockUseUserProfile.mockReturnValue(baseHookState);
        renderPage();

        expect(screen.getByText('My Profile')).toBeInTheDocument();
        expect(screen.getByTestId('profile-header')).toHaveTextContent('Rostyslav');
        expect(screen.getByTestId('brand-memberships')).toBeInTheDocument();
        expect(screen.getByTestId('delete-account-section')).toBeInTheDocument();
    });

    it('disables Save and Cancel buttons when form is not dirty', () => {
        mockUseUserProfile.mockReturnValue({ ...baseHookState, isDirty: false });
        renderPage();

        expect(screen.getByText('Cancel')).toBeDisabled();
        expect(screen.getByText('Save changes')).toBeDisabled();
    });

    it('enables Save and Cancel buttons when form is dirty', () => {
        mockUseUserProfile.mockReturnValue({ ...baseHookState, isDirty: true });
        renderPage();

        expect(screen.getByText('Cancel')).not.toBeDisabled();
        expect(screen.getByText('Save changes')).not.toBeDisabled();
    });

    it('calls handleInputChange when typing in inputs', () => {
        const handleInputChange = jest.fn();
        mockUseUserProfile.mockReturnValue({ ...baseHookState, handleInputChange });
        renderPage();

        const nameInput = screen.getByTestId('input-name');
        fireEvent.change(nameInput, { target: { value: 'New Name' } });

        expect(handleInputChange).toHaveBeenCalledTimes(1);
    });

    it('calls handleSave when clicking Save changes', () => {
        const handleSave = jest.fn();
        mockUseUserProfile.mockReturnValue({ ...baseHookState, isDirty: true, handleSave });
        renderPage();

        fireEvent.click(screen.getByText('Save changes'));
        expect(handleSave).toHaveBeenCalledTimes(1);
    });

    it('calls handleCancel when clicking Cancel', () => {
        const handleCancel = jest.fn();
        mockUseUserProfile.mockReturnValue({ ...baseHookState, isDirty: true, handleCancel });
        renderPage();

        fireEvent.click(screen.getByText('Cancel'));
        expect(handleCancel).toHaveBeenCalledTimes(1);
    });

    it('renders an Alert when the hook returns an alert state', () => {
        mockUseUserProfile.mockReturnValue({
            ...baseHookState,
            alert: { variant: 'success', message: 'Profile updated successfully!' },
        });
        renderPage();

        const alertBlock = screen.getByTestId('alert-success');
        expect(alertBlock).toBeInTheDocument();
        expect(screen.getByText('Success')).toBeInTheDocument();
        expect(screen.getByText('Profile updated successfully!')).toBeInTheDocument();
    });

    it('calls setAlert(null) when closing the alert', () => {
        const setAlert = jest.fn();
        mockUseUserProfile.mockReturnValue({
            ...baseHookState,
            alert: { variant: 'error', message: 'Update failed.' },
            setAlert,
        });
        renderPage();

        fireEvent.click(screen.getByTestId('close-alert'));
        expect(setAlert).toHaveBeenCalledWith(null);
    });
});
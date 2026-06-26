import { renderHook, act, waitFor } from '@testing-library/react';
import type { ChangeEvent } from 'react';
import { useUserProfile } from '@/hooks/use-user-profile';
import { UserService, getCurrentUser } from '@/services/user-service';
import type { UserProfile } from '@/types/user';

jest.mock('@/services/user-service', () => ({
  getCurrentUser: jest.fn(),
  UserService: {
    updateUser: jest.fn(),
  },
}));

const mockUser: UserProfile = {
  id: 1,
  name: 'Rostyslav',
  email: 'rostyslav@example.com',
  is_superadmin: false,
  created_at: '2026-03-01T00:00:00Z',
  memberships: [],
};

describe('useUserProfile hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('loads user data successfully', async () => {
    (getCurrentUser as jest.Mock).mockResolvedValueOnce(mockUser);

    const { result } = renderHook(() => useUserProfile());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.formData).toEqual({ name: 'Rostyslav', email: 'rostyslav@example.com' });
  });

  it('handles load failure and shows error alert', async () => {
    (getCurrentUser as jest.Mock).mockRejectedValueOnce(new Error('Network Error'));

    const { result } = renderHook(() => useUserProfile());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.alert).toEqual({
      variant: 'error',
      message: 'Failed to load profile data.',
    });
  });

  it('toggles isDirty when formData changes', async () => {
    (getCurrentUser as jest.Mock).mockResolvedValueOnce(mockUser);
    const { result } = renderHook(() => useUserProfile());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isDirty).toBe(false);

    act(() => {
      result.current.handleInputChange({
        target: { name: 'name', value: 'New Name' },
      } as unknown as ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.formData.name).toBe('New Name');
    expect(result.current.isDirty).toBe(true);
  });

  it('saves data successfully and shows success alert', async () => {
    (getCurrentUser as jest.Mock).mockResolvedValueOnce(mockUser);
    (UserService.updateUser as jest.Mock).mockResolvedValueOnce({
      ...mockUser,
      name: 'Updated Name',
    });

    const { result } = renderHook(() => useUserProfile());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.handleInputChange({
        target: { name: 'name', value: 'Updated Name' },
      } as unknown as ChangeEvent<HTMLInputElement>);
    });

    await act(async () => {
      await result.current.handleSave();
    });

    expect(UserService.updateUser).toHaveBeenCalledWith(1, {
      name: 'Updated Name',
      email: 'rostyslav@example.com',
    });
    expect(result.current.user?.name).toBe('Updated Name');
    expect(result.current.alert).toEqual({
      variant: 'success',
      message: 'Your profile has been updated successfully.',
    });
  });

  it('handles save failure and shows error alert', async () => {
    (getCurrentUser as jest.Mock).mockResolvedValueOnce(mockUser);
    (UserService.updateUser as jest.Mock).mockRejectedValueOnce(new Error('Update failed'));

    const { result } = renderHook(() => useUserProfile());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.handleInputChange({
        target: { name: 'name', value: 'Updated Name' },
      } as unknown as ChangeEvent<HTMLInputElement>);
    });

    await act(async () => {
      await result.current.handleSave();
    });

    expect(result.current.alert).toEqual({
      variant: 'error',
      message: 'Failed to update profile. Please try again.',
    });
  });

  it('resets formData and clears alert on cancel', async () => {
    (getCurrentUser as jest.Mock).mockResolvedValueOnce(mockUser);
    const { result } = renderHook(() => useUserProfile());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.setAlert({ variant: 'error', message: 'Some error' });
      result.current.handleInputChange({
        target: { name: 'name', value: 'Oops' },
      } as unknown as ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.isDirty).toBe(true);

    act(() => {
      result.current.handleCancel();
    });

    expect(result.current.formData.name).toBe('Rostyslav');
    expect(result.current.isDirty).toBe(false);
    expect(result.current.alert).toBeNull();
  });

  it('clears alert when handleInputChange is called while alert is set', async () => {
    (getCurrentUser as jest.Mock).mockResolvedValueOnce(mockUser);
    const { result } = renderHook(() => useUserProfile());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.setAlert({ variant: 'error', message: 'Some error' });
    });
    expect(result.current.alert).not.toBeNull();

    act(() => {
      result.current.handleInputChange({
        target: { name: 'name', value: 'New Name' },
      } as unknown as ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.alert).toBeNull();
  });

  it('does nothing when handleSave is called and form is not dirty', async () => {
    (getCurrentUser as jest.Mock).mockResolvedValueOnce(mockUser);
    const { result } = renderHook(() => useUserProfile());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.handleSave();
    });

    expect(UserService.updateUser).not.toHaveBeenCalled();
  });

  it('does nothing when handleCancel is called and user is null', async () => {
    (getCurrentUser as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    const { result } = renderHook(() => useUserProfile());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.user).toBeNull();

    act(() => {
      result.current.handleCancel();
    });

    expect(result.current.formData).toEqual({ name: '', email: '' });
  });
});

import { useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { UserService, getCurrentUser } from '@/services/user-service';
import type { UserProfile, UpdateUserRequest } from '@/types/user';
import { useReduxState } from '@/hooks/use-redux-state';

type AlertState = {
  variant: 'success' | 'error';
  message: string;
} | null;

export function useUserProfile() {
  const [user, setUser] = useReduxState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useReduxState(true);

  const [formData, setFormData] = useReduxState<UpdateUserRequest>({ name: '', email: '' });
  const [isSaving, setIsSaving] = useReduxState(false);

  const [alert, setAlert] = useReduxState<AlertState>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
        setFormData({ name: userData.name || '', email: userData.email || '' });
      } catch (error) {
        console.error('Failed to load profile', error);
        setAlert({ variant: 'error', message: 'Failed to load profile data.' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [setAlert, setFormData, setIsLoading, setUser]);

  const isDirty = user ? formData.name !== user.name || formData.email !== user.email : false;

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (alert) setAlert(null);
  };

  const handleSave = async () => {
    if (!user || !isDirty) return;
    setIsSaving(true);
    setAlert(null);

    try {
      const updatedUser = await UserService.updateUser(user.id, formData);
      setUser((prev) => (prev ? { ...prev, ...updatedUser } : null));
      setAlert({ variant: 'success', message: 'Your profile has been updated successfully.' });
    } catch (error) {
      console.error('Update failed', error);
      setAlert({ variant: 'error', message: 'Failed to update profile. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({ name: user.name, email: user.email });
      setAlert(null);
    }
  };

  return {
    user,
    isLoading,
    formData,
    isSaving,
    isDirty,
    alert,
    setAlert,
    handleInputChange,
    handleSave,
    handleCancel,
  };
}

import { useState } from 'react';
import { PageWrapper } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { ChangePasswordModal } from '@/components/auth/change-password/change-password-modal';
import { ProfileHeader } from '@/components/profile/profile-header';
import { BrandMemberships } from '@/components/profile/brand-memberships';
import { DeleteAccountSection } from '@/components/profile/delete-account-section';
import { useUserProfile } from '@/hooks/use-user-profile';

export default function UserProfilePage() {
  const {
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
  } = useUserProfile();

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  if (isLoading)
    return <div className="p-8 text-neutral-500 flex justify-center">Loading profile...</div>;
  if (!user)
    return <div className="p-8 text-error-500 flex justify-center">Profile not found.</div>;

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-8">My Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 flex flex-col gap-8">
            <ProfileHeader name={user.name} createdAt={user.created_at} />
            <BrandMemberships memberships={user.memberships} />
          </div>

          <div className="lg:col-span-8 flex flex-col gap-10">
            <div className="flex flex-col gap-6">
              {alert && (
                <Alert
                  variant={alert.variant}
                  title={alert.variant === 'success' ? 'Success' : 'Error'}
                  onClose={() => setAlert(null)}
                  className="max-w-lg"
                >
                  {alert.message}
                </Alert>
              )}

              <div className="grid grid-cols-1 gap-6 max-w-lg">
                <Input
                  label="Name"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                />
                <Input
                  label="Email"
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Button
                  variant="outline"
                  className="bg-transparent text-neutral-700 hover:bg-neutral-50"
                  onClick={() => setIsPasswordModalOpen(true)}
                >
                  Change password
                </Button>
              </div>

              <div className="flex items-center justify-end gap-3 max-w-lg pt-4">
                <Button variant="outline" onClick={handleCancel} disabled={!isDirty || isSaving}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  disabled={!isDirty || isSaving}
                  isLoading={isSaving}
                >
                  Save changes
                </Button>
              </div>
            </div>

            <hr className="border-neutral-200 max-w-lg" />

            <DeleteAccountSection userId={user.id} />
          </div>
        </div>
      </div>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={() =>
          setAlert({ variant: 'success', message: 'Your password has been changed.' })
        }
      />
    </PageWrapper>
  );
}

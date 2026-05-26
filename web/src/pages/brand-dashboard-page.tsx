import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert, Button, Spinner } from '@/components/ui';
import { Container, PageWrapper } from '@/components/layout';
import { BrandView } from '@/components/brands/brand-view';
import { BrandEditModal } from '@/components/brands/brand-edit-modal';
import { CreateEventModal } from '@/components/events/create-event-modal';
import { useAuth } from '@/hooks/use-auth';
import { useBrandDashboard } from '@/hooks/use-brand-dashboard';
import { useCreateEvent } from '@/hooks/use-create-event';

export function BrandDashboardPage() {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    brand,
    isLoading,
    error,
    memberships,
    membershipsLoading,
    isEditOpen,
    editFields,
    saveError,
    setIsEditOpen,
    handleFieldChange,
    handleSave,
  } = useBrandDashboard(id);

  const createEvent = useCreateEvent(Number(id) || 0, () => window.location.reload());

  const currentUserMembership = memberships.find((m) => m.user.id === user?.id);
  const canManage =
    currentUserMembership?.role === 'owner' || currentUserMembership?.role === 'manager';

  useEffect(() => {
    if (!membershipsLoading && !isLoading && !canManage) {
      navigate(`/brands/${id}`, { replace: true });
    }
  }, [membershipsLoading, canManage, isLoading, id, navigate]);

  if (isLoading || membershipsLoading) {
    return (
      <PageWrapper>
        <div className="flex h-96 items-center justify-center">
          <Spinner size="lg" />
        </div>
      </PageWrapper>
    );
  }

  if (!canManage) return null;

  if (error || !brand) {
    return (
      <PageWrapper>
        <Container className="py-12">
          <Alert variant="error" title="Error">
            {error ?? 'Brand does not exist.'}
          </Alert>
        </Container>
      </PageWrapper>
    );
  }

  return (
    <>
      <BrandView
        brand={brand}
        memberships={memberships}
        membershipsLoading={membershipsLoading}
        canManage={canManage}
        onEdit={() => setIsEditOpen(true)}
        extraActions={
          <Button size="sm" onClick={createEvent.openModal}>
            + New event
          </Button>
        }
      />

      <BrandEditModal
        isOpen={isEditOpen}
        fields={editFields}
        onClose={() => setIsEditOpen(false)}
        onChange={handleFieldChange}
        onSave={handleSave}
      />

      {saveError && (
        <Alert variant="error" title="Failed to save">
          {saveError}
        </Alert>
      )}

      <CreateEventModal
        isOpen={createEvent.isOpen}
        fields={createEvent.fields}
        isSaving={createEvent.isSaving}
        saveError={createEvent.saveError}
        onClose={createEvent.closeModal}
        onSave={createEvent.handleSave}
        onChange={createEvent.handleFieldChange}
      />
    </>
  );
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert, Button, Spinner } from '@/components/ui';
import { Container, PageWrapper } from '@/components/layout';
import { BrandView } from '@/components/brands/brand-view';
import { BrandEditModal } from '@/components/brands/brand-edit-modal';
import { InviteMemberModal } from '@/components/brands/invite-member-modal';
import { CreateEventModal } from '@/components/events/create-event-modal';
import { useBrandDashboard } from '@/hooks/use-brand-dashboard';
import { useCreateEvent } from '@/hooks/use-create-event';
import { useBrandAccess } from '@/hooks/use-brand-access';
import { BrandMembershipsService } from '@/services/brand-memberships-service';
import type { Membership } from '@/types/brand-memberships';

export function BrandDashboardPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const brandId = Number(id);

  const { canManage, isLoading: accessLoading } = useBrandAccess(id);

  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [membershipsLoading, setMembershipsLoading] = useState(false);

  useEffect(() => {
    if (!canManage || Number.isNaN(brandId)) return;

    let isMounted = true;

    const run = async () => {
      setMembershipsLoading(true);
      try {
        const data = await BrandMembershipsService.getBrandMemberships(brandId, {});
        if (isMounted) setMemberships(data.data);
      } catch {
        if (isMounted) setMemberships([]);
      } finally {
        if (isMounted) setMembershipsLoading(false);
      }
    };

    void run();

    return () => {
      isMounted = false;
    };
  }, [canManage, brandId]);

  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const {
    brand,
    isLoading,
    error,
    isEditOpen,
    editFields,
    saveError,
    setIsEditOpen,
    handleFieldChange,
    handleSave,
  } = useBrandDashboard(id);

  const createEvent = useCreateEvent(brandId, () => window.location.reload());

  useEffect(() => {
    if (!accessLoading && !canManage) {
      navigate(`/brands/${id}`, { replace: true });
    }
  }, [accessLoading, canManage, id, navigate]);

  if (accessLoading || isLoading) {
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
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setIsInviteOpen(true)}>
              + Invite member
            </Button>
            <Button size="sm" onClick={createEvent.openModal}>
              + New event
            </Button>
          </div>
        }
      />

      <BrandEditModal
        isOpen={isEditOpen}
        fields={editFields}
        onClose={() => setIsEditOpen(false)}
        onChange={handleFieldChange}
        onSave={handleSave}
      />

      <InviteMemberModal
        brandId={brandId}
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
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

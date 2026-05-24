import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert, Spinner } from '@/components/ui';
import { Container, PageWrapper } from '@/components/layout';
import { BrandView } from '@/components/brands/brand-view';
import { useAuth } from '@/hooks/use-auth';
import { useBrandDashboard } from '@/hooks/use-brand-dashboard';

export function BrandPublicPage() {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { brand, isLoading, error, memberships, membershipsLoading } = useBrandDashboard(id);

  const currentUserMembership = memberships.find((m) => m.user.id === user?.id);
  const canManage = currentUserMembership?.role === 'owner' ||
    currentUserMembership?.role === 'manager';

  useEffect(() => {
    if (!membershipsLoading && !isLoading && canManage) {
      navigate(`/dashboard/brands/${id}`, { replace: true });
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
    <BrandView
      brand={brand}
      memberships={memberships}
      membershipsLoading={membershipsLoading}
      canManage={false}
      onEdit={() => {}}
    />
  );
}

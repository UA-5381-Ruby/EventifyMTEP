import { MainLayout } from '@/components/layout/main-layout';
import { PageWrapper } from '@/components/layout';

import { Header } from '@/components/layout/header/header.tsx';
export function SuperAdminPage() {
  return (
    <PageWrapper>
      <MainLayout>
        <div className="p-4">
          <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
          <p>Welcome, Super Admin!</p>
        </div>
      </MainLayout>
    </PageWrapper>
  );
}

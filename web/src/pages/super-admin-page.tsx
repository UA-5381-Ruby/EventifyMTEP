import { Header } from '@/components/layout/header';
import { MainLayout } from '@/components/layout/main-layout';

export function SuperAdminPage() {
  return (
    <MainLayout>
      <div className="p-4">
        <Header />
        <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
        <p>Welcome, Super Admin!</p>
      </div>
    </MainLayout>
  );
}
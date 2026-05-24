import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UIPreview } from '@/pages/ui-preview.tsx';

import ProtectedRoute from '@/components/protected-route';
import { LoginPage } from '@/pages/login-page';
import { RegistrationPage } from '@/pages/registration-page.tsx';
import { EventListPage } from '@/pages/event-list-page.tsx';
import { NotFoundPage } from '@/pages/not-found-page.tsx';
import { BrandGuard } from '@/components/brand-guard.tsx';
import { CreateBrandPage } from '@/pages/admin/create-brand-page.tsx';
import { DashboardPage } from '@/pages/admin/dashboard-page.tsx';
import { AdminLayout } from '@/components/layout/admin-layout.tsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/test/preview" element={<UIPreview />} />

        <Route path="/" element={<Navigate to="/events" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />

        <Route path="/events" element={<EventListPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<BrandGuard />}>
            <Route element={<AdminLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              {/*<Route path="/dashboard/events" element={<EventsPage />} />*/}
              {/*<Route path="/dashboard/members" element={<MembersPage />} />*/}
            </Route>
          </Route>

          <Route path="/create-brand" element={<CreateBrandPage />} />

          <Route
            path="/profile"
            element={<h1 className="bg-emerald-500">This is a profile page.</h1>}
          />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;

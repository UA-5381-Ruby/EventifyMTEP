import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UIPreview } from '@/pages/ui-preview.tsx';
import ProtectedRoute from '@/components/protected-route';
import { LoginPage } from '@/pages/login-page';
import { RegistrationPage } from '@/pages/registration-page.tsx';
import { EventListPage } from '@/pages/event-list-page.tsx';
import { EventDetailPage } from '@/pages/event-detail-page';
import { NotFoundPage } from '@/pages/not-found-page.tsx';
import UserProfilePage from '@/pages/user-profile-page';
import { Dashboard } from '@/pages/dashboard.tsx';
import { BrandPublicPage } from '@/pages/brand-public-page.tsx';
import { BrandDashboardPage } from '@/pages/brand-dashboard-page.tsx';
import { SuperAdminPage } from '@/pages/super-admin-page.tsx';
import { BrandDiscoverPage } from '@/pages/brand-discover-page.tsx';
import { MyBrandsPage } from '@/pages/my-brands-page.tsx';
import { AcceptInvitationPage } from '@/pages/accept-invitation-page.tsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/test/preview" element={<UIPreview />} />
        <Route path="/" element={<Navigate to="/events" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />

        <Route path="/events" element={<EventListPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />

        <Route path="/brands/:id" element={<BrandPublicPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/superadmin" element={<SuperAdminPage />} />
          <Route path="/brands" element={<BrandDiscoverPage />} />
          <Route path="/my-brands" element={<MyBrandsPage />} />

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/brands/:id" element={<BrandDashboardPage />} />
          <Route path="/accept-invitation" element={<AcceptInvitationPage />} />

          <Route path="/profile/settings" element={<UserProfilePage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;

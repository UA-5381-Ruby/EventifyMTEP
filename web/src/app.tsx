import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { BrandProvider } from '@/contexts/brand-provider';

import ProtectedRoute from '@/components/protected-route';
import { BrandGuard } from '@/components/brand-guard.tsx';
import { AdminLayout } from '@/components/layout/admin-layout.tsx';
import { SuperAdminRoute } from '@/components/super-admin-route';
import { BrandManagerRoute } from '@/components/brand-admin-route';

import { UIPreview } from '@/pages/ui-preview.tsx';
import { LoginPage } from '@/pages/login-page';
import { RegistrationPage } from '@/pages/registration-page.tsx';
import { VerifyEmailPage } from '@/pages/verify-email-page.tsx';
import { ForgotPasswordPage } from '@/pages/forgot-password-page.tsx';
import { ResetPasswordPage } from '@/pages/reset-password-page.tsx';
import { EventListPage } from '@/pages/event-list-page.tsx';
import ActivityLogPage from '@/pages/super-admin-events-page.tsx';
import { EventDetailPage } from '@/pages/event-detail-page';
import { NotFoundPage } from '@/pages/not-found-page.tsx';
import { BrandPublicPage } from '@/pages/brand-public-page.tsx';

import { Dashboard } from '@/pages/dashboard.tsx';
import { BrandDashboardPage } from '@/pages/brand-dashboard-page.tsx';
import { SuperAdminPage } from '@/pages/super-admin-page.tsx';
import SuperAdminActivityPage from '@/pages/super-admin-activity-page.tsx';
import { BrandDiscoverPage } from '@/pages/brand-discover-page.tsx';
import { MyBrandsPage } from '@/pages/my-brands-page.tsx';
import { MyTicketsPage } from '@/pages/my-tickets-page.tsx';
import { AcceptInvitationPage } from '@/pages/accept-invitation-page.tsx';
import UserProfilePage from '@/pages/user-profile-page';

import { DashboardPage } from '@/pages/admin/dashboard-page.tsx';
import EventsPage from '@/pages/admin/events-page.tsx';
import { CreateEventPage } from '@/pages/admin/create-event-page.tsx';
import { EventDetailPage as AdminEventDetailPage } from '@/pages/admin/event-detail-page.tsx';
import { MembersPage } from '@/pages/admin/members-page.tsx';
import { EditBrandPage } from '@/pages/admin/edit-brand-page.tsx';
import { CreateBrandPage } from '@/pages/admin/create-brand-page.tsx';

function App() {
  return (
    <BrandProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/test/preview" element={<UIPreview />} />
          <Route path="/" element={<Navigate to="/events" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/events" element={<EventListPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/brands/:id" element={<BrandPublicPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            {/* Super Admin Routes */}
            <Route element={<SuperAdminRoute />}>
              <Route path="/superadmin" element={<SuperAdminPage />} />
              <Route path="/activity-log" element={<SuperAdminActivityPage />} />
              <Route path="/logs" element={<ActivityLogPage />} />
            </Route>

            {/* General User Routes */}
            <Route path="/brands" element={<BrandDiscoverPage />} />
            <Route path="/my-brands" element={<MyBrandsPage />} />
            <Route path="/my-tickets" element={<MyTicketsPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/accept-invitation" element={<AcceptInvitationPage />} />
            <Route path="/profile/settings" element={<UserProfilePage />} />

            {/* Brand Manager Routes */}
            <Route element={<BrandManagerRoute />}>
              <Route path="/dashboard/brands/:id" element={<BrandDashboardPage />} />
            </Route>

            {/* Brand Admin Guarded Routes */}
            <Route element={<BrandGuard />}>
              <Route path="/create-brand" element={<CreateBrandPage />} />
              <Route element={<AdminLayout />}>
                <Route path="/dashboard/overview" element={<DashboardPage />} />
                <Route path="/dashboard/events" element={<EventsPage />} />
                <Route path="/dashboard/events/create" element={<CreateEventPage />} />
                <Route path="/dashboard/events/:id" element={<AdminEventDetailPage />} />
                <Route path="/dashboard/members" element={<MembersPage />} />
                <Route path="/dashboard/settings" element={<EditBrandPage />} />
              </Route>
            </Route>
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </BrandProvider>
  );
}

export default App;

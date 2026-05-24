import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UIPreview } from '@/pages/ui-preview.tsx';

import ProtectedRoute from '@/components/protected-route';
import { LoginPage } from '@/pages/login-page';
import { RegistrationPage } from '@/pages/registration-page.tsx';
import { EventListPage } from '@/pages/event-list-page.tsx';
import { NotFoundPage } from '@/pages/not-found-page.tsx';
import { Dashboard } from '@/pages/dashboard.tsx';
import { BrandPublicPage } from '@/pages/brand-public-page.tsx';
import { BrandListPage } from '@/pages/brand-list-page.tsx';
import { BrandDashboardPage } from '@/pages/brand-dashboard-page.tsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/test/preview" element={<UIPreview />} />

        <Route path="/" element={<Navigate to="/events" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />

        <Route path="/events" element={<EventListPage />} />

        <Route path="/brands/:id" element={<BrandPublicPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/brands" element={<BrandListPage />} />

          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/dashboard/brands/:id" element={<BrandDashboardPage />} />

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

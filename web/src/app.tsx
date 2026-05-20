import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UIPreview } from '@/pages/ui-preview.tsx';

import ProtectedRoute from '@/components/protected-route';
import { LoginPage } from '@/pages/login-page';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/test/preview" element={<UIPreview />} />

        <Route path="/" element={<h1 className="bg-emerald-500">This is an event list page.</h1>} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/register"
          element={<h1 className="bg-emerald-500">This is a register page.</h1>}
        />

        <Route element={<ProtectedRoute />}>
          <Route
            path="/dashboard"
            element={<h1 className="bg-emerald-500">This is a dashboard.</h1>}
          />

          <Route
            path="/profile"
            element={<h1 className="bg-emerald-500">This is a profile page.</h1>}
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

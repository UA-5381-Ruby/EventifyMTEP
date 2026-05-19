import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UIPreview } from '@/pages/UIPreview.tsx';

import ProtectedRoute from '@/components/ProtectedRoute';
import { LoginPage } from '@/pages/LoginPage';
import { EventListPage } from '@/pages/EventListPage.tsx';
import { Header } from '@/components/layout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/test/preview" element={<UIPreview />} />

        <Route
          path="/"
          element={
            <>
              <Header />
              <h1 className="bg-emerald-500">This is an event list page.</h1>
            </>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/register"
          element={<h1 className="bg-emerald-500">This is a register page.</h1>}
        />

        <Route path="/events" element={<EventListPage />} />

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

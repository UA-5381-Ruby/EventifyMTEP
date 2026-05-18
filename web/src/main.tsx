import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import App from './App.tsx';

import AuthService from './services/authService.ts';

// This fragment validates token presence before rendering
// so that protected routes always stay in the correct stay.
// Do not update unless necessary.
AuthService.init().finally(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});

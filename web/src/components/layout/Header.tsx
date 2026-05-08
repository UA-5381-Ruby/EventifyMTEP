import { Container } from './Container';
import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/80 backdrop-blur-sm">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 font-heading text-xl font-bold text-primary-600"
          >
            <span className="text-2xl">🎉</span>
            Eventify
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/events"
              className="text-sm font-medium text-neutral-600 hover:text-primary-600 transition-colors"
            >
              Events
            </Link>
            <Link
              to="/about"
              className="text-sm font-medium text-neutral-600 hover:text-primary-600 transition-colors"
            >
              About
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-neutral-700 hover:text-primary-600 transition-colors"
            >
              Log in
            </Link>

            <Link
              to="/register"
              className="inline-flex items-center px-4 py-2 rounded-md bg-primary-500 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
      </Container>
    </header>
  );
}

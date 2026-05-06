import { Container } from './Container'

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/80 backdrop-blur-sm">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <a href="/" className="flex items-center gap-2 font-heading text-xl font-bold text-primary-600">
            <span className="text-2xl">🎉</span>
            Eventify
          </a>

          <nav className="hidden md:flex items-center gap-6">
            <a href="/events" className="text-sm font-medium text-neutral-600 hover:text-primary-600 transition-colors">
              Events
            </a>
            <a href="/about" className="text-sm font-medium text-neutral-600 hover:text-primary-600 transition-colors">
              About
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="text-sm font-medium text-neutral-700 hover:text-primary-600 transition-colors"
            >
              Log in
            </a>
            
            <a
              href="/register"
              className="inline-flex items-center px-4 py-2 rounded-md bg-primary-500 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
            >
              Sign up
            </a>
          </div>
        </div>
      </Container>
    </header>
  )
}
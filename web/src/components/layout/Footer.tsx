import { Container } from './Container'

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white py-8 mt-auto">
      <Container>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-neutral-500">
            © {new Date().getFullYear()} Eventify. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="/privacy" className="text-sm text-neutral-500 hover:text-primary-600 transition-colors">Privacy</a>
            <a href="/terms" className="text-sm text-neutral-500 hover:text-primary-600 transition-colors">Terms</a>
          </div>
        </div>
      </Container>
    </footer>
  )
}
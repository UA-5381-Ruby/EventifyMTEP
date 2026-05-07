import { Header } from './Header'
import { Footer } from './Footer'
import { cn } from '../../lib/utils'

interface PageWrapperProps {
  children: React.ReactNode
  className?: string
}

export function PageWrapper({ children, className }: PageWrapperProps) {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <Header />
      <main className={cn('flex-1', className)}>
        {children}
      </main>
      <Footer />
    </div>
  )
}
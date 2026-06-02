import React from 'react';
import { Header } from './header/header.tsx';
import { Footer } from './footer';
import { cn } from '@/lib/utils.ts';
import { Sidebar } from '@/components/layout/sidebar/sidebar.tsx';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function PageWrapper({ children, className }: PageWrapperProps) {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className={cn('flex-1', className)}>{children}</main>
      </div>
      <Footer />
    </div>
  );
}

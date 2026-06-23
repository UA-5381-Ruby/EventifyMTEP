import { useContext } from 'react';
import { BrandContext } from '@/contexts/brand-context';
import type { BrandContextType } from '@/contexts/brand-context';

export function useBrandContext(): BrandContextType {
  const context = useContext(BrandContext);

  if (context === undefined) {
    throw new Error('useBrandContext must be used within a BrandProvider');
  }

  return context;
}

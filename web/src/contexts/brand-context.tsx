import { createContext, useContext } from 'react';
import type { Brand } from '@/types/brand';
import type { Membership } from '@/types/brand-memberships';

export interface BrandContextType {
  brand: Brand | null;
  hasBrand: boolean;
  memberships: Membership[];
  isLoading: boolean;
  refreshBrand: (brandId?: number) => Promise<void>;
}

export const BrandContext = createContext<BrandContextType | undefined>(undefined);

export const useBrand = () => {
  const context = useContext(BrandContext);
  if (context === undefined) {
    throw new Error('useBrand must be used within a BrandProvider');
  }
  return context;
};
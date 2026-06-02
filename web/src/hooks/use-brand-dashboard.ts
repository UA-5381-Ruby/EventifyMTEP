import { useState, useEffect } from 'react';
import { brandsService } from '@/services/brands-service';
import type { BrandWithEvents } from '@/types/brand';
import type { BrandEditFields } from '@/components/brands/brand-edit-modal';
import { EMPTY_BRAND_FIELDS } from '@/constants/brand.constants.ts';

export interface UseBrandDashboardResult {
  brand: BrandWithEvents | null;
  isLoading: boolean;
  error: string | null;
  isEditOpen: boolean;
  editFields: BrandEditFields;
  saveError: string | null;
  setIsEditOpen: (open: boolean) => void;
  handleFieldChange: (field: keyof BrandEditFields, value: string) => void;
  handleSave: () => Promise<void>;
}

export function useBrandDashboard(id: string | undefined): UseBrandDashboardResult {
  const [brand, setBrand] = useState<BrandWithEvents | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editFields, setEditFields] = useState<BrandEditFields>(EMPTY_BRAND_FIELDS);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetch = async () => {
      if (!id) {
        setError('Missing brand ID');
        setIsLoading(false);
        return;
      }

      try {
        const b = await brandsService.getBrandById(Number(id));
        if (!isMounted) return;
        setBrand(b);
        setEditFields({
          name: b.name,
          description: b.description || '',
          logo_url: b.logo_url || '',
          subdomain: b.subdomain,
          primary_color: b.primary_color || '',
          secondary_color: b.secondary_color || '',
        });
      } catch {
        if (isMounted) setError('Brand not found.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetch();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleFieldChange = (field: keyof BrandEditFields, value: string) => {
    setEditFields((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!brand) return;
    setSaveError(null);
    try {
      const updated = await brandsService.updateBrand(brand.id, editFields);
      setBrand((prev) => (prev ? { ...prev, ...updated } : null));
      setIsEditOpen(false);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Update failed.');
    }
  };

  return {
    brand,
    isLoading,
    error,
    isEditOpen,
    editFields,
    saveError,
    setIsEditOpen,
    handleFieldChange,
    handleSave,
  };
}

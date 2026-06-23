import { useState, useEffect } from 'react';
import { brandsService } from '@/services/brands-service';
import type { BrandWithEvents, UpdateBrandRequest } from '@/types/brand';
import type { BrandEditFields } from '@/components/brands/brand-edit-modal';

export interface UseBrandDashboardResult {
  brand: BrandWithEvents | null;
  isLoading: boolean;
  error: string | null;
  isEditOpen: boolean;
  editFields: BrandEditFields;
  saveError: string | null;
  setIsEditOpen: (open: boolean) => void;
  handleFieldChange: (field: keyof BrandEditFields, value: string | File | null) => void;
  handleSave: () => Promise<void>;
}

export function useBrandDashboard(id: string | undefined): UseBrandDashboardResult {
  const [brand, setBrand] = useState<BrandWithEvents | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [editFields, setEditFields] = useState<BrandEditFields>({
    name: '',
    description: '',
    subdomain: '',
    primary_color: '',
    secondary_color: '',
    logo: null,
    logo_url: '',
  });

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
          subdomain: b.subdomain,
          primary_color: b.primary_color || '',
          secondary_color: b.secondary_color || '',
          logo: null,
          logo_url: b.logo_url || '',
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

  const handleFieldChange = (field: keyof BrandEditFields, value: string | File | null) => {
    setEditFields((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!brand) return;
    setSaveError(null);
    try {
      const payload: UpdateBrandRequest = {
        name: editFields.name,
        description: editFields.description,
        subdomain: editFields.subdomain,
        primary_color: editFields.primary_color,
        secondary_color: editFields.secondary_color,
      };

      if (editFields.logo) {
        payload.logo = editFields.logo;
      }

      const updated = await brandsService.updateBrand(brand.id, payload);

      setBrand((prev) => (prev ? { ...prev, ...updated } : null));

      setEditFields((prev) => ({
        ...prev,
        logo: null,
        logo_url: updated.logo_url || '',
      }));

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

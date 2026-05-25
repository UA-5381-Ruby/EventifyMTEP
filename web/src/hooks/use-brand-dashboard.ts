import { useState, useEffect } from 'react';
import { brandsService } from '@/services/brands-service';
import { BrandMembershipsService } from '@/services/brand-memberships-service';
import type { BrandWithEvents } from '@/types/brand';
import type { Membership } from '@/types/brand-memberships';
import type { BrandEditFields } from '@/components/brands/brand-edit-modal';

interface UseBrandDashboardResult {
  brand: BrandWithEvents | null;
  isLoading: boolean;
  error: string | null;
  memberships: Membership[];
  membershipsLoading: boolean;
  isEditOpen: boolean;
  editFields: BrandEditFields;
  saveError: string | null;
  setIsEditOpen: (open: boolean) => void;
  handleFieldChange: (field: keyof BrandEditFields, value: string) => void;
  handleSave: () => Promise<void>;
}

const EMPTY_FIELDS: BrandEditFields = {
  name: '',
  description: '',
  logo_url: '',
  subdomain: '',
  primary_color: '',
  secondary_color: '',
};

export function useBrandDashboard(id: string | undefined): UseBrandDashboardResult {
  const [brand, setBrand] = useState<BrandWithEvents | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [membershipsLoading, setMembershipsLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editFields, setEditFields] = useState<BrandEditFields>(EMPTY_FIELDS);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchAll = async () => {
      if (!id) {
        setError('Missing brand ID');
        setIsLoading(false);
        return;
      }

      const brandId = Number(id);
      const [brandResult, membershipsResult] = await Promise.allSettled([
        brandsService.getBrandById(brandId),
        BrandMembershipsService.getBrandMemberships(brandId, {}),
      ]);

      if (!isMounted) return;

      if (brandResult.status === 'fulfilled') {
        const b = brandResult.value;
        setBrand(b);
        setEditFields({
          name: b.name,
          description: b.description || '',
          logo_url: b.logo_url || '',
          subdomain: b.subdomain,
          primary_color: b.primary_color || '',
          secondary_color: b.secondary_color || '',
        });
      } else {
        setError('Brand not found.');
      }

      if (membershipsResult.status === 'fulfilled') {
        setMemberships(membershipsResult.value.data);
      }

      setIsLoading(false);
      setMembershipsLoading(false);
    };

    fetchAll();
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
      const message = error instanceof Error ? error.message : 'Update failed.';
      setSaveError(message);
    }
  };

  return {
    brand,
    isLoading,
    error,
    memberships,
    membershipsLoading,
    isEditOpen,
    editFields,
    saveError,
    setIsEditOpen,
    handleFieldChange,
    handleSave,
  };
}

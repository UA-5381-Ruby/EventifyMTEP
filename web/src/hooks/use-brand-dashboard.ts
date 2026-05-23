import { useState, useEffect } from 'react';
import { brandsService } from '@/services/brands-service';
import { BrandMembershipsService } from '@/services/brand-memberships-service';
import type { BrandWithEvents } from '@/types/brand';
import type { Membership } from '@/types/brand-memberships';

interface UseBrandDashboardResult {
  brand: BrandWithEvents | null;
  isLoading: boolean;
  error: string | null;
  memberships: Membership[];
  membershipsLoading: boolean;
  isEditOpen: boolean;
  editName: string;
  editDesc: string;
  setIsEditOpen: (open: boolean) => void;
  setEditName: (name: string) => void;
  setEditDesc: (desc: string) => void;
  handleSave: () => Promise<void>;
}

export function useBrandDashboard(id: string | undefined): UseBrandDashboardResult {
  const [brand, setBrand] = useState<BrandWithEvents | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [membershipsLoading, setMembershipsLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

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
        setBrand(brandResult.value);
        setEditName(brandResult.value.name);
        setEditDesc(brandResult.value.description || '');
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

  const handleSave = async () => {
    if (!brand) return;
    try {
      const updated = await brandsService.updateBrand(brand.id, {
        name: editName,
        description: editDesc,
      });
      setBrand((prev) => (prev ? { ...prev, ...updated } : null));
      setIsEditOpen(false);
    } catch {
      alert('Update failed.');
    }
  };

  return {
    brand,
    isLoading,
    error,
    memberships,
    membershipsLoading,
    isEditOpen,
    editName,
    editDesc,
    setIsEditOpen,
    setEditName,
    setEditDesc,
    handleSave,
  };
}

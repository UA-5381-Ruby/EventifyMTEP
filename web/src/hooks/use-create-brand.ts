import { useState } from 'react';
import { brandsService } from '@/services/brands-service';
import type { CreateBrandRequest } from '@/types/brand';

export function useCreateBrand(onSuccess?: () => void) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [fields, setFields] = useState<CreateBrandRequest>({
    name: '',
    subdomain: '',
    description: '',
    logo: null,
    primary_color: '#6366f1',
    secondary_color: '#a855f7',
  });

  const openModal = () => setIsOpen(true);

  const closeModal = () => {
    setIsOpen(false);
    setSaveError(null);
    setFields({
      name: '',
      subdomain: '',
      description: '',
      logo: null,
      primary_color: '#6366f1',
      secondary_color: '#a855f7',
    });
  };

  const handleFieldChange = (field: keyof CreateBrandRequest, value: string | File | null) => {
    setFields((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      await brandsService.createBrand(fields);
      closeModal();
      onSuccess?.();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to create brand');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isOpen,
    fields,
    isSaving,
    saveError,
    openModal,
    closeModal,
    handleFieldChange,
    handleSave,
  };
}

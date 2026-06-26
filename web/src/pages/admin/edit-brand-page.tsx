import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { brandsService } from '@/services/brands-service';
import { useBrandContext } from '@/hooks/use-brand-context';
import { Card } from '@/components/ui';
import { BrandForm } from '../../components/admin/brand-form.tsx';
import type { Brand } from '@/types/brand';

export const EditBrandPage = () => {
  const navigate = useNavigate();
  const { brand } = useOutletContext<{ brand: Brand }>();
  const { refreshBrand } = useBrandContext();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: brand?.name || '',
    subdomain: brand?.subdomain || '',
    description: brand?.description || '',
    logo_url: brand?.logo_url || '',
    primary_color: brand?.primary_color || '#000000',
    secondary_color: brand?.secondary_color || '#ffffff',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleColorChange = (field: 'primary_color' | 'secondary_color', value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await brandsService.updateBrand(brand.id, formData);
      await refreshBrand(brand.id);
      navigate('/dashboard/overview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update brand');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex justify-center items-start pt-4 pb-20 animate-in fade-in duration-700">
      <div className="w-full max-w-2xl px-4">
        <Card className="p-10 bg-white shadow-none border border-neutral-200 rounded-none">
          <h1 className="text-2xl font-bold mb-10 text-black tracking-tight">
            Edit Brand Settings
          </h1>
          <BrandForm
            formData={formData}
            isLoading={isLoading}
            error={error}
            onChange={handleChange}
            onColorChange={handleColorChange}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/dashboard/overview')}
            submitLabel="Save Changes"
          />
        </Card>
      </div>
    </div>
  );
};

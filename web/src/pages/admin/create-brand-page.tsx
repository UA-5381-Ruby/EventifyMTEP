import React from 'react';
import { useNavigate } from 'react-router-dom';
import { brandsService } from '@/services/brands-service';
import { Card } from '@/components/ui';
import { BrandForm } from '../../components/admin/brand-form.tsx';
import { useReduxState } from '@/hooks/use-redux-state';

export const CreateBrandPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useReduxState(false);
  const [error, setError] = useReduxState<string | null>(null);
  const [formData, setFormData] = useReduxState({
    name: '',
    subdomain: '',
    description: '',
    logo_url: '',
    primary_color: '#333333',
    secondary_color: '#ffffff',
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
      await brandsService.createBrand(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create brand');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex justify-center py-10">
      <div className="max-w-3xl mx-auto animate-in fade-in duration-700">
        <Card className="w-full p-10 bg-white shadow-none border border-neutral-200 rounded-none">
          <h1 className="text-2xl font-bold mb-8 text-black">Create Brand</h1>
          <BrandForm
            formData={formData}
            isLoading={isLoading}
            error={error}
            onChange={handleChange}
            onColorChange={handleColorChange}
            onSubmit={handleSubmit}
            onCancel={() => navigate(-1)}
            submitLabel="Create Brand"
          />
        </Card>
      </div>
    </div>
  );
};

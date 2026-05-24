import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { brandsService } from '@/services/brands-service';
import { Button, Input, Textarea, Card, Alert, Spinner } from '@/components/ui';

export const CreateBrandPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
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
    <div className="min-h-screen bg-[#F9F9F9] flex items-start justify-center pt-20 px-4">
      <Card className="w-full max-w-[700px] p-10 bg-white shadow-none border border-gray-100 rounded-lg">
        <h1 className="text-2xl font-bold mb-8 text-black">Create Brand</h1>

        {error && (
          <Alert variant="warning" className="mb-6">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-sm text-gray-500">Name</label>
            <Input
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="rounded-none border-gray-300 focus:border-black transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-gray-500">Subdomain</label>
            <Input
              name="subdomain"
              required
              value={formData.subdomain}
              onChange={handleChange}
              className="rounded-none border-gray-300 focus:border-black transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-gray-500">Description</label>
            <Textarea
              name="description"
              rows={6}
              value={formData.description}
              onChange={handleChange}
              className="rounded-none border-gray-300 focus:border-black transition-colors resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-gray-500">Logo URL</label>
            <Input
              name="logo_url"
              value={formData.logo_url}
              onChange={handleChange}
              className="rounded-none border-gray-300 focus:border-black transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-1.5">
              <label className="text-sm text-gray-500">Primary Color</label>
              <div className="flex items-center gap-2 border border-gray-300 p-1.5 h-12">
                <div
                  className="w-10 h-full border border-gray-200"
                  style={{ backgroundColor: formData.primary_color }}
                >
                  <input
                    type="color"
                    name="primary_color"
                    value={formData.primary_color}
                    onChange={handleChange}
                    className="opacity-0 w-full h-full cursor-pointer"
                  />
                </div>
                <input
                  type="text"
                  value={formData.primary_color}
                  onChange={(e) => setFormData((p) => ({ ...p, primary_color: e.target.value }))}
                  className="flex-1 text-sm font-mono focus:outline-none uppercase"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-gray-500">Secondary Color</label>
              <div className="flex items-center gap-2 border border-gray-300 p-1.5 h-12">
                <div
                  className="w-10 h-full border border-gray-200"
                  style={{ backgroundColor: formData.secondary_color }}
                >
                  <input
                    type="color"
                    name="secondary_color"
                    value={formData.secondary_color}
                    onChange={handleChange}
                    className="opacity-0 w-full h-full cursor-pointer"
                  />
                </div>
                <input
                  type="text"
                  value={formData.secondary_color}
                  onChange={(e) => setFormData((p) => ({ ...p, secondary_color: e.target.value }))}
                  className="flex-1 text-sm font-mono focus:outline-none uppercase"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-10">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(-1)}
              className="px-10 py-6 rounded-none bg-[#EFEFEF] hover:bg-gray-200 text-black border-none shadow-none"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="px-10 py-6 rounded-none bg-black hover:bg-gray-900 text-white border-none shadow-none min-w-[180px]"
            >
              {isLoading ? <Spinner /> : 'Create Brand'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

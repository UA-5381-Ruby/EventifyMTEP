import React from 'react';
import { Button, Input, Textarea, Alert, Spinner } from '@/components/ui';

type BrandFormProps = {
  formData: {
    name: string;
    subdomain: string;
    description: string;
    logo_url: string;
    primary_color: string;
    secondary_color: string;
  };
  isLoading: boolean;
  error: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onColorChange: (field: 'primary_color' | 'secondary_color', value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  submitLabel: string;
};

export const BrandForm: React.FC<BrandFormProps> = ({
  formData,
  isLoading,
  error,
  onChange,
  onColorChange,
  onSubmit,
  onCancel,
  submitLabel,
}) => (
  <form onSubmit={onSubmit} className="space-y-6">
    {error && <Alert variant="warning">{error}</Alert>}

    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">Name</label>
      <Input
        name="name"
        required
        value={formData.name}
        onChange={onChange}
        className="rounded-none border-gray-300 focus:border-black transition-colors"
      />
    </div>

    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">Subdomain</label>
      <Input
        name="subdomain"
        required
        value={formData.subdomain}
        onChange={onChange}
        className="rounded-none border-gray-300 focus:border-black transition-colors"
      />
    </div>

    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
      <Textarea
        name="description"
        rows={5}
        value={formData.description}
        onChange={onChange}
        className="rounded-none border-gray-300 focus:border-black transition-colors resize-none"
      />
    </div>

    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">Logo URL</label>
      <Input
        name="logo_url"
        value={formData.logo_url}
        onChange={onChange}
        className="rounded-none border-gray-300 focus:border-black transition-colors"
      />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
      {(['primary_color', 'secondary_color'] as const).map((colorField) => (
        <div key={colorField}>
          <label className="block text-xs font-semibold text-gray-600 mb-1 capitalize">
            {colorField.replace('_', ' ')}
          </label>
          <div className="flex items-center gap-2 border border-gray-300 p-1.5 h-12">
            <div
              className="w-10 h-full border border-gray-200 relative"
              style={{ backgroundColor: formData[colorField] }}
            >
              <input
                type="color"
                name={colorField}
                value={formData[colorField]}
                onChange={(e) => onColorChange(colorField, e.target.value)}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              />
            </div>
            <input
              type="text"
              value={formData[colorField]}
              onChange={(e) => onColorChange(colorField, e.target.value)}
              className="flex-1 text-sm font-mono focus:outline-none uppercase"
            />
          </div>
        </div>
      ))}
    </div>

    <div className="flex justify-end gap-3 pt-10">
      <Button
        type="button"
        variant="secondary"
        onClick={onCancel}
        className="px-10 py-6 rounded-none bg-[#EFEFEF] hover:bg-gray-200 text-black border-none shadow-none"
      >
        Cancel
      </Button>
      <Button
        type="submit"
        disabled={isLoading}
        className="px-10 py-6 rounded-none bg-black hover:bg-gray-900 text-white border-none shadow-none min-w-[180px]"
      >
        {isLoading ? <Spinner /> : submitLabel}
      </Button>
    </div>
  </form>
);

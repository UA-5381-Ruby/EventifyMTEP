import React, { useState } from 'react';
import { Button, Input, Textarea, Alert, Spinner } from '@/components/ui';
import { cn } from '@/lib/utils.ts';
import type { CreateBrandRequest } from '@/types/brand.ts';

type BrandFormProps = {
  formData: CreateBrandRequest;
  isLoading: boolean;
  error: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onColorChange: (field: 'primary_color' | 'secondary_color', value: string) => void;
  onFileChange: (file: File | null) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  submitLabel: string;
};

const ACCEPTED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]);

const getAcceptedFile = (file?: File | null) =>
  file && ACCEPTED_IMAGE_TYPES.has(file.type) ? file : null;

export const BrandForm: React.FC<BrandFormProps> = ({
  formData,
  isLoading,
  error,
  onChange,
  onColorChange,
  onFileChange,
  onSubmit,
  onCancel,
  submitLabel,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileChange(getAcceptedFile(e.target.files?.[0] || null));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    onFileChange(getAcceptedFile(e.dataTransfer.files?.[0] || null));
  };

  return (
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
          value={formData.description || ''}
          onChange={onChange}
          className="rounded-none border-gray-300 focus:border-black transition-colors resize-none"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Logo</label>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'flex justify-center rounded-none border border-dashed px-6 py-8 transition-colors duration-200',
            isDragging
              ? 'border-black bg-neutral-50'
              : 'border-gray-300 hover:border-gray-400 bg-white'
          )}
        >
          <div className="text-center flex flex-col items-center justify-center w-full">
            <input
              id="logo-upload"
              type="file"
              className="hidden"
              accept="image/jpeg, image/png, image/webp, image/gif, image/svg+xml"
              onChange={handleFileChange}
            />

            {formData.logo ? (
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm font-mono font-medium text-black">{formData.logo.name}</p>
                <label
                  htmlFor="logo-upload"
                  className="cursor-pointer text-xs text-neutral-500 hover:text-black underline uppercase tracking-wider"
                >
                  Change file
                </label>
              </div>
            ) : formData.logo ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-white border border-black p-1 flex items-center justify-center select-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <img
                    src={formData.logo}
                    alt="Current brand logo"
                    className="w-full h-full object-contain filter grayscale"
                  />
                </div>
                <label
                  htmlFor="logo-upload"
                  className="cursor-pointer text-xs text-neutral-500 hover:text-black underline uppercase tracking-wider"
                >
                  Change photo
                </label>
              </div>
            ) : (
              <label htmlFor="logo-upload" className="cursor-pointer flex flex-col items-center">
                <span className="text-sm text-neutral-500">Upload photo</span>
                <span className="text-xs text-neutral-400 mt-1">/ Drag & Drop file here</span>
              </label>
            )}
          </div>
        </div>
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
                style={{ backgroundColor: formData[colorField] || '#ffffff' }}
              >
                <input
                  type="color"
                  name={colorField}
                  value={formData[colorField] || '#ffffff'}
                  onChange={(e) => onColorChange(colorField, e.target.value)}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                />
              </div>
              <input
                type="text"
                value={formData[colorField] || ''}
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
};

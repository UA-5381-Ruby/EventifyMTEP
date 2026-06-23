import { useState } from 'react';
import { Button, Input, Textarea, Modal } from '@/components/ui';
import { ColorField } from '@/components/brands/color-field';
import { cn } from '@/lib/utils';

export interface BrandEditFields {
  name: string;
  description: string;
  subdomain: string;
  primary_color: string;
  secondary_color: string;
  logo: File | null;
  logo_url?: string;
}

interface BrandEditModalProps {
  isOpen: boolean;
  fields: BrandEditFields;
  onClose: () => void;
  onSave: () => void;
  onChange: (field: keyof BrandEditFields, value: string | File | null) => void;
}

export function BrandEditModal({ isOpen, fields, onClose, onSave, onChange }: BrandEditModalProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onChange('logo', file);
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
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onChange('logo', file);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title="Edit brand settings"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} className="font-normal">
            Cancel
          </Button>
          <Button size="sm" onClick={onSave} className="font-medium">
            Save changes
          </Button>
        </>
      }
    >
      <div className="space-y-4 py-2">
        <Input
          label="Brand name"
          value={fields.name}
          onChange={(e) => onChange('name', e.target.value)}
          className="text-sm"
        />
        <Input
          label="Subdomain"
          value={fields.subdomain}
          onChange={(e) => onChange('subdomain', e.target.value)}
          className="text-sm"
        />
        <Textarea
          label="Description"
          rows={5}
          value={fields.description}
          onChange={(e) => onChange('description', e.target.value)}
          className="text-sm max-h-[200px] overflow-y-auto"
        />

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Brand Logo</label>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              'mt-1 flex flex-col items-center justify-center rounded-md border-2 border-dashed px-6 py-6 transition-colors duration-200',
              isDragging
                ? 'border-primary-500 bg-primary-50'
                : 'border-neutral-300 hover:border-neutral-400 bg-white'
            )}
          >
            <input
              id="logo-upload-edit"
              type="file"
              className="hidden"
              accept="image/jpeg, image/png, image/webp, image/gif, image/svg+xml"
              onChange={handleFileChange}
            />

            {fields.logo ? (
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm font-medium text-neutral-900">{fields.logo.name}</p>
                <label
                  htmlFor="logo-upload-edit"
                  className="cursor-pointer text-xs text-primary-600 hover:text-primary-700 underline"
                >
                  Change file
                </label>
              </div>
            ) : fields.logo_url ? (
              <div className="flex flex-col items-center gap-3">
                <img
                  src={fields.logo_url}
                  alt="Current brand logo"
                  className="h-16 w-16 object-cover rounded-md border border-neutral-200 shadow-sm"
                />
                <label
                  htmlFor="logo-upload-edit"
                  className="cursor-pointer flex flex-col items-center gap-1"
                >
                  <span className="text-sm text-primary-600 font-medium hover:text-primary-700 underline">
                    Change photo
                  </span>
                  <span className="text-xs text-neutral-500">or drag & drop here</span>
                </label>
              </div>
            ) : (
              <label
                htmlFor="logo-upload-edit"
                className="cursor-pointer flex flex-col items-center"
              >
                <span className="text-sm text-neutral-500">Upload photo</span>
                <span className="text-sm text-neutral-500">/ Drag & Drop file</span>
              </label>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <ColorField
            label="Primary color"
            value={fields.primary_color}
            fallback="#6366f1"
            onChange={(v) => onChange('primary_color', v)}
          />
          <ColorField
            label="Secondary color"
            value={fields.secondary_color}
            fallback="#a855f7"
            onChange={(v) => onChange('secondary_color', v)}
          />
        </div>
      </div>
    </Modal>
  );
}

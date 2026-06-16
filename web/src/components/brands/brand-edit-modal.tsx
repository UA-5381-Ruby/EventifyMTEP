import { Button, Input, Textarea, Modal } from '@/components/ui';
import { ColorField } from '@/components/brands/color-field';

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onChange('logo', file);
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
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Brand Logo
          </label>

          {!fields.logo && fields.logo_url && (
            <div className="mb-2">
              <img
                src={fields.logo_url}
                alt="Current brand logo"
                className="h-12 w-12 object-cover rounded-md border border-neutral-200"
              />
            </div>
          )}

          <input
            type="file"
            accept="image/jpeg, image/png, image/webp, image/gif, image/svg+xml"
            onChange={handleFileChange}
            className="block w-full text-sm text-neutral-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-medium
              file:bg-primary-50 file:text-primary-700
              hover:file:bg-primary-100 transition-colors"
          />
          {fields.logo && (
            <p className="mt-1 text-xs text-neutral-500">
              New file selected: {fields.logo.name}
            </p>
          )}
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
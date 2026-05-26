import { Button, Input, Textarea, Modal } from '@/components/ui';
import { ColorField } from '@/components/brands/color-field';

export interface BrandEditFields {
  name: string;
  description: string;
  logo_url: string;
  subdomain: string;
  primary_color: string;
  secondary_color: string;
}

interface BrandEditModalProps {
  isOpen: boolean;
  fields: BrandEditFields;
  onClose: () => void;
  onSave: () => void;
  onChange: (field: keyof BrandEditFields, value: string) => void;
}

export function BrandEditModal({ isOpen, fields, onClose, onSave, onChange }: BrandEditModalProps) {
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
        <Input
          label="Logo URL"
          value={fields.logo_url}
          onChange={(e) => onChange('logo_url', e.target.value)}
          className="text-sm"
          placeholder="https://..."
        />
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

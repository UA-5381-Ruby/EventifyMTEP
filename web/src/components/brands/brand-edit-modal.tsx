import { Button, Input, Textarea, Modal } from '@/components/ui';

interface BrandEditModalProps {
  isOpen: boolean;
  name: string;
  description: string;
  logoUrl: string;
  subdomain: string;
  primaryColor: string;
  secondaryColor: string;
  onClose: () => void;
  onSave: () => void;
  onChange: (field: keyof BrandEditFields, value: string) => void;
}

export interface BrandEditFields {
  name: string;
  description: string;
  logo_url: string;
  subdomain: string;
  primary_color: string;
  secondary_color: string;
}

export function BrandEditModal({
  isOpen,
  name,
  description,
  logoUrl,
  subdomain,
  primaryColor,
  secondaryColor,
  onClose,
  onSave,
  onChange,
}: BrandEditModalProps) {
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
          value={name}
          onChange={(e) => onChange('name', e.target.value)}
          className="text-sm"
        />
        <Input
          label="Subdomain"
          value={subdomain}
          onChange={(e) => onChange('subdomain', e.target.value)}
          className="text-sm"
        />
        <Textarea
          label="Description"
          rows={5}
          value={description}
          onChange={(e) => onChange('description', e.target.value)}
          className="text-sm max-h-[200px] overflow-y-auto"
        />
        <Input
          label="Logo URL"
          value={logoUrl}
          onChange={(e) => onChange('logo_url', e.target.value)}
          className="text-sm"
          placeholder="https://..."
        />
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              { field: 'primary_color', label: 'Primary color', fallback: '#6366f1' },
              { field: 'secondary_color', label: 'Secondary color', fallback: '#a855f7' },
            ] as const
          ).map(({ field, label, fallback }) => {
            const value = field === 'primary_color' ? primaryColor : secondaryColor;
            const current = value || fallback;

            return (
              <div key={field} className="space-y-1.5">
                <label className="text-sm font-medium text-neutral-600">{label}</label>
                <div className="flex items-center gap-2 border border-neutral-200 rounded-lg px-3 py-2 focus-within:border-primary-400 transition-colors">
                  <input
                    type="color"
                    value={current}
                    onChange={(e) => onChange(field, e.target.value)}
                    className="w-6 h-6 rounded-md cursor-pointer bg-transparent p-0 shrink-0 border border-neutral-200 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-md [&::-moz-color-swatch]:border-none [&::-moz-color-swatch]:rounded-md"
                  />
                  <input
                    type="text"
                    value={current}
                    onChange={(e) => {
                      const hex = e.target.value;
                      if (/^#[0-9a-fA-F]{0,6}$/.test(hex)) {
                        onChange(field, hex);
                      }
                    }}
                    onBlur={(e) => {
                      if (!/^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
                        onChange(field, fallback);
                      }
                    }}
                    maxLength={7}
                    className="w-full text-sm font-mono text-neutral-700 bg-transparent border-0 outline-none uppercase"
                    placeholder={fallback}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}

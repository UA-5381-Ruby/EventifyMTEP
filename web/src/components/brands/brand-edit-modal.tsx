import { Button, Input, Textarea, Modal } from '@/components/ui';

interface BrandEditModalProps {
  isOpen: boolean;
  name: string;
  description: string;
  onClose: () => void;
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDescriptionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSave: () => void;
}

export function BrandEditModal({
  isOpen,
  name,
  description,
  onClose,
  onNameChange,
  onDescriptionChange,
  onSave,
}: BrandEditModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit brand settings"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs font-normal">
            Cancel
          </Button>
          <Button size="sm" onClick={onSave} className="text-xs font-medium">
            Save changes
          </Button>
        </>
      }
    >
      <div className="space-y-4 py-2">
        <Input label="Brand name" value={name} onChange={onNameChange} className="text-sm" />
        <Textarea
          label="Description"
          rows={4}
          value={description}
          onChange={onDescriptionChange}
          className="text-sm resize-none"
        />
      </div>
    </Modal>
  );
}

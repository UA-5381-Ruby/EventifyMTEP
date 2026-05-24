import { Button, Input, Textarea, Modal, Alert } from '@/components/ui';
import { useCategories } from '@/hooks/use-categories';
import type { CreateEventFields } from '@/hooks/use-create-event';

interface CreateEventModalProps {
  isOpen: boolean;
  fields: CreateEventFields;
  isSaving: boolean;
  saveError: string | null;
  onClose: () => void;
  onSave: () => void;
  onChange: <K extends keyof CreateEventFields>(field: K, value: CreateEventFields[K]) => void;
}

export function CreateEventModal({
                                   isOpen, fields, isSaving, saveError, onClose, onSave, onChange,
                                 }: CreateEventModalProps) {
  const { categories } = useCategories();

  const toggleCategory = (id: number) => {
    const next = fields.category_ids.includes(id)
      ? fields.category_ids.filter((c) => c !== id)
      : [...fields.category_ids, id];
    onChange('category_ids', next);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title="Create new event"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} className="font-normal">
            Cancel
          </Button>
          <Button size="sm" onClick={onSave} disabled={isSaving} className="font-medium">
            {isSaving ? 'Creating…' : 'Create event'}
          </Button>
        </>
      }
    >
      <div className="space-y-4 py-2">
        {saveError && (
          <Alert variant="error" title="Error">
            {saveError}
          </Alert>
        )}

        <Input
          label="Title *"
          value={fields.title}
          onChange={(e) => onChange('title', e.target.value)}
          className="text-sm"
          placeholder="Event title"
        />

        <Input
          label="Location *"
          value={fields.location}
          onChange={(e) => onChange('location', e.target.value)}
          className="text-sm"
          placeholder="City, venue or online"
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Start date *"
            type="datetime-local"
            value={fields.start_date}
            onChange={(e) => onChange('start_date', e.target.value)}
            className="text-sm"
          />
          <Input
            label="End date"
            type="datetime-local"
            value={fields.end_date}
            onChange={(e) => onChange('end_date', e.target.value)}
            className="text-sm"
          />
        </div>

        <Textarea
          label="Description"
          rows={4}
          value={fields.description}
          onChange={(e) => onChange('description', e.target.value)}
          className="text-sm"
          placeholder="What is this event about?"
        />

        {categories.length > 0 && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-600">Categories</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const selected = fields.category_ids.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      selected
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-neutral-600 border-neutral-200 hover:border-primary-300'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

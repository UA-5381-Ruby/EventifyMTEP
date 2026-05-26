import { useMemo } from 'react';
import { Button, Input, Textarea, Modal, Alert } from '@/components/ui';
import { CategoryPicker } from '@/components/events/category-picker';
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

function parseDateTime(value: string) {
  if (!value) return { date: '', time: '' };
  const [date, time] = value.split('T');
  return { date: date ?? '', time: time ? time.slice(0, 5) : '' };
}

function joinDateTime(date: string, time: string) {
  if (!date) return '';
  return `${date}T${time && time.length === 5 ? time : '00:00'}`;
}

export function CreateEventModal({
  isOpen,
  fields,
  isSaving,
  saveError,
  onClose,
  onSave,
  onChange,
}: CreateEventModalProps) {
  const startDateParsed = useMemo(() => parseDateTime(fields.start_date), [fields.start_date]);
  const endDateParsed = useMemo(() => parseDateTime(fields.end_date), [fields.end_date]);

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
          <div className="space-y-1">
            <label className="text-sm font-medium text-neutral-600">Start date *</label>
            <div className="grid grid-cols-[3fr_2fr] gap-1.5">
              <Input
                type="date"
                value={startDateParsed.date}
                onChange={(e) =>
                  onChange('start_date', joinDateTime(e.target.value, startDateParsed.time))
                }
                className="text-sm"
                lang="uk"
              />
              <Input
                type="time"
                value={startDateParsed.time}
                onChange={(e) =>
                  onChange('start_date', joinDateTime(startDateParsed.date, e.target.value))
                }
                className="text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-neutral-600">End date</label>
            <div className="grid grid-cols-[3fr_2fr] gap-1.5">
              <Input
                type="date"
                value={endDateParsed.date}
                onChange={(e) =>
                  onChange('end_date', joinDateTime(e.target.value, endDateParsed.time))
                }
                className="text-sm"
                lang="uk"
              />
              <Input
                type="time"
                value={endDateParsed.time}
                onChange={(e) =>
                  onChange('end_date', joinDateTime(endDateParsed.date, e.target.value))
                }
                className="text-sm"
              />
            </div>
          </div>
        </div>

        <Textarea
          label="Description"
          rows={4}
          value={fields.description}
          onChange={(e) => onChange('description', e.target.value)}
          className="text-sm"
          placeholder="What is this event about?"
        />

        <CategoryPicker
          selectedIds={fields.category_ids}
          onChange={(ids) => onChange('category_ids', ids)}
        />
      </div>
    </Modal>
  );
}

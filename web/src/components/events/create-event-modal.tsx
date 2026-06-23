import { useMemo, useState } from 'react';
import { Button, Input, Textarea, Modal, Alert } from '@/components/ui';
import { CategoryPicker } from '@/components/events/category-picker';
import { cn } from '@/lib/utils';
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
  const [isDragging, setIsDragging] = useState(false);

  const startDateParsed = useMemo(() => parseDateTime(fields.start_date), [fields.start_date]);
  const endDateParsed = useMemo(() => parseDateTime(fields.end_date), [fields.end_date]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onChange('banner', file);
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
      onChange('banner', file);
    }
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
          <Button size="sm" onClick={onSave} disabled={isSaving} className="font-medium" isLoading={isSaving}>
            {isSaving ? 'Creating…' : 'Create event'}
          </Button>
        </>
      }
    >
      <div className="space-y-4 py-2 max-h-[60vh] overflow-auto pr-2">
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

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Event Banner
          </label>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "mt-1 flex flex-col items-center justify-center rounded-md border-2 border-dashed px-6 py-6 transition-colors duration-200",
              isDragging ? "border-primary-500 bg-primary-50" : "border-neutral-300 hover:border-neutral-400 bg-white"
            )}
          >
            <input
              id="event-banner-upload"
              type="file"
              className="hidden"
              accept="image/jpeg, image/png, image/webp, image/gif, image/svg+xml"
              onChange={handleFileChange}
            />

            {fields.banner ? (
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm font-medium text-neutral-900">{fields.banner.name}</p>
                <label
                  htmlFor="event-banner-upload"
                  className="cursor-pointer text-xs text-primary-600 hover:text-primary-700 underline"
                >
                  Change file
                </label>
              </div>
            ) : (
              <label
                htmlFor="event-banner-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <span className="text-sm text-neutral-500">Upload banner</span>
                <span className="text-sm text-neutral-500">/ Drag & Drop file</span>
              </label>
            )}
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

        <div className="grid grid-cols-2 gap-3">
          <Input
            type="number"
            label="Price (UAH)"
            value={fields.price_cents ? (fields.price_cents / 100).toFixed(2) : ''}
            onChange={(e) => {
              const value = e.target.value;
              const cents = value ? Math.round(parseFloat(value) * 100) : 0;
              onChange('price_cents', Number.isNaN(cents) ? 0 : cents);
            }}
            className="text-sm"
            min={0}
            step="0.01"
            placeholder="0.00"
          />
          <Input
            type="number"
            label="Available tickets"
            value={fields.available_tickets_count === 0 ? '' : fields.available_tickets_count}
            onChange={(e) =>
              onChange('available_tickets_count', e.target.value ? Number(e.target.value) : 0)
            }
            className="text-sm"
            min={0}
            step={1}
            placeholder="0"
          />
        </div>

        <CategoryPicker
          selectedIds={fields.category_ids}
          onChange={(ids) => onChange('category_ids', ids)}
        />
      </div>
    </Modal>
  );
}

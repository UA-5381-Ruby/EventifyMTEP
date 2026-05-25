import React, { useState, useRef, useMemo } from 'react';
import { Button, Input, Textarea, Modal, Alert } from '@/components/ui';
import { useCategories } from '@/hooks/use-categories';
import { CategoriesService } from '@/services/categories-service';
import type { Category } from '@/types/category';
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
  const validTime = time && time.length === 5 ? time : '00:00';
  return `${date}T${validTime}`;
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
  const { categories } = useCategories();
  const [extraCategories, setExtraCategories] = useState<Category[]>([]);

  const allCategories = useMemo(
    () => [...categories, ...extraCategories],
    [categories, extraCategories]
  );

  const startDateParsed = useMemo(() => parseDateTime(fields.start_date), [fields.start_date]);
  const endDateParsed = useMemo(() => parseDateTime(fields.end_date), [fields.end_date]);

  const [newCatName, setNewCatName] = useState('');
  const [isCreatingCat, setIsCreatingCat] = useState(false);
  const [catError, setCatError] = useState<string | null>(null);
  const [showCatInput, setShowCatInput] = useState(false);
  const catInputRef = useRef<HTMLInputElement>(null);

  const toggleCategory = (id: number) => {
    const next = fields.category_ids.includes(id)
      ? fields.category_ids.filter((c) => c !== id)
      : [...fields.category_ids, id];
    onChange('category_ids', next);
  };

  const handleShowCatInput = () => {
    setShowCatInput(true);
    setCatError(null);
    setTimeout(() => catInputRef.current?.focus(), 50);
  };

  const handleCancelCatCreate = () => {
    setShowCatInput(false);
    setNewCatName('');
    setCatError(null);
  };

  const handleCreateCategory = async () => {
    const name = newCatName.trim();
    if (!name) {
      setCatError('Category name cannot be empty.');
      return;
    }

    setIsCreatingCat(true);
    setCatError(null);

    try {
      const created = await CategoriesService.createCategory({ name });
      setExtraCategories((prev) => [...prev, created]);
      onChange('category_ids', [...fields.category_ids, created.id]);
      setNewCatName('');
      setShowCatInput(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create category.';
      setCatError(message);
    } finally {
      setIsCreatingCat(false);
    }
  };

  const handleCatKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      void handleCreateCategory();
    } else if (e.key === 'Escape') {
      handleCancelCatCreate();
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
                lang="uk" // Локаль для відображення ДД.ММ.РРРР
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

          {/* End date */}
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

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-neutral-600">Categories</label>
            {!showCatInput && (
              <button
                type="button"
                onClick={handleShowCatInput}
                className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                New category
              </button>
            )}
          </div>

          {allCategories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {allCategories.map((cat) => {
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
          )}

          {showCatInput && (
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  ref={catInputRef}
                  type="text"
                  value={newCatName}
                  onChange={(e) => {
                    setNewCatName(e.target.value);
                    if (catError) setCatError(null);
                  }}
                  onKeyDown={handleCatKeyDown}
                  placeholder="Category name"
                  disabled={isCreatingCat}
                  className={`flex-1 h-8 rounded-md border px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors disabled:opacity-50 ${
                    catError
                      ? 'border-red-400 focus:ring-red-400'
                      : 'border-neutral-200 focus:border-primary-400'
                  }`}
                />
                <Button
                  size="sm"
                  onClick={handleCreateCategory}
                  disabled={isCreatingCat || !newCatName.trim()}
                  className="h-8 text-xs px-3 font-medium shrink-0"
                >
                  {isCreatingCat ? 'Creating…' : 'Add'}
                </Button>
                <button
                  type="button"
                  onClick={handleCancelCatCreate}
                  disabled={isCreatingCat}
                  className="h-8 px-2 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors disabled:opacity-50 shrink-0"
                  aria-label="Cancel"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
              {catError && <p className="text-xs text-red-500 pl-0.5">{catError}</p>}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

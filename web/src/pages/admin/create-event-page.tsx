import React, { useMemo, useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import type { Brand } from '@/types/brand';
import { Button, Alert, Spinner, Card, Input, Textarea } from '@/components/ui';

import { CreateCategoryModal } from '@/components/admin/modals/create-category-modal.tsx';
import { useCreateEvent } from '@/hooks/use-create-event.ts';
import { useEventCategories } from '@/hooks/use-event-categories.ts';

import { EventDatesInput } from '../../components/admin/event/event-dates-input.tsx';
import { EventBannerUpload } from '../../components/admin/event/event-banner-upload.tsx';
import { EventPriceTickets } from '../../components/admin/event/event-price-tickets.tsx';
import { EventCategories } from '../../components/admin/event/event-categories.tsx';

import { parseDateTime, joinDateTime } from '@/lib/date-utils';

export const CreateEventPage = () => {
  const navigate = useNavigate();
  const { brand } = useOutletContext<{ brand: Brand }>();

  const { fields, isSaving, saveError, handleFieldChange, handleSave } = useCreateEvent(
    brand.id,
    () => navigate('/dashboard/events')
  );

  const {
    allCategories,
    isModalOpen,
    newCategoryName,
    isCreatingCategory,
    categoryError,
    setNewCategoryName,
    setIsModalOpen,
    handleCategoryToggle,
    handleCreateCategory,
    closeModal,
  } = useEventCategories(fields.category_ids, handleFieldChange);

  const startDateParsed = useMemo(() => parseDateTime(fields.start_date), [fields.start_date]);
  const endDateParsed = useMemo(() => parseDateTime(fields.end_date), [fields.end_date]);

  const handleDateChange = useCallback(
    (field: 'start_date' | 'end_date', date: string, time: string) => {
      handleFieldChange(field, joinDateTime(date, time));
    },
    [handleFieldChange]
  );

  const handlePriceTicketsChange = useCallback(
    (field: 'price_cents' | 'available_tickets_count', value: number) => {
      handleFieldChange(field, value);
    },
    [handleFieldChange]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSave();
  };

  return (
    <div className="w-full flex justify-center items-start pt-4 pb-20 text-black">
      <div className="w-full max-w-2xl px-4">
        <Card className="p-10 bg-white shadow-none border border-neutral-200 rounded-none relative">
          <h1 className="text-2xl font-bold mb-10 uppercase">Create New Event</h1>

          {(saveError || categoryError) && (
            <Alert variant="warning" className="mb-8">
              {saveError || categoryError}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Title *"
              value={fields.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              className="text-sm"
              placeholder="Event title"
            />

            <Input
              label="Location *"
              value={fields.location}
              onChange={(e) => handleFieldChange('location', e.target.value)}
              className="text-sm"
              placeholder="City, venue or online"
            />

            <EventDatesInput
              startDateParsed={startDateParsed}
              endDateParsed={endDateParsed}
              onDateChange={handleDateChange}
            />

            <EventBannerUpload
              banner={fields.banner as File | null}
              onChange={(file) => handleFieldChange('banner', file)}
            />

            <Textarea
              label="Description"
              rows={4}
              value={fields.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              className="text-sm"
              placeholder="What is this event about?"
            />

            <EventPriceTickets
              priceCents={fields.price_cents}
              availableTicketsCount={fields.available_tickets_count}
              onFieldChange={handlePriceTicketsChange}
            />

            <EventCategories
              allCategories={allCategories}
              selectedCategoryIds={fields.category_ids}
              onToggleCategory={handleCategoryToggle}
              onOpenModal={() => setIsModalOpen(true)}
            />

            <div className="flex justify-end gap-4 pt-12 border-t border-neutral-100">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/dashboard/events')}
                className="rounded-none px-10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="rounded-none bg-black text-white px-10"
              >
                {isSaving ? <Spinner className="w-4 h-4" /> : 'Create Event'}
              </Button>
            </div>
          </form>

          <CreateCategoryModal
            isOpen={isModalOpen}
            onClose={closeModal}
            onSave={handleCreateCategory}
            name={newCategoryName}
            setName={setNewCategoryName}
            isLoading={isCreatingCategory}
          />
        </Card>
      </div>
    </div>
  );
};

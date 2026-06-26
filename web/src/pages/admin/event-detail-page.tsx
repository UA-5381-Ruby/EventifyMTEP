import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Spinner } from '@/components/ui';
import { useEventDetail } from '@/hooks/use-event-detail';
import { EventsService } from '@/services/events-service';

import { CategoryChip } from '@/components/admin/category-chip.tsx';
import { EventInfoSection } from '@/components/admin/event/event-info-section.tsx';
import { EventActionsCard } from '@/components/admin/event/event-actions-card.tsx';

interface EventCategory {
  id: number;
  name: string;
}

export const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const {
    event,
    isLoading,
    isSubmitting,
    isCancelling,
    isSaving,
    isEditing,
    setIsEditing,
    error,
    handleSubmitEvent,
    handleCancelEvent,
    handleUpdateEvent,
  } = useEventDetail(Number(id));

  const [allCategories, setAllCategories] = useState<EventCategory[]>([]);
  const [isCategoriesUpdating, setIsCategoriesUpdating] = useState(false);

  useEffect(() => {
    EventsService.getAllCategories()
      .then((data) => {
        if (Array.isArray(data)) {
          setAllCategories(data);
        } else if (
          data &&
          typeof data === 'object' &&
          'data' in data &&
          Array.isArray((data as { data: unknown }).data)
        ) {
          setAllCategories((data as { data: EventCategory[] }).data);
        }
      })
      .catch((err) => console.error('Failed to load global categories', err));
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center pt-20">
        <Spinner />
      </div>
    );
  }

  if (!event) {
    return <div className="p-20 text-center font-bold">Event not found</div>;
  }

  const currentCategories = event.categories || [];
  const currentCategoryIds = currentCategories.map((c) => c.id);

  const availableCategories = allCategories.filter((c) => !currentCategoryIds.includes(c.id));

  const handleAddCategoryDirectly = async (catId: number) => {
    if (currentCategoryIds.includes(catId)) return;
    setIsCategoriesUpdating(true);
    try {
      await handleUpdateEvent({
        category_ids: [...currentCategoryIds, catId],
      });
    } catch (err) {
      console.error('Failed to add category', err);
    } finally {
      setIsCategoriesUpdating(false);
    }
  };

  const handleRemoveCategoryDirectly = async (catId: number) => {
    setIsCategoriesUpdating(true);
    try {
      await handleUpdateEvent({
        category_ids: currentCategoryIds.filter((id) => id !== catId),
      });
    } catch (err) {
      console.error('Failed to remove category', err);
    } finally {
      setIsCategoriesUpdating(false);
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto space-y-10 pb-20 px-4 animate-in fade-in duration-700">
      {/* Шапка івенту */}
      <div className="flex justify-between items-end pb-2 border-b border-neutral-100">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-bold tracking-tight">{event.title}</h1>
          <span className="px-3 py-1 bg-neutral-100 border text-[10px] font-black uppercase text-neutral-500">
            {event.status?.replace('_', ' ')}
          </span>
        </div>
        {error && <span className="text-red-600 text-[10px] font-black uppercase">{error}</span>}
      </div>

      <EventInfoSection
        key={`${event.id}-${isEditing}`}
        isEditing={isEditing}
        event={event}
        onCancel={() => setIsEditing(false)}
        onSave={handleUpdateEvent}
        isSaving={isSaving}
        setIsEditing={setIsEditing}
      />

      <div className="border border-neutral-200 p-8 space-y-6 bg-white relative">
        {isCategoriesUpdating && (
          <div className="absolute inset-0 bg-white/60 flex justify-center items-center z-10 animate-in fade-in duration-200">
            <Spinner />
          </div>
        )}

        <div className="flex justify-between items-center border-b border-neutral-100 pb-2">
          <h3 className="text-xl font-bold">Event Categories</h3>

          {availableCategories.length > 0 && (
            <select
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) {
                  handleAddCategoryDirectly(Number(e.target.value));
                  e.target.value = '';
                }
              }}
              className="border border-neutral-300 p-2 text-xs bg-white focus:outline-none focus:border-black rounded-none cursor-pointer"
            >
              <option value="" disabled>
                + Add Category...
              </option>
              {availableCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex flex-wrap gap-3 min-h-[40px] p-2 bg-neutral-50/50 border border-dashed border-neutral-100">
          {currentCategories.length === 0 ? (
            <span className="text-xs text-neutral-400 self-center">
              No categories assigned to this event.
            </span>
          ) : (
            currentCategories.map((cat) => (
              <CategoryChip
                key={cat.id}
                name={cat.name}
                isRemovable={true}
                onRemove={() => handleRemoveCategoryDirectly(cat.id)}
              />
            ))
          )}
        </div>
      </div>

      <EventActionsCard
        status={event.status}
        onReview={handleSubmitEvent}
        onCancel={handleCancelEvent}
        isSubmitting={isSubmitting}
        isCancelling={isCancelling}
      />
    </div>
  );
};

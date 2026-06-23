// import { useState } from 'react';
// import { useParams } from 'react-router-dom';
// import { Button, Spinner } from '@/components/ui';
// import { useEventDetail } from '@/hooks/use-event-detail';
//
// import { CategoryChip } from '@/components/admin/category-chip.tsx';
// import { EventInfoSection } from '@/components/admin/event/event-info-section.tsx';
// import { EventActionsCard } from '@/components/admin/event/event-actions-card.tsx';

export const EventDetailPage = () => {
  // const { id } = useParams<{ id: string }>();
  // const {
  //   event,
  //   allCategories,
  //   isLoading,
  //   isEditing,
  //   isSaving,
  //   isSubmitting,
  //   isCancelling,
  //   isAddingCategory,
  //   formData,
  //   error,
  //   setIsEditing,
  //   handleInputChange,
  //   handleCancelEdit,
  //   handleSaveInfo,
  //   handleSubmitEvent,
  //   handleCancelEvent,
  //   handleAddCategory,
  //   handleRemoveCategory,
  // } = useEventDetail(Number(id));
  //
  // const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  //
  // if (isLoading)
  //   return (
  //     <div className="flex justify-center pt-20">
  //       <Spinner />
  //     </div>
  //   );
  // if (!event) return <div className="p-20 text-center font-bold">Event not found</div>;
  //
  // const availableCategories = allCategories.filter(
  //   (cat) => !event.categories?.some((ec) => ec.id === cat.id)
  // );

  return (
    <div className="max-w-screen-xl mx-auto space-y-10 pb-20 px-4 animate-in fade-in duration-700">
      {/*/!* Header *!/*/}
      {/*<div className="flex justify-between items-end pb-2 border-b border-neutral-100">*/}
      {/*  <div className="flex items-center gap-4">*/}
      {/*    <h1 className="text-4xl font-bold tracking-tight">{event.title}</h1>*/}
      {/*    <span className="px-3 py-1 bg-neutral-100 border text-[10px] font-black uppercase text-neutral-500">*/}
      {/*      {event.status?.replace('_', ' ')}*/}
      {/*    </span>*/}
      {/*  </div>*/}
      {/*  {error && <span className="text-red-600 text-[10px] font-black uppercase">{error}</span>}*/}
      {/*</div>*/}

      {/*/!* Main Info Section *!/*/}
      {/*<EventInfoSection*/}
      {/*  isEditing={isEditing}*/}
      {/*  event={event}*/}
      {/*  formData={formData}*/}
      {/*  onChange={handleInputChange}*/}
      {/*  onCancel={handleCancelEdit}*/}
      {/*  onSave={handleSaveInfo}*/}
      {/*  isSaving={isSaving}*/}
      {/*  setIsEditing={setIsEditing}*/}
      {/*/>*/}

      {/*/!* Categories Section *!/*/}
      {/*<div className="border border-neutral-200 p-8 space-y-6 bg-white">*/}
      {/*  <h3 className="text-xl font-bold">Event Categories</h3>*/}
      {/*  <div className="flex flex-wrap gap-3">*/}
      {/*    {event.categories?.map((cat) => (*/}
      {/*      <CategoryChip*/}
      {/*        key={cat.id}*/}
      {/*        name={cat.name}*/}
      {/*        isRemovable*/}
      {/*        onRemove={() => handleRemoveCategory(cat.id)}*/}
      {/*      />*/}
      {/*    ))}*/}

      {/*    {availableCategories.length > 0 && (*/}
      {/*      <div className="flex gap-2 items-center">*/}
      {/*        <select*/}
      {/*          value={selectedCategoryId || ''}*/}
      {/*          onChange={(e) => setSelectedCategoryId(Number(e.target.value))}*/}
      {/*          className="border border-neutral-300 rounded-none px-3 h-10 text-[11px] font-black bg-white"*/}
      {/*        >*/}
      {/*          <option value="">Select category...</option>*/}
      {/*          {availableCategories.map((cat) => (*/}
      {/*            <option key={cat.id} value={cat.id}>*/}
      {/*              {cat.name}*/}
      {/*            </option>*/}
      {/*          ))}*/}
      {/*        </select>*/}
      {/*        <Button*/}
      {/*          onClick={() => {*/}
      {/*            if (selectedCategoryId) {*/}
      {/*              handleAddCategory(selectedCategoryId);*/}
      {/*              setSelectedCategoryId(null);*/}
      {/*            }*/}
      {/*          }}*/}
      {/*          disabled={!selectedCategoryId || isAddingCategory}*/}
      {/*          className="rounded-none bg-black text-white px-6 h-10 text-[11px]"*/}
      {/*        >*/}
      {/*          {isAddingCategory ? <Spinner /> : 'Add'}*/}
      {/*        </Button>*/}
      {/*      </div>*/}
      {/*    )}*/}
      {/*  </div>*/}
      {/*</div>*/}

      {/*/!* Actions Section *!/*/}
      {/*<EventActionsCard*/}
      {/*  status={event.status}*/}
      {/*  onReview={handleSubmitEvent}*/}
      {/*  onCancel={handleCancelEvent}*/}
      {/*  isSubmitting={isSubmitting}*/}
      {/*  isCancelling={isCancelling}*/}
      {/*/>*/}
    </div>
  );
};

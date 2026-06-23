// import { useState, useEffect } from 'react';
// import { EventsService } from '@/services/events-service';
// import { CategoriesService } from '@/services/categories-service';
// import type { EventDetail } from '@/types/event';
// import type { Category } from '@/types/category';
//
// interface FormData {
//   title: string;
//   description: string;
//   location: string;
//   start_date: string;
//   end_date: string;
//   price_cents: number;
//   available_tickets_count: number;
// }
//
// interface UseEventDetailResult {
//   event: EventDetail | null;
//   allCategories: Category[];
//   isLoading: boolean;
//   error: string | null;
//   isEditing: boolean;
//   isSaving: boolean;
//   isSubmitting: boolean;
//   isCancelling: boolean;
//   isAddingCategory: boolean;
//   formData: FormData;
//   setIsEditing: (v: boolean) => void;
//   handleInputChange: (field: keyof FormData, value: string | number) => void;
//   handleCancelEdit: () => void;
//   handleSaveInfo: () => Promise<void>;
//   handleSubmitEvent: () => Promise<void>;
//   handleCancelEvent: () => Promise<void>;
//   handleAddCategory: (categoryId: number) => Promise<void>;
//   handleRemoveCategory: (categoryId: number) => Promise<void>;
// }
//
// export function useEventDetail(id: number): UseEventDetailResult {
//   const [event, setEvent] = useState<EventDetail | null>(null);
//   const [allCategories, setAllCategories] = useState<Category[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [isSaving, setIsSaving] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isCancelling, setIsCancelling] = useState(false);
//   const [isAddingCategory, setIsAddingCategory] = useState(false);
//   const [formData, setFormData] = useState<FormData>({
//     title: '',
//     description: '',
//     location: '',
//     start_date: '',
//     end_date: '',
//     price_cents: 0,
//     available_tickets_count: 0,
//   });
//
//   const syncFormData = (e: EventDetail) => {
//     setFormData({
//       title: e.title,
//       description: e.description ?? '',
//       location: e.location ?? '',
//       start_date: e.start_date ?? '',
//       end_date: e.end_date ?? '',
//       price_cents: e.price_cents ?? 0,
//       available_tickets_count: e.available_tickets_count ?? 0,
//     });
//   };
//
//   useEffect(() => {
//     if (!id) return;
//     let isMounted = true;
//
//     Promise.all([EventsService.getEventById(id), CategoriesService.getCategories()])
//       .then(([eventData, categoriesData]) => {
//         if (!isMounted) return;
//         setEvent(eventData);
//         syncFormData(eventData);
//         // підтримуємо як масив напряму, так і { data: Category[] }
//         setAllCategories(Array.isArray(categoriesData) ? categoriesData : categoriesData.data);
//       })
//       .catch(() => {
//         if (isMounted) setError('Failed to load event data.');
//       })
//       .finally(() => {
//         if (isMounted) setIsLoading(false);
//       });
//
//     return () => {
//       isMounted = false;
//     };
//   }, [id]);
//
//   const handleInputChange = (field: keyof FormData, value: string | number) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//   };
//
//   const handleCancelEdit = () => {
//     if (event) syncFormData(event);
//     setIsEditing(false);
//   };
//
//   const handleSaveInfo = async () => {
//     if (!event) return;
//     setIsSaving(true);
//     setError(null);
//     try {
//       const updated = await EventsService.updateEvent(event.id, formData);
//       setEvent(updated);
//       setIsEditing(false);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Save failed.');
//     } finally {
//       setIsSaving(false);
//     }
//   };
//
//   const handleSubmitEvent = async () => {
//     if (!event) return;
//     setIsSubmitting(true);
//     setError(null);
//     try {
//       const updated = await EventsService.submitEvent(event.id);
//       setEvent(updated);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Submit failed.');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };
//
//   const handleCancelEvent = async () => {
//     if (!event) return;
//     setIsCancelling(true);
//     setError(null);
//     try {
//       const updated = await EventsService.cancelEvent(event.id);
//       setEvent(updated);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Cancel failed.');
//     } finally {
//       setIsCancelling(false);
//     }
//   };
//
//   const handleAddCategory = async (categoryId: number) => {
//     if (!event) return;
//     setIsAddingCategory(true);
//     setError(null);
//     try {
//       const updated = await EventsService.addCategoryToEvent(event.id, categoryId);
//       setEvent(updated);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to add category.');
//     } finally {
//       setIsAddingCategory(false);
//     }
//   };
//
//   const handleRemoveCategory = async (categoryId: number) => {
//     if (!event) return;
//     setError(null);
//     try {
//       const updated = await EventsService.removeCategoryFromEvent(event.id, categoryId);
//       setEvent(updated);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to remove category.');
//     }
//   };
//
//   return {
//     event,
//     allCategories,
//     isLoading,
//     error,
//     isEditing,
//     isSaving,
//     isSubmitting,
//     isCancelling,
//     isAddingCategory,
//     formData,
//     setIsEditing,
//     handleInputChange,
//     handleCancelEdit,
//     handleSaveInfo,
//     handleSubmitEvent,
//     handleCancelEvent,
//     handleAddCategory,
//     handleRemoveCategory,
//   };
// }

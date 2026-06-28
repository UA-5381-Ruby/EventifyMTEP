import { EventsService } from '@/services/events-service'; // або '@/lib/events-service'
import type { CreateEventRequest } from '@/types/event';
import { useReduxState } from '@/hooks/use-redux-state';

export interface CreateEventFields {
  title: string;
  location: string;
  start_date: string;
  end_date: string;
  description: string;
  price_cents: number;
  available_tickets_count: number;
  category_ids: number[];
  banner: File | null;
}

const EMPTY_EVENT_FIELDS: CreateEventFields = {
  title: '',
  location: '',
  start_date: '',
  end_date: '',
  description: '',
  price_cents: 0,
  available_tickets_count: 0,
  category_ids: [],
  banner: null,
};

interface UseCreateEventResult {
  isOpen: boolean;
  fields: CreateEventFields;
  isSaving: boolean;
  saveError: string | null;
  openModal: () => void;
  closeModal: () => void;
  handleFieldChange: <K extends keyof CreateEventFields>(
    field: K,
    value: CreateEventFields[K]
  ) => void;
  handleSave: () => Promise<void>;
}

export function useCreateEvent(brandId: number, onSuccess: () => void): UseCreateEventResult {
  const [isOpen, setIsOpen] = useReduxState(false);
  const [fields, setFields] = useReduxState<CreateEventFields>(EMPTY_EVENT_FIELDS);
  const [isSaving, setIsSaving] = useReduxState(false);
  const [saveError, setSaveError] = useReduxState<string | null>(null);

  const openModal = () => {
    setFields(EMPTY_EVENT_FIELDS);
    setSaveError(null);
    setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);

  const handleFieldChange = <K extends keyof CreateEventFields>(
    field: K,
    value: CreateEventFields[K]
  ) => {
    setFields((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!fields.title.trim() || !fields.location.trim() || !fields.start_date) {
      setSaveError('Title, location and start date are required.');
      return;
    }

    setSaveError(null);
    setIsSaving(true);

    try {
      const payload: CreateEventRequest = {
        title: fields.title.trim(),
        location: fields.location.trim(),
        start_date: fields.start_date,
        brand_id: brandId,
        ...(fields.description.trim() ? { description: fields.description.trim() } : {}),
        ...(fields.end_date ? { end_date: fields.end_date } : {}),
        ...(fields.price_cents > 0 ? { price_cents: fields.price_cents } : {}),
        ...(fields.available_tickets_count > 0
          ? { available_tickets_count: fields.available_tickets_count }
          : {}),
        ...(fields.category_ids.length > 0 ? { category_ids: fields.category_ids } : {}),
        ...(fields.banner ? { banner: fields.banner } : {}), // Додаємо банер у payload
      };

      await EventsService.createEvent(payload);
      setIsOpen(false);
      onSuccess();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create event.';
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isOpen,
    fields,
    isSaving,
    saveError,
    openModal,
    closeModal,
    handleFieldChange,
    handleSave,
  };
}

import { Button, Spinner } from '@/components/ui';
import type { CreateEventRequest } from '@/types/event.ts';
import { useReduxState } from '@/hooks/use-redux-state';

interface EventInfo {
  start_date: string;
  location?: string;
  description?: string;
}

interface EventInfoSectionProps {
  isEditing: boolean;
  event: EventInfo;
  onCancel: () => void;
  onSave: (payload: Partial<CreateEventRequest>) => Promise<void> | void;
  isSaving: boolean;
  setIsEditing: (value: boolean) => void;
}

export const EventInfoSection = ({
  isEditing,
  event,
  onCancel,
  onSave,
  isSaving,
  setIsEditing,
}: EventInfoSectionProps) => {
  const [location, setLocation] = useReduxState(event.location || '');
  const [description, setDescription] = useReduxState(event.description || '');

  const handleLocalSave = () => {
    onSave({ location, description });
  };

  if (isEditing) {
    return (
      <div className="space-y-6 border border-neutral-200 p-8 bg-white animate-in fade-in duration-300">
        <h3 className="text-xl font-bold border-b border-neutral-100 pb-2">Edit Event Details</h3>

        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-neutral-400 uppercase tracking-widest block">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full border border-neutral-300 p-3 rounded-none focus:outline-none focus:border-black text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-neutral-400 uppercase tracking-widest block">
              Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-neutral-300 p-3 rounded-none focus:outline-none focus:border-black text-sm resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-neutral-100">
          <Button variant="secondary" onClick={onCancel} className="rounded-none px-8">
            Cancel
          </Button>
          <Button
            onClick={handleLocalSave}
            disabled={isSaving}
            className="rounded-none bg-black text-white px-12"
          >
            {isSaving ? <Spinner /> : 'Save Changes'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-neutral-200 p-8 bg-white space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start gap-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 flex-1">
          <div>
            <p className="text-[11px] font-black text-neutral-400 uppercase tracking-widest">
              Date & Time
            </p>
            <p className="text-lg font-bold">
              {new Date(event.start_date).toLocaleString('en-GB')}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-black text-neutral-400 uppercase tracking-widest">
              Location
            </p>
            <p className="text-lg font-bold">{event.location || 'Online / TBD'}</p>
          </div>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="border border-neutral-300 px-6 py-2 text-[10px] font-black uppercase hover:bg-neutral-50 transition-colors"
        >
          Edit Info
        </button>
      </div>
      {event.description && (
        <div className="space-y-3">
          <p className="text-[11px] font-black text-neutral-400 uppercase tracking-widest">
            Description
          </p>
          <p className="text-base text-neutral-600">{event.description}</p>
        </div>
      )}
    </div>
  );
};

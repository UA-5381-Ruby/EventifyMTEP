import { Button, Spinner } from '@/components/ui';

export const EventActionsCard = ({
  status,
  onReview,
  onCancel,
  isSubmitting,
  isCancelling,
}: any) => (
  <div className="border border-neutral-200 p-8 bg-white divide-y divide-neutral-100">
    <h3 className="text-xl font-bold mb-8">Event Actions</h3>
    <div className="flex justify-between items-center py-8 first:pt-0">
      <div>
        <p className="font-bold">Submit for Review</p>
        <p className="text-sm text-neutral-400">Send this event to superadmins for approval.</p>
      </div>
      <Button
        onClick={onReview}
        disabled={isSubmitting || status !== 'draft'}
        className="bg-black text-white rounded-none px-12 h-12 uppercase text-[11px]"
      >
        {isSubmitting ? <Spinner /> : 'Submit Event'}
      </Button>
    </div>
    <div className="flex justify-between items-center py-8 last:pb-0">
      <div>
        <p className="font-bold">Cancel Event</p>
        <p className="text-sm text-neutral-400">Permanently cancel this event.</p>
      </div>
      <Button
        variant="outline"
        onClick={onCancel}
        disabled={isCancelling || status === 'cancelled'}
        className="border-neutral-300 rounded-none px-12 h-12 uppercase text-[11px] hover:text-red-600"
      >
        {isCancelling ? <Spinner /> : 'Cancel Event'}
      </Button>
    </div>
  </div>
);

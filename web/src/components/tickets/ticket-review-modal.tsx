import { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { Button, Spinner } from '@/components/ui';
import { TicketsService } from '@/services/tickets-service';
import type { TicketFeedback } from '@/types/ticket';

import { InteractiveStarRating } from './interactive-star-rating';
import { DeleteConfirmation } from './delete-confirmation';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    ticketId: string | number;
    existingFeedback?: TicketFeedback;
    onSuccess: (newFeedback: TicketFeedback | null) => void;
}

export function TicketReviewModal({ isOpen, onClose, ticketId, existingFeedback, onSuccess }: Props) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setRating(existingFeedback?.rating || 0);
            setComment(existingFeedback?.comment || '');
            setShowDeleteConfirm(false);
        }
    }, [isOpen, existingFeedback]);

    if (!isOpen) return null;

    const isEditing = !!existingFeedback;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) return;

        setIsSubmitting(true);
        try {
            const updatedFeedback = await TicketsService.submitTicketReview(ticketId, { rating, comment });
            onSuccess(updatedFeedback);
            onClose();
        } catch (error) {
            console.error('Failed to submit review:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteExecute = async () => {
        setIsDeleting(true);
        try {
            await TicketsService.deleteTicketReview(ticketId);
            onSuccess(null);
            onClose();
        } catch (error) {
            console.error('Failed to delete review:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative transition-all">

                {!isDeleting && !isSubmitting && (
                    <button onClick={onClose} className="absolute top-4 right-4 p-1 text-neutral-400 hover:text-neutral-600 transition-colors">
                        <X size={20} />
                    </button>
                )}

                <div className="p-6">
                    {showDeleteConfirm ? (
                        <DeleteConfirmation
                            onCancel={() => setShowDeleteConfirm(false)}
                            onConfirm={handleDeleteExecute}
                            isDeleting={isDeleting}
                        />
                    ) : (
                        <>
                            <h2 className="text-xl font-semibold text-neutral-900 mb-6">
                                {isEditing ? 'Edit Your Review' : 'Leave a Review'}
                            </h2>

                            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                                <InteractiveStarRating rating={rating} setRating={setRating} />

                                <div className="flex flex-col gap-2">
                                    <label htmlFor="comment" className="text-sm font-medium text-neutral-700">
                                        Tell us more about your experience (optional)
                                    </label>
                                    <textarea
                                        id="comment"
                                        rows={4}
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="What did you like or dislike?"
                                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    {isEditing && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setShowDeleteConfirm(true)}
                                            disabled={isSubmitting}
                                            className="px-3 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                        >
                                            <Trash2 size={18} />
                                        </Button>
                                    )}

                                    <Button type="submit" disabled={rating === 0 || isSubmitting} className="flex-1">
                                        {isSubmitting ? <Spinner className="w-4 h-4 mr-2" /> : null}
                                        {isEditing ? 'Save Changes' : 'Submit Review'}
                                    </Button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
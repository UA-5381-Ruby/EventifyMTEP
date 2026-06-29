import { AlertTriangle } from 'lucide-react';
import { Button, Spinner } from '@/components/ui';

interface DeleteConfirmationProps {
    onCancel: () => void;
    onConfirm: () => void;
    isDeleting: boolean;
}

export function DeleteConfirmation({ onCancel, onConfirm, isDeleting }: DeleteConfirmationProps) {
    return (
        <div className="flex flex-col items-center text-center py-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 mb-4">
                <AlertTriangle size={28} />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Delete Review?</h3>
            <p className="text-sm text-neutral-500 mb-6 max-w-xs">
                Are you sure you want to delete your review? This action cannot be undone.
            </p>
            <div className="flex gap-3 w-full">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isDeleting} className="flex-1">
                    Cancel
                </Button>
                <Button type="button" disabled={isDeleting} onClick={onConfirm} className="flex-1 bg-red-600 hover:bg-red-700 text-white border-transparent">
                    {isDeleting ? <Spinner className="w-4 h-4" /> : 'Yes, Delete'}
                </Button>
            </div>
        </div>
    );
}
import { X } from 'lucide-react';
import { Button, Input, Spinner } from '@/components/ui';

export const CreateCategoryModal = ({ isOpen, onClose, onSave, name, setName, isLoading }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-sm p-8 border border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,0.1)]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold uppercase tracking-tighter">New Category</h3>
          <button onClick={onClose}>
            <X className="w-6 h-6 text-neutral-400 hover:text-black" />
          </button>
        </div>
        <div className="space-y-6">
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Workshop"
            className="rounded-none border-neutral-300 h-12"
          />
          <Button
            onClick={onSave}
            disabled={isLoading || !name.trim()}
            className="w-full rounded-none bg-black text-white h-14"
          >
            {isLoading ? <Spinner className="w-4 h-4" /> : 'Create Category'}
          </Button>
        </div>
      </div>
    </div>
  );
};

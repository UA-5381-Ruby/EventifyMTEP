import React from 'react';
import { Plus } from 'lucide-react';
import { CategoryChip } from '@/components/admin/category-chip.tsx';
import type { Category } from '@/types/category';

interface EventCategoriesProps {
  allCategories: Category[];
  selectedCategoryIds: number[];
  onToggleCategory: (id: number) => void;
  onOpenModal: () => void;
}

export const EventCategories: React.FC<EventCategoriesProps> = ({
  allCategories,
  selectedCategoryIds,
  onToggleCategory,
  onOpenModal,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center border-b border-neutral-100 pb-2">
        <label className="text-[11px] font-black uppercase tracking-widest text-neutral-400">
          Categories
        </label>
        <button
          type="button"
          onClick={onOpenModal}
          className="flex items-center gap-1 text-[10px] font-bold text-blue-600"
        >
          <Plus className="w-3 h-3" /> Add New
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {allCategories.map((cat) => (
          <CategoryChip
            key={cat.id}
            name={cat.name}
            isSelected={selectedCategoryIds.includes(cat.id)}
            onClick={() => onToggleCategory(cat.id)}
          />
        ))}
      </div>
    </div>
  );
};

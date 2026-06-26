import { Check } from 'lucide-react';

interface CategoryChipProps {
  name: string;
  isSelected?: boolean;
  isRemovable?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
}

export const CategoryChip = ({
  name,
  isSelected,
  isRemovable,
  onClick,
  onRemove,
}: CategoryChipProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 text-[12px] font-medium transition-all border
      ${isSelected ? 'bg-black border-black text-white' : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-400'}
      ${isRemovable ? 'bg-neutral-100 border-neutral-200 font-black uppercase' : ''}`}
  >
    {isSelected && <Check className="w-3 h-3" />}
    {name}
    {isRemovable && (
      <span
        onClick={(e) => {
          e.stopPropagation();
          onRemove?.();
        }}
        className="cursor-pointer opacity-30 hover:opacity-100 text-lg leading-none"
      >
        ×
      </span>
    )}
  </button>
);

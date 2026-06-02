import { useMemo, useRef, useEffect } from 'react';
import { Button } from '@/components/ui';
import { useCategories } from '@/hooks/use-categories';
import { useCategoryCreator } from '@/hooks/use-category-creator';

interface CategoryPickerProps {
  selectedIds: number[];
  onChange: (ids: number[]) => void;
}

export function CategoryPicker({ selectedIds, onChange }: CategoryPickerProps) {
  const { categories } = useCategories();

  const selectedIdsRef = useRef(selectedIds);

  useEffect(() => {
    selectedIdsRef.current = selectedIds;
  }, [selectedIds]);

  const {
    extraCategories,
    newCatName,
    isCreatingCat,
    catError,
    showCatInput,
    catInputRef,
    setNewCatName,
    handleShowCatInput,
    handleCancelCatCreate,
    handleCreateCategory,
    handleCatKeyDown,
  } = useCategoryCreator({
    onCreated: (id) => {
      const currentIds = selectedIdsRef.current;
      if (!currentIds.includes(id)) {
        onChange([...currentIds, id]);
      }
    },
  });

  const toggleCategory = (id: number) => {
    if (isCreatingCat) return;

    const next = selectedIds.includes(id)
      ? selectedIds.filter((c) => c !== id)
      : [...selectedIds, id];
    onChange(next);
  };

  const allCategories = useMemo(
    () => [...categories, ...extraCategories],
    [categories, extraCategories]
  );

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-neutral-600">Categories</label>
        {!showCatInput && (
          <button
            type="button"
            onClick={handleShowCatInput}
            className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            New category
          </button>
        )}
      </div>

      {allCategories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {allCategories.map((cat) => {
            const selected = selectedIds.includes(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                disabled={isCreatingCat} // Вимикаємо кнопки під час створення
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors disabled:opacity-75 ${
                  selected
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-neutral-600 border-neutral-200 hover:border-primary-300'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      )}

      {showCatInput && (
        <div className="mt-2 space-y-2">
          <div className="flex items-center gap-2">
            <input
              ref={catInputRef}
              type="text"
              value={newCatName}
              onChange={(e) => {
                setNewCatName(e.target.value);
              }}
              onKeyDown={handleCatKeyDown}
              placeholder="Category name"
              disabled={isCreatingCat}
              className={`flex-1 h-8 rounded-md border px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors disabled:opacity-50 ${
                catError
                  ? 'border-red-400 focus:ring-red-400'
                  : 'border-neutral-200 focus:border-primary-400'
              }`}
            />
            <Button
              size="sm"
              onClick={handleCreateCategory}
              disabled={isCreatingCat || !newCatName.trim()}
              className="h-8 text-xs px-3 font-medium shrink-0"
            >
              {isCreatingCat ? 'Creating…' : 'Add'}
            </Button>
            <button
              type="button"
              onClick={handleCancelCatCreate}
              disabled={isCreatingCat}
              className="h-8 px-2 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors disabled:opacity-50 shrink-0"
              aria-label="Cancel"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
          {catError && <p className="text-xs text-red-500 pl-0.5">{catError}</p>}
        </div>
      )}
    </div>
  );
}

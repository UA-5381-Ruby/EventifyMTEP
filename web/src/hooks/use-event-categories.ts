import { useState, useEffect, useCallback } from 'react';
import { CategoriesService } from '@/services/categories-service';
import type { Category } from '@/types/category';

export const useEventCategories = (
  selectedCategoryIds: number[],
  onFieldChange: (field: 'category_ids', value: number[]) => void
) => {
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  useEffect(() => {
    CategoriesService.getCategories()
      .then(setAllCategories)
      .catch((err) => console.error('Failed to fetch categories:', err));
  }, []);

  const handleCategoryToggle = useCallback(
    (categoryId: number) => {
      const next = selectedCategoryIds.includes(categoryId)
        ? selectedCategoryIds.filter((id) => id !== categoryId)
        : [...selectedCategoryIds, categoryId];
      onFieldChange('category_ids', next);
    },
    [selectedCategoryIds, onFieldChange]
  );

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    setIsCreatingCategory(true);
    setCategoryError(null);

    try {
      const newCat = await CategoriesService.createCategory({ name: newCategoryName.trim() });
      setAllCategories((prev) => [...prev, newCat].sort((a, b) => a.name.localeCompare(b.name)));
      onFieldChange('category_ids', [...selectedCategoryIds, newCat.id]);
      setNewCategoryName('');
      setIsModalOpen(false);
    } catch {
      setCategoryError('Failed to create category.');
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setCategoryError(null);
    setNewCategoryName('');
  }, []);

  return {
    allCategories,
    isModalOpen,
    newCategoryName,
    isCreatingCategory,
    categoryError,
    setNewCategoryName,
    setIsModalOpen,
    handleCategoryToggle,
    handleCreateCategory,
    closeModal,
  };
};

import { useState, useEffect } from 'react';
import { CategoriesService } from '@/services/categories-service';
import type { Category } from '@/types/category';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    CategoriesService.getCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setIsLoading(false));
  }, []);

  return { categories, isLoading };
}

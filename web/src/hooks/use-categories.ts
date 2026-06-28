import { useEffect } from 'react';
import { CategoriesService } from '@/services/categories-service';
import type { Category } from '@/types/category';
import { useReduxState } from '@/hooks/use-redux-state';

export function useCategories() {
  const [categories, setCategories] = useReduxState<Category[]>([]);
  const [isLoading, setIsLoading] = useReduxState(true);

  useEffect(() => {
    CategoriesService.getCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setIsLoading(false));
  }, [setCategories, setIsLoading]);

  return { categories, isLoading };
}

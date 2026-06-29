import { useState, useMemo, type ChangeEvent } from 'react';
import type { EventSortField, SortOrder } from '@/types/event';

export const useEventsFilters = (brandId: number) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<EventSortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const perPage = 10;

  const queryParams = useMemo(
    () => ({
      brand_id: brandId,
      page,
      per_page: perPage,
      sort: sortField,
      order: sortOrder,
      ...(search.trim() ? { q: search.trim(), search: search.trim() } : {}),
    }),
    [brandId, page, sortField, sortOrder, search]
  );

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleSortChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const [field, order] = e.target.value.split('-') as [EventSortField, SortOrder];
    setSortField(field);
    setSortOrder(order);
    setPage(1);
  };

  return {
    page,
    setPage,
    search,
    sortField,
    sortOrder,
    perPage,
    queryParams,
    handleSearchChange,
    handleSortChange,
  };
};

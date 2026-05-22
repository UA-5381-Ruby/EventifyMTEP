import { useState } from 'react';
import { SORT_OPTIONS } from '@/constants/event.constants';
import type { Event } from '@/types/event';
import { STATUS_TO_TAB, TAB_TO_STATUS } from '@/components/events/event-filters';
import type { EventTabStatus } from '@/components/events/event-filters';

const STATUS_REGISTRY: Record<string, { group: EventTabStatus }> = {
  draft: { group: 'Drafts' },
  draft_on_review: { group: 'Drafts' },
  published: { group: 'Active' },
  rejected: { group: 'Drafts' },
  published_unverified: { group: 'Active' },
  published_on_review: { group: 'Active' },
  published_rejected: { group: 'Cancelled' },
  archived: { group: 'Archived' },
  cancelled: { group: 'Cancelled' },
};

interface FilterableEvent {
  title: string;
  status?: string | null;
  created_at?: string;
  start_date?: string;
}

interface UseEventFiltersOptions<T extends FilterableEvent> {
  events: T[];
  itemsPerPage: number;
}

export function useEventFilters<T extends FilterableEvent>({
  events,
  itemsPerPage,
}: UseEventFiltersOptions<T>) {
  const [activeTab, setActiveTab] = useState<EventTabStatus>('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState(SORT_OPTIONS[0]?.value ?? '');
  const [page, setPage] = useState(1);

  const filtered = events.filter((e) => {
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase());
    const statusKey = (e.status || 'draft').toLowerCase();
    const matchTab = activeTab === 'All' || STATUS_REGISTRY[statusKey]?.group === activeTab;
    return matchSearch && matchTab;
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (sort) {
      case 'created_at':
        return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime();
      case 'start_date':
        return new Date(a.start_date ?? 0).getTime() - new Date(b.start_date ?? 0).getTime();
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(sorted.length / itemsPerPage) || 1;
  const paginated = sorted.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  ) as unknown as Event[];

  const handleStatusChange = (value: string) => {
    setActiveTab(STATUS_TO_TAB[value] ?? 'All');
    setPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(e.target.value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setActiveTab('All');
    setPage(1);
  };

  return {
    search,
    sort,
    activeTab,
    page,
    paginated,
    totalPages,
    hasActiveFilters: !!(search || activeTab !== 'All'),
    status: TAB_TO_STATUS[activeTab],
    handleSearchChange,
    handleStatusChange,
    handleSortChange,
    setPage,
    clearFilters,
  };
}

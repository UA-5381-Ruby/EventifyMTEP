export const BRAND_SORT_OPTIONS = [
  { value: 'created_at', label: 'Newest first' },
  { value: 'name', label: 'Name (A–Z)' },
  { value: 'events_count', label: 'Most events' },
];

export const ITEMS_PER_PAGE = 6;

export const ACTIVE_STATUSES = new Set(['published']);

export const PENDING_STATUSES = ['draft_on_review', 'published_on_review'];

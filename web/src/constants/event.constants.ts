import type { EventStatus } from '@/types/event';

export const SORT_OPTIONS = [
  { value: 'created_at', label: 'Newest first' },
  { value: 'start_date', label: 'Start date' },
  { value: 'title', label: 'Title A–Z' },
];

export type EventTabStatus = 'All' | 'Active' | 'Drafts' | 'Archived' | 'Cancelled';

export const TAB_TO_STATUS: Record<EventTabStatus, string> = {
  All: '',
  Active: 'published',
  Drafts: 'draft',
  Archived: 'archived',
  Cancelled: 'cancelled',
};

export const STATUS_TO_TAB: Record<string, EventTabStatus> = {
  '': 'All',
  published: 'Active',
  draft: 'Drafts',
  archived: 'Archived',
  cancelled: 'Cancelled',
};

export const STATUS_TABS: { value: EventStatus | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'published', label: 'Active' },
  { value: 'draft', label: 'Drafts' },
  { value: 'archived', label: 'Archived' },
  { value: 'cancelled', label: 'Cancelled' },
];

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'outline';

export const STATUS_CONFIG: Record<
  EventStatus,
  { label: string; variant: BadgeVariant; group: EventTabStatus }
> = {
  draft: { label: 'Draft', variant: 'default', group: 'Drafts' },
  draft_on_review: { label: 'In Review', variant: 'warning', group: 'Drafts' },
  published: { label: 'Published', variant: 'success', group: 'Active' },
  rejected: { label: 'Rejected', variant: 'error', group: 'Drafts' },
  published_unverified: { label: 'Unverified', variant: 'secondary', group: 'Active' },
  published_on_review: { label: 'In Review', variant: 'warning', group: 'Active' },
  published_rejected: { label: 'Rejected', variant: 'error', group: 'Cancelled' },
  archived: { label: 'Archived', variant: 'outline', group: 'Archived' },
  cancelled: { label: 'Cancelled', variant: 'error', group: 'Cancelled' },
};

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function isUpcoming(iso: string) {
  return new Date(iso) > new Date();
}

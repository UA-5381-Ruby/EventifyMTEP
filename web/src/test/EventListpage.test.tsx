import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { EventListPage } from '@/pages/EventListPage';
import * as useEventsModule from '@/hooks/useEvents';
import type { Event } from '@/types/event.types';

jest.mock('@/hooks/useEvents');
const mockUseEvents = jest.spyOn(useEventsModule, 'useEvents');

jest.mock('@/components/layout', () => ({
  PageWrapper: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Container: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/components/ui', () => ({
  Input: ({
    placeholder,
    onChange,
  }: {
    placeholder: string;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
  }) => <input placeholder={placeholder} onChange={onChange} data-testid="search-input" />,
  Select: ({
    options,
    onChange,
    value,
  }: {
    options: { value: string; label: string }[];
    onChange: React.ChangeEventHandler<HTMLSelectElement>;
    value: string;
  }) => (
    <select onChange={onChange} value={value} aria-label={options[0]?.label || 'Select option'}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  ),
  Button: ({
    children,
    onClick,
    disabled,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  Spinner: () => <div data-testid="spinner">Loading…</div>,
  Alert: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div role="alert">
      <strong>{title}</strong> {children}
    </div>
  ),
}));

jest.mock('@/components/events/EventCard', () => ({
  EventCard: ({ event }: { event: { title: string } }) => (
    <div data-testid="event-card">{event.title}</div>
  ),
  EventCardSkeleton: () => <div data-testid="event-skeleton">Loading card...</div>,
}));

const baseState = {
  events: [],
  meta: null,
  isLoading: false,
  error: null,
  refetch: jest.fn(),
};

const mockEvents: Event[] = [
  {
    id: 1,
    title: 'Tech Summit',
    start_date: '2026-09-01T09:00:00Z',
    status: 'published',
    brand_id: 101,
  },
  { id: 2, title: 'Art Expo', start_date: '2026-10-15T10:00:00Z', status: 'draft', brand_id: 102 },
];

const mockMeta = { page: 1, per_page: 12, total: 2 };

function renderPage() {
  return render(
    <MemoryRouter>
      <EventListPage />
    </MemoryRouter>
  );
}

describe('EventListPage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows a spinner while loading', () => {
    mockUseEvents.mockReturnValue({ ...baseState, isLoading: true, events: [] });

    renderPage();

    expect(screen.getByText('Loading…')).toBeInTheDocument();
    expect(screen.queryByTestId('event-card')).not.toBeInTheDocument();
  });

  it('shows an error alert when fetch fails', () => {
    mockUseEvents.mockReturnValue({
      ...baseState,
      error: 'Failed to load events. Please try again.',
    });

    renderPage();

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Failed to load events/)).toBeInTheDocument();
  });

  it('calls refetch when Try again is clicked', () => {
    const refetch = jest.fn();
    mockUseEvents.mockReturnValue({
      ...baseState,
      error: 'Failed to load events. Please try again.',
      refetch,
    });

    renderPage();
    fireEvent.click(screen.getByText('Try again'));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('shows empty state when no events are returned', () => {
    mockUseEvents.mockReturnValue({ ...baseState, events: [], meta: { ...mockMeta, total: 0 } });

    renderPage();

    expect(screen.getByText('No events found')).toBeInTheDocument();
    expect(screen.queryByTestId('event-card')).not.toBeInTheDocument();
  });

  it('renders an EventCard for each returned event', () => {
    mockUseEvents.mockReturnValue({ ...baseState, events: mockEvents, meta: mockMeta });

    renderPage();

    const cards = screen.getAllByTestId('event-card');
    expect(cards).toHaveLength(2);
    expect(screen.getByText('Tech Summit')).toBeInTheDocument();
    expect(screen.getByText('Art Expo')).toBeInTheDocument();
  });

  it('shows total count in the subheading', () => {
    mockUseEvents.mockReturnValue({ ...baseState, events: mockEvents, meta: mockMeta });

    renderPage();

    expect(screen.getByText('2 events found')).toBeInTheDocument();
  });

  it('resets to page 1 and passes q param when search changes', async () => {
    mockUseEvents.mockReturnValue({ ...baseState, events: mockEvents, meta: mockMeta });

    renderPage();

    fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'summit' } });

    await waitFor(() => {
      const [calledParams] = mockUseEvents.mock.calls[mockUseEvents.mock.calls.length - 1];
      expect(calledParams.q).toBe('summit');
      expect(calledParams.page).toBe(1);
    });
  });

  it('resets to page 1 when status filter changes', async () => {
    mockUseEvents.mockReturnValue({ ...baseState, events: mockEvents, meta: mockMeta });

    renderPage();

    fireEvent.change(screen.getByLabelText('All statuses'), { target: { value: 'published' } });

    await waitFor(() => {
      const [calledParams] = mockUseEvents.mock.calls[mockUseEvents.mock.calls.length - 1];
      expect(calledParams.status).toBe('published');
      expect(calledParams.page).toBe(1);
    });
  });

  it('does not render pagination when only one page', () => {
    mockUseEvents.mockReturnValue({ ...baseState, events: mockEvents, meta: mockMeta });

    renderPage();

    expect(screen.queryByText(/← Prev/)).not.toBeInTheDocument();
  });

  it('renders pagination when totalPages > 1', () => {
    mockUseEvents.mockReturnValue({
      ...baseState,
      events: mockEvents,
      meta: { page: 1, per_page: 12, total: 30 },
    });

    renderPage();

    expect(screen.getByText(/← Prev/)).toBeInTheDocument();
    expect(screen.getByText(/Next →/)).toBeInTheDocument();

    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('Prev button is disabled on first page', () => {
    mockUseEvents.mockReturnValue({
      ...baseState,
      events: mockEvents,
      meta: { page: 1, per_page: 12, total: 30 },
    });

    renderPage();

    expect(screen.getByText(/← Prev/)).toBeDisabled();
  });

  it('advances to next page when Next is clicked', async () => {
    mockUseEvents.mockReturnValue({
      ...baseState,
      events: mockEvents,
      meta: { page: 1, per_page: 12, total: 30 },
    });

    renderPage();
    fireEvent.click(screen.getByText(/Next →/));

    await waitFor(() => {
      const [calledParams] = mockUseEvents.mock.calls[mockUseEvents.mock.calls.length - 1];
      expect(calledParams.page).toBe(2);
    });
  });
});

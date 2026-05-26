export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatTimeRange(startDate: string, endDate: string | null) {
  const start = formatTime(startDate);
  const end = endDate ? formatTime(endDate) : null;
  return end ? `${start} – ${end}` : start;
}

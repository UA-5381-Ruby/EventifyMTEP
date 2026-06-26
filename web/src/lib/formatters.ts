export const getInitials = (name?: string) => {
  const safeName = name?.trim();
  if (!safeName) return 'U';
  const parts = safeName.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  return parts[0].slice(0, 2).toUpperCase();
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

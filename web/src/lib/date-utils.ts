/**
 * Розбиває ISO рядок (або рядок формату YYYY-MM-DDTHH:mm) на окремі дату та час.
 * @param value Рядок дати з ISO/інпуту
 * @returns Об'єкт з полями date та time (HH:mm)
 */
export function parseDateTime(value: string | null | undefined): { date: string; time: string } {
  if (!value) return { date: '', time: '' };

  try {
    const [date, time] = value.split('T');
    return {
      date: date ?? '',
      time: time ? time.slice(0, 5) : '',
    };
  } catch (error) {
    console.error('Error parsing date-time value:', value, error);
    return { date: '', time: '' };
  }
}

/**
 * Об'єднує окремі значення дати та часу в один рядок для інпуту/API.
 * @param date Рядок дати (YYYY-MM-DD)
 * @param time Рядок часу (HH:mm)
 * @returns Рядок формату YYYY-MM-DDTHH:mm
 */
export function joinDateTime(
  date: string | null | undefined,
  time: string | null | undefined
): string {
  if (!date) return '';

  const cleanTime = time && time.length === 5 ? time : '00:00';
  return `${date}T${cleanTime}`;
}

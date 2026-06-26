import type { FormErrors, FormFields } from '@/types/form';

export function validate(fields: FormFields): FormErrors {
  const errors: FormErrors = {};

  if (!fields.name.trim()) errors.name = 'Name is required';

  if (!fields.email.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    errors.email = 'Enter a valid email address';
  }

  if (!fields.subject.trim()) errors.subject = 'Subject is required';

  if (!fields.message.trim()) {
    errors.message = 'Message is required';
  } else if (fields.message.trim().length < 10) {
    errors.message = 'Message is too short';
  }

  return errors;
}

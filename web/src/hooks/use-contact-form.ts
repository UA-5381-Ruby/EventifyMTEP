import { useState } from 'react';
import { EMPTY_FORM } from '@/constants/ui.constants';
import { validate } from '@/utils/validate';
import type { FormErrors, FormFields, FormStatus } from '@/types/form';

export function useContactForm() {
  const [fields, setFields] = useState<FormFields>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<FormStatus>('idle');

  const handleChange =
    (key: keyof FormFields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFields((prev) => ({ ...prev, [key]: e.target.value }));
      if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

  const handleSubmit = async () => {
    const validationErrors = validate(fields);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setStatus('loading');
    try {
      const res = await fetch('/api/v1/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: fields }),
      });

      if (!res.ok) throw new Error('Failed to send');

      setStatus('success');
      setFields(EMPTY_FORM);
      setErrors({});
    } catch {
      setStatus('error');
    }
  };

  return { fields, errors, status, handleChange, handleSubmit };
}

import { EMPTY_FORM } from '@/constants/ui.constants';
import { validate } from '@/utils/validate';
import type { FormErrors, FormFields, FormStatus } from '@/types/form';
import apiClient from '@/lib/api-client';
import { useReduxState } from '@/hooks/use-redux-state';

export function useContactForm() {
  const [fields, setFields] = useReduxState<FormFields>(EMPTY_FORM);
  const [errors, setErrors] = useReduxState<FormErrors>({});
  const [status, setStatus] = useReduxState<FormStatus>('idle');

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
      await apiClient.post('/api/v1/contact', {
        contact: fields,
      });

      setStatus('success');
      setFields(EMPTY_FORM);
      setErrors({});
    } catch {
      setStatus('error');
    }
  };

  return { fields, errors, status, handleChange, handleSubmit };
}

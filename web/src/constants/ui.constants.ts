import { Mail, Clock } from 'lucide-react';
import type { FormFields } from '@/types/form';

export const DEFAULT_FOCUS_DELAY_MS = 50;
export const PER_PAGE = 12;

export const EMPTY_FORM: FormFields = { name: '', email: '', subject: '', message: '' };
export const CONTACT_DETAILS = [
  {
    icon: Mail,
    label: 'Email',
    value: 'support@eventify.com',
  },
  {
    icon: Clock,
    label: 'Response time',
    value: 'Within 24 hours',
  },
];

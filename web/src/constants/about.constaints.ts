import { Calendar, Ticket, Star, Smile } from 'lucide-react';

export const OFFERINGS = [
  {
    icon: Calendar,
    label: 'Event creation and management',
  },
  {
    icon: Ticket,
    label: 'Participant registration and ticketing',
  },
  {
    icon: Star,
    label: 'Reviews and attendee feedback',
  },
  {
    icon: Smile,
    label: 'Brand customization and personalized experience',
  },
] as const;

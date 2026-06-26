import { UserService } from '@/services/user-service';
import { EventsService } from '@/services/events-service';
import { brandsService } from '@/services/brands-service';

import type { AdminStats, PendingEvent, UserPreview } from '@/types/super-admin';

export interface DashboardData {
  stats: AdminStats;
  users: UserPreview[];
  pendingEvents: PendingEvent[];
}

interface RawUser {
  id: string | number;
  email: string;
  role?: string;
}

interface RawEvent {
  id: string | number;
  status?: string;
  name?: string;
  title?: string;
  startDate?: string;
  date?: string;
  createdBy?: string;
  organizer?: string;
  location?: string;
  venue?: string;
}

export const SuperadminService = {
  async getDashboardData(): Promise<DashboardData> {
    const [users, brands, eventsResponse] = await Promise.all([
      UserService.getAllUsers(),
      brandsService.getBrands({}),
      EventsService.getEvents(),
    ]);

    const fetchedUsers: UserPreview[] = Array.isArray(users)
      ? (users as RawUser[]).map((user) => ({
        id: String(user.id),
        email: user.email,
        role: user.role || 'Member',
      }))
      : [];

    const fetchedBrands = brands?.data || [];

    const rawEvents = Array.isArray(eventsResponse?.data)
      ? (eventsResponse.data as RawEvent[])
      : [];

    const fetchedEvents: PendingEvent[] = rawEvents.map((event) => ({
      id: String(event.id),
      status: event.status || 'pending',
      name: event.name || event.title || 'Untitled Event',
      startDate: event.startDate || event.date || 'N/A',
      createdBy: event.createdBy || event.organizer || 'Unknown',
      location: event.location || event.venue || 'Remote',
    }));

    const pendingEvents = fetchedEvents.filter(
      (event) => event.status?.toLowerCase() === 'pending'
    );

    const stats: AdminStats = {
      totalUsers: fetchedUsers.length,
      totalBrands: fetchedBrands.length,
      totalEvents: fetchedEvents.length,
      pendingApproval: pendingEvents.length,
      rejectedEvents: fetchedEvents.filter((event) => event.status?.toLowerCase() === 'rejected').length,
      reportedUsers: 0,
    };

    return {
      stats,
      users: fetchedUsers,
      pendingEvents,
    };
  },
};
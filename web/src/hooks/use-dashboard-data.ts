import { useState, useEffect } from 'react';
import type { Event } from '@/types/event';
import type { Membership } from '@/types/brand-memberships';
import { EventsService } from '@/services/events-service';
import { BrandMembershipsService } from '@/services/brand-memberships-service';

export const useDashboardData = (brandId: number) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [eventStats, setEventStats] = useState({ total: 0, pending: 0 });
  const [teamMembers, setTeamMembers] = useState<Membership[]>([]);
  const [membersCount, setMembersCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      try {
        const [recentEventsRes, allEventsStatsRes, membersRes] = await Promise.all([
          EventsService.getEvents({ brand_id: brandId, per_page: 3 }),
          EventsService.getEvents({ brand_id: brandId }),
          BrandMembershipsService.getBrandMemberships(brandId, { per_page: 3 }),
        ]);

        if (!isMounted) return;

        setEvents(recentEventsRes?.data || []);
        setEventStats({
          total: allEventsStatsRes?.meta?.total || allEventsStatsRes?.data?.length || 0,
          pending: (allEventsStatsRes?.data || []).filter((e) => e.status === 'draft_on_review')
            .length,
        });
        setTeamMembers(membersRes?.data || []);
        setMembersCount(membersRes?.meta?.total_count ?? membersRes?.data?.length ?? 0);
      } catch (error) {
        console.error('Dashboard load error:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [brandId]);

  return { events, eventStats, teamMembers, membersCount, isLoading };
};

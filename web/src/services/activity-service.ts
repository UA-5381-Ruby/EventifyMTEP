import apiClient from '@/lib/api-client';

export type ActivityType =
  | 'login'
  | 'logout'
  | 'create'
  | 'update'
  | 'delete'
  | 'approve'
  | 'reject'
  | 'publish'
  | 'download'
  | 'upload'
  | 'other';

export interface ActivityActor {
  id: string;
  email: string;
  name?: string;
}

export interface Activity {
  id: string;
  actor: ActivityActor;
  type: ActivityType;
  resource: string;
  resourceId?: string;
  resourceName?: string;
  timestamp: string;
  details?: string;
  ipAddress?: string;
  status: 'success' | 'failed';
}

interface ApiResponse {
  data: unknown[];
  meta?: {
    page: number;
    per_page: number;
    total: number;
    pages: number;
  };
}

interface GetActivitiesParams {
  page: number;
  perPage: number;
  activityTypes?: ActivityType[];
  resource?: string;
  status?: string;
  email?: string;
}

interface GetActivitiesResult {
  activities: Activity[];
  total: number;
}

export const activityService = {
  async getActivities({
    page,
    perPage,
    activityTypes,
    resource,
    status,
    email,
  }: GetActivitiesParams): Promise<GetActivitiesResult> {
    const params: Record<string, unknown> = {
      page,
      per_page: perPage,
    };

    if (activityTypes && activityTypes.length > 0) {
      params.activity_types = activityTypes.join(',');
    }
    if (resource) params.resource = resource;
    if (status) params.status = status;
    if (email) params.email = email;

    const response = await apiClient.get<unknown>('/api/v1/activities', { params });
    const res = response as unknown as Record<string, unknown>;

    const responseBody: ApiResponse =
      res.data && typeof res.data === 'object' && 'data' in res.data
        ? (res.data as ApiResponse)
        : (res as unknown as ApiResponse);

    if (!responseBody || !Array.isArray(responseBody.data)) {
      throw new Error('Incorrect data format received from the server.');
    }

    const activities: Activity[] = responseBody.data.map((item: unknown) => {
      const activity = item as Record<string, unknown>;
      const actor = (activity.actor as Record<string, unknown>) || {};

      return {
        id: String(activity.id || ''),
        actor: {
          id: String(actor.id || ''),
          email: String(actor.email || 'Unknown'),
          name: actor.name ? String(actor.name) : undefined,
        },
        type: (activity.type || 'other') as ActivityType,
        resource: String(activity.resource || 'System'),
        resourceId: activity.resource_id
          ? String(activity.resource_id)
          : activity.resourceId
            ? String(activity.resourceId)
            : undefined,
        resourceName: activity.resource_name
          ? String(activity.resource_name)
          : activity.resourceName
            ? String(activity.resourceName)
            : undefined,
        timestamp: String(activity.created_at || activity.timestamp || new Date().toISOString()),
        details: activity.details ? String(activity.details) : undefined,
        ipAddress: activity.ip_address
          ? String(activity.ip_address)
          : activity.ipAddress
            ? String(activity.ipAddress)
            : undefined,
        status: (activity.status || 'success') as 'success' | 'failed',
      };
    });

    return {
      activities,
      total: responseBody.meta?.total ?? activities.length,
    };
  },
};

export interface CreateEventPayload {
  title: string;
  [key: string]: unknown;
}
export interface AdminStats {
  totalEvents: number;
  totalUsers: number;
  totalBrands: number;
  pendingApproval: number;
  rejectedEvents: number;
  reportedUsers: number;
}

export interface PendingEvent {
  id: string;
  name: string;
  startDate: string;
  status: string;
  createdBy: string;
  location: string;
}

export interface UserPreview {
  id: string;
  email: string;
  role: string;
}
export interface UpdateUserPayload {
  name?: string;
  email?: string;
  role?: string;
}

export interface UpdateBrandPayload {
  name?: string;
}

export interface SuperadminMembershipPayload {
  user_id: string | number;
  role: string;
}

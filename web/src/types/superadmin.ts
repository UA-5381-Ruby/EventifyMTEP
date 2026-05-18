export interface CreateEventPayload {
    title: string;
    [key: string]: any;
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
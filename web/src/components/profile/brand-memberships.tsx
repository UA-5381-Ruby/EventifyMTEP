import React from 'react';
import { Badge } from '@/components/ui/badge';
import type { UserMembership } from '@/types/user';
import { getInitials } from '@/lib/formatters';

interface BrandMembershipsProps {
  memberships: UserMembership[];
}

// Маппінг ролей на стилі бейджів
const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case 'owner':
      return 'success';
    case 'admin':
      return 'primary';
    case 'manager':
      return 'secondary';
    case 'member':
      return 'default';
    default:
      return 'default';
  }
};

export function BrandMemberships({ memberships }: BrandMembershipsProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">My Memberships</h3>
      <div className="flex flex-col gap-3">
        {memberships.map((membership) => {
          const brandInitials = getInitials(membership.brand.name);

          return (
            <div
              key={membership.id}
              className="flex items-center justify-between p-3 bg-white rounded-md border border-neutral-200 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-neutral-100 rounded-sm flex items-center justify-center text-neutral-400 overflow-hidden shrink-0">
                  {membership.brand.logo_url ? (
                    <img
                      src={membership.brand.logo_url}
                      alt={brandInitials}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-semibold uppercase">{brandInitials}</span>
                  )}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="font-semibold text-sm text-neutral-900 truncate">
                    {membership.brand.name}
                  </span>
                  <span className="text-xs text-neutral-500 truncate">
                    {membership.brand.subdomain}.eventify.com
                  </span>
                </div>
              </div>
              <Badge variant={getRoleBadgeVariant(membership.role)}>
                {membership.role.charAt(0).toUpperCase() + membership.role.slice(1)}
              </Badge>
            </div>
          );
        })}
        {memberships.length === 0 && (
          <p className="text-sm text-neutral-500">You don't belong to any brands yet.</p>
        )}
      </div>
    </div>
  );
}

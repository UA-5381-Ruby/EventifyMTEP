import { type ChangeEvent } from 'react';

interface MembersToolbarProps {
  search: string;
  roleFilter: string;
  onSearchChange: (value: string) => void;
  onRoleFilterChange: (value: string) => void;
}

export const MembersToolbar = ({
  search,
  roleFilter,
  onSearchChange,
  onRoleFilterChange,
}: MembersToolbarProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 ml-1">
      <input
        type="text"
        placeholder="Search by name or email..."
        value={search}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
        className="flex-1 px-4 py-2 text-xs font-medium border border-neutral-200 bg-white text-neutral-900 rounded-none placeholder-neutral-400 focus:outline-none focus:border-black transition-colors"
      />

      <select
        value={roleFilter}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => onRoleFilterChange(e.target.value)}
        className="px-4 py-2 text-xs font-black uppercase tracking-widest border border-neutral-200 bg-white text-neutral-900 rounded-none focus:outline-none focus:border-black cursor-pointer transition-colors"
      >
        <option value="all">All Roles</option>
        <option value="owner">Owners</option>
        <option value="manager">Managers</option>
        <option value="member">Members</option>
      </select>
    </div>
  );
};

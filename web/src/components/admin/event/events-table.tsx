import { Link } from 'react-router-dom';
import type { Event } from '@/types/event.ts';
import { StatusBadge } from '../shared.tsx';

interface EventsTableProps {
  events: Event[];
  canManage?: boolean;
}

export const EventsTable = ({ events, canManage = true }: EventsTableProps) => (
  <div className="border border-neutral-200 overflow-hidden bg-white">
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="bg-neutral-50 text-[11px] uppercase tracking-widest text-neutral-500 border-b border-neutral-200">
          <th className="px-6 py-4 font-bold">Event Name</th>
          <th className="px-6 py-4 font-bold">Date</th>
          <th className="px-6 py-4 font-bold">Status</th>
          <th className="px-6 py-4 font-bold text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-neutral-100">
        {events.length > 0 ? (
          events.map((event) => (
            <tr key={event.id} className="group hover:bg-neutral-50 transition-colors">
              <td className="px-6 py-5 font-bold text-neutral-900">{event.title}</td>
              <td className="px-6 py-5 text-neutral-500 text-sm">
                {new Date(event.start_date).toLocaleDateString('en-GB')}
              </td>
              <td className="px-6 py-5">
                <StatusBadge status={event.status} />
              </td>
              <td className="px-6 py-5 text-right">
                {canManage ? (
                  <Link
                    to={`/dashboard/events/${event.id}`}
                    className="text-xs font-black uppercase tracking-tighter hover:underline cursor-pointer"
                  >
                    Manage
                  </Link>
                ) : (
                  <span className="text-neutral-300 text-xs uppercase font-bold">Locked</span>
                )}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={4} className="px-6 py-10 text-center text-neutral-400 text-sm">
              No recent events.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

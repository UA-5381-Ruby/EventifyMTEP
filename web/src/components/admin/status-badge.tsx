export const StatusBadge = ({ status }: { status: string }) => (
  <span className="text-[10px] font-black uppercase px-2 py-1 bg-neutral-100 border border-neutral-200 text-neutral-600">
    {status.replace('_', ' ')}
  </span>
);

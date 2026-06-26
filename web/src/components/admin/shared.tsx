import { Link } from 'react-router-dom';

export const StatusBadge = ({ status }: { status: string }) => (
  <span className="text-[10px] font-black uppercase px-2 py-1 bg-neutral-100 border border-neutral-200 text-neutral-600">
    {status.replace('_', ' ')}
  </span>
);

export const SectionHeader = ({
  title,
  linkTo,
  linkLabel,
}: {
  title: string;
  linkTo: string;
  linkLabel: string;
}) => (
  <div className="flex justify-between items-center border-b border-neutral-100 pb-4">
    <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
    <Link
      to={linkTo}
      className="text-sm font-semibold text-neutral-400 hover:text-black transition-colors underline decoration-neutral-200 underline-offset-4"
    >
      {linkLabel}
    </Link>
  </div>
);

export const StatCard = ({ label, value }: { label: string; value: number | undefined }) => (
  <div className="border border-neutral-200 p-8 space-y-4 hover:border-black transition-colors group cursor-default bg-white">
    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-400 group-hover:text-black transition-colors">
      {label}
    </p>
    <p className="text-6xl font-bold tracking-tighter transition-transform duration-500 group-hover:translate-x-1">
      {(value ?? 0).toString().padStart(2, '0')}
    </p>
  </div>
);

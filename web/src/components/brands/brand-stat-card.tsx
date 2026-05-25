interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  subVariant?: 'green' | 'amber' | 'neutral';
  isLoading?: boolean;
}

export function BrandStatCard({
  label,
  value,
  sub,
  subVariant = 'neutral',
  isLoading = false,
}: StatCardProps) {
  const subColor = {
    green: 'text-emerald-600 bg-emerald-50 border-emerald-100/50',
    amber: 'text-amber-600 bg-amber-50 border-amber-100/50',
    neutral: 'text-neutral-500 bg-neutral-50 border-neutral-100/80',
  }[subVariant];

  return (
    <div className="flex flex-col justify-between gap-3 px-6 py-5 transition-colors duration-200 hover:bg-neutral-50/40">
      <div className="space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
          {label}
        </span>
        <div className="flex items-center h-8">
          {isLoading ? (
            <div className="h-5 w-12 rounded-md bg-neutral-100 animate-pulse" />
          ) : (
            <span className="text-2xl font-bold text-neutral-900 tracking-tight truncate block">
              {value}
            </span>
          )}
        </div>
      </div>
      <div>
        <span
          className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-md border ${subColor}`}
        >
          {sub}
        </span>
      </div>
    </div>
  );
}

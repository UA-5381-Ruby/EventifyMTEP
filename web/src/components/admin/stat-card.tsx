export const StatCard = ({ label, value }: { label: string; value: number | undefined }) => {
  const displayValue = value ?? 0;
  return (
    <div className="border border-neutral-200 p-8 space-y-4 hover:border-black transition-colors group cursor-default bg-white">
      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-400 group-hover:text-black transition-colors">
        {label}
      </p>
      <p className="text-6xl font-bold tracking-tighter transition-transform duration-500 group-hover:translate-x-1">
        {displayValue.toString().padStart(2, '0')}
      </p>
    </div>
  );
};

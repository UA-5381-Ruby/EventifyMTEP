interface BrandColorPaletteProps {
  primaryColor: string;
  secondaryColor: string;
  primaryRaw?: string;
  secondaryRaw?: string;
}

export function BrandColorPalette({
  primaryColor,
  secondaryColor,
  primaryRaw,
  secondaryRaw,
}: BrandColorPaletteProps) {
  const colorChip = (color: string, hex: string | undefined, label: string) => (
    <div className="inline-flex items-center gap-2 px-2.5 py-1.5 bg-neutral-50/80 border border-neutral-200/50 rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
      <span
        className="w-3.5 h-3.5 rounded-md border border-neutral-950/10 shrink-0 shadow-sm"
        style={{ backgroundColor: color }}
      />
      <span className="text-xs font-mono font-bold text-neutral-700 uppercase tracking-tight">
        {hex || '—'}
      </span>
      <span className="text-[10px] text-neutral-400 font-sans border-l border-neutral-200 pl-2 ml-0.5">
        {label}
      </span>
    </div>
  );

  return (
    <div className="flex flex-col justify-between gap-4 px-6 py-5 transition-colors duration-200 hover:bg-neutral-50/40">
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
          Brand Palette
        </span>
        <div className="flex flex-wrap items-center gap-2 h-auto sm:h-8">
          {colorChip(primaryColor, primaryRaw, 'Primary')}
          <span className="text-neutral-300 text-xs hidden sm:inline">·</span>
          {colorChip(secondaryColor, secondaryRaw, 'Secondary')}
        </div>
      </div>
    </div>
  );
}

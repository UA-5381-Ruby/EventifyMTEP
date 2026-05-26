interface ColorFieldProps {
  label: string;
  value: string;
  fallback: string;
  onChange: (value: string) => void;
}

export function ColorField({ label, value, fallback, onChange }: ColorFieldProps) {
  const current = value || fallback;

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-neutral-600">{label}</label>
      <div className="flex items-center gap-2 border border-neutral-200 rounded-lg px-3 py-2 focus-within:border-primary-400 transition-colors">
        <input
          type="color"
          value={current}
          onChange={(e) => onChange(e.target.value)}
          className="w-6 h-6 rounded-md cursor-pointer bg-transparent p-0 shrink-0 border border-neutral-200 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-md [&::-moz-color-swatch]:border-none [&::-moz-color-swatch]:rounded-md"
        />
        <input
          type="text"
          value={current}
          onChange={(e) => {
            const hex = e.target.value;
            if (/^#[0-9a-fA-F]{0,6}$/.test(hex)) onChange(hex);
          }}
          onBlur={(e) => {
            if (!/^#[0-9a-fA-F]{6}$/.test(e.target.value)) onChange(fallback);
          }}
          maxLength={7}
          className="w-full text-sm font-mono text-neutral-700 bg-transparent border-0 outline-none uppercase"
          placeholder={fallback}
        />
      </div>
    </div>
  );
}

import { Back } from '@/components/ui/back';

interface BrandHeaderProps {
  name: string;
  subdomain: string;
  description?: string | null;
  logoUrl?: string | null;
  primaryColor: string;
  secondaryColor: string;
}

export function BrandHeader({
  name,
  subdomain,
  description,
  logoUrl,
  primaryColor,
  secondaryColor,
}: BrandHeaderProps) {
  return (
    <div className="flex items-start gap-4 pb-6 border-b border-neutral-100/80">
      <Back />
      {logoUrl ? (
        <div className="p-0.5 rounded-2xl bg-white border border-neutral-100 shadow-sm shrink-0">
          <img src={logoUrl} alt={name} className="w-16 h-16 rounded-[14px] object-cover" />
        </div>
      ) : (
        <div
          className="w-16 h-16 rounded-2xl text-white font-bold text-2xl flex items-center justify-center shrink-0 shadow-sm"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
          }}
        >
          {name.charAt(0).toUpperCase()}
        </div>
      )}

      <div className="min-w-0 space-y-1">
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">{name}</h1>

        <a
          href={`https://${subdomain}.eventify.com`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-primary-600 hover:text-primary-700 inline-flex items-center gap-1.5 transition-colors"
        >
          {subdomain}.eventify.com
        </a>

        {description && (
          <p className="text-sm text-neutral-500 leading-relaxed max-w-2xl pt-1">{description}</p>
        )}
      </div>
    </div>
  );
}

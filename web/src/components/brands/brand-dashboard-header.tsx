import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';
import type { BrandWithEvents } from '@/types/brand';

interface BrandDashboardHeaderProps {
  brand: BrandWithEvents;
  primaryColor: string;
  secondaryColor: string;
  onEdit: () => void;
}

export function BrandDashboardHeader({
  brand,
  primaryColor,
  secondaryColor,
  onEdit,
}: BrandDashboardHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col md:flex-row items-start justify-between gap-6 pb-6 border-b border-neutral-100/80">
      <div className="flex items-start gap-4 flex-1 min-w-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/brands')}
          aria-label="Go back"
          className="mt-1 h-8 w-8 p-0 flex items-center justify-center rounded-xl border border-neutral-200/40 bg-white shadow-sm hover:bg-neutral-50"
        >
          <svg
            className="w-4 h-4 text-neutral-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Button>

        {brand.logo_url ? (
          <div className="p-0.5 rounded-2xl bg-white border border-neutral-100 shadow-sm shrink-0">
            <img
              src={brand.logo_url}
              alt={brand.name}
              className="w-16 h-16 rounded-[14px] object-cover"
            />
          </div>
        ) : (
          <div
            className="w-16 h-16 rounded-2xl text-white font-bold text-2xl flex items-center justify-center shrink-0 tracking-wider shadow-sm"
            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
          >
            {brand.name.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="flex-1 min-w-0 space-y-1">
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">{brand.name}</h1>

          <a
            href={`https://${brand.subdomain}.eventify.com`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-primary-600 hover:text-primary-700 inline-flex items-center gap-1.5 transition-colors"
          >
            <svg
              className="w-3.5 h-3.5 stroke-primary-500 shrink-0"
              fill="none"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
            </svg>
            {brand.subdomain}.eventify.com
          </a>

          {brand.description && (
            <p className="text-sm text-neutral-500 leading-relaxed max-w-2xl pt-1">
              {brand.description}
            </p>
          )}
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onEdit}
        className="font-medium border-neutral-200 text-neutral-600 bg-white hover:bg-neutral-50 shadow-sm rounded-xl px-4"
      >
        Edit brand settings
      </Button>
    </div>
  );
}

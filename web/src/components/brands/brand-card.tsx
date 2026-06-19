import { useNavigate } from 'react-router-dom';
import { Badge, Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { Brand } from '@/types/brand';

interface BrandCardProps {
  brand: Brand;
  isSuperAdmin?: boolean;
  onDelete?: (brandId: string | number, brandName: string) => void;
}

export function BrandCard({ brand, isSuperAdmin, onDelete }: BrandCardProps) {
  const navigate = useNavigate();
  const primaryColor = brand.primary_color || '#6366f1';
  const secondaryColor = brand.secondary_color || '#a855f7';
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(brand.id, brand.name);
    }
  };

  return (
    <article
      className={cn(
        'group relative flex flex-col h-full rounded-2xl bg-white border border-neutral-100/80 p-5 transition-all duration-300 ease-out',
        'hover:shadow-[0_12px_30px_-10px_rgba(0,0,0,0.06)] hover:border-neutral-200'
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          {brand.logo_url ? (
            <div className="relative p-0.5 rounded-xl bg-gradient-to-tr from-neutral-100 to-neutral-50 border border-neutral-100 shrink-0 shadow-sm">
              <img
                src={brand.logo_url}
                alt={brand.name}
                className="w-11 h-11 rounded-[10px] object-cover"
              />
            </div>
          ) : (
            <div
              className="w-12 h-12 rounded-xl text-white font-bold text-base flex items-center justify-center shrink-0 shadow-sm"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
              }}
            >
              {brand.name.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-neutral-800 leading-snug truncate group-hover:text-neutral-900 transition-colors">
              {brand.name}
            </h3>
            <div className="inline-flex items-center gap-1 mt-0.5 text-xs text-neutral-400 transition-colors">
              <a
                href={`https://${brand.subdomain}.eventify.com`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium hover:text-primary-700 inline-flex items-center transition-colors"
              >
                {brand.subdomain}
                <span className="text-neutral-300 group-hover:text-primary-300">.eventify.com</span>
              </a>
            </div>
          </div>
        </div>

        <Badge variant="outline">Brand</Badge>
      </div>

      <div className="flex-1 mb-5">
        {brand.description ? (
          <p className="text-sm text-neutral-500 leading-relaxed line-clamp-2 font-normal">
            {brand.description}
          </p>
        ) : (
          <p className="text-xs text-neutral-300 italic font-normal">
            No description provided for this brand.
          </p>
        )}
      </div>
      <div className="flex gap-2 w-full mt-auto">
        <div className="flex-1">
          <Button
            variant="outline"
            size="sm"
            fullWidth
            onClick={() => navigate(`/brands/${brand.id}`)}
          >
            View Details
          </Button>
        </div>
        {isSuperAdmin && (
          <button
            onClick={handleDeleteClick}
            className="px-3 flex items-center justify-center rounded-md border border-red-200 bg-white text-red-600 text-sm font-medium hover:bg-red-50 hover:text-red-700 transition-colors"
            title="Delete Brand"
          >
            Delete
          </button>
        )}
      </div>
    </article>
  );
}

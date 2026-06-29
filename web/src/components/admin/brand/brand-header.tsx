import { useNavigate } from 'react-router-dom';
import type { Brand } from '@/types/brand';
import { Button } from '@/components/ui';

interface BrandHeaderProps {
  brand: Brand;
}

export const BrandHeader = ({ brand }: BrandHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-neutral-200 pb-8">
      <div className="flex items-start md:items-center gap-6">
        <div className="w-24 h-24 bg-white border-2 border-black flex items-center justify-center p-2 shrink-0 select-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          {brand.logo_url ? (
            <img
              src={brand.logo_url}
              alt={`${brand.name} logo`}
              className="w-full h-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
            />
          ) : (
            <span className="text-4xl font-black text-black font-mono">
              {brand.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="space-y-1.5">
          <h1 className="text-4xl font-bold tracking-tight text-black">{brand.name}</h1>
          <a
            href={`https://${brand.subdomain}.eventify.com`}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 text-neutral-500 hover:text-black font-mono text-sm tracking-tight transition-colors"
          >
            <span>{brand.subdomain}.eventify.com</span>
            <span className="transform translate-y-[-1px] opacity-0 group-hover:opacity-100 transition-all duration-200 font-sans text-xs">
              ↗
            </span>
          </a>
        </div>
      </div>

      <Button
        onClick={() => navigate('/dashboard/settings')}
        className="bg-black text-white rounded-none px-10 py-6 hover:bg-neutral-800 transition-all active:scale-95 border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)] hover:shadow-none"
      >
        Edit Brand
      </Button>
    </div>
  );
};

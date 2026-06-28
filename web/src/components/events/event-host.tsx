import type { EventDetail } from '@/types/event';
import { Button } from '@/components/ui/button';
import { useReduxState } from '@/hooks/use-redux-state';

interface EventHostSectionProps {
  brand: EventDetail['brand'];
}

export function EventHostSection({ brand }: EventHostSectionProps) {
  const [following, setFollowing] = useReduxState(false);
  const [followingVariant, setFollowingVariant] = useReduxState<'primary' | 'secondary'>(
    'secondary'
  );

  const processFollow = () => {
    setFollowingVariant(following ? 'secondary' : 'primary');
    setFollowing(!following);
  };

  return (
    <div className="py-6">
      <p className="text-sm font-semibold text-neutral-800 mb-3">Hosted by</p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-neutral-200 overflow-hidden shrink-0 flex items-center justify-center">
          {brand?.logoUrl ? (
            <img src={brand.logoUrl} alt={brand.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs font-bold text-neutral-500">{brand?.name?.[0] ?? 'B'}</span>
          )}
        </div>

        <span className="text-sm font-medium text-neutral-800 flex-1">
          {brand?.name ?? 'Unknown Brand'}
        </span>

        <div className="flex items-center gap-2">
          <Button>Contact</Button>
          <Button variant={followingVariant} onClick={processFollow}>
            {following ? 'Following' : '+ Follow'}
          </Button>
        </div>
      </div>
    </div>
  );
}

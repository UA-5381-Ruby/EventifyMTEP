import { Avatar } from '@/components/ui/avatar';
import { formatDate } from '@/lib/formatters';

interface ProfileHeaderProps {
    name: string;
    createdAt: string;
}

export function ProfileHeader({ name, createdAt }: ProfileHeaderProps) {
    return (
        <div className="flex flex-col items-center text-center">
            <Avatar name={name} size="xl" className="mb-4" />
            <h2 className="text-2xl font-bold text-neutral-900">{name}</h2>
            <p className="text-sm text-neutral-500 mt-1">
                Member since {formatDate(createdAt)}
            </p>
        </div>
    );
}
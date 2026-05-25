import React from 'react';
import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/formatters';

interface AvatarProps {
  name?: string;
  src?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeStyles = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-12 w-12 text-sm',
  lg: 'h-24 w-24 text-2xl',
  xl: 'h-32 w-32 text-4xl',
};

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center overflow-hidden rounded-full bg-secondary-200 text-neutral-700 font-semibold',
        sizeStyles[size],
        className
      )}
    >
      {src ? (
        <img src={src} alt={name || 'Avatar'} className="h-full w-full object-cover" />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
}

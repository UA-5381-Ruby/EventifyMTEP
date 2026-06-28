import React, { useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useReduxState } from '@/hooks/use-redux-state';

interface EventBannerUploadProps {
  banner: File | null;
  onChange: (file: File | null) => void;
}

export const EventBannerUpload: React.FC<EventBannerUploadProps> = ({ banner, onChange }) => {
  const [isDragging, setIsDragging] = useReduxState(false);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.files?.[0] || null);
    },
    [onChange]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0] || null;
      if (file) onChange(file);
    },
    [onChange]
  );

  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-1">Event Banner</label>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'mt-1 flex flex-col items-center justify-center rounded-md border-2 border-dashed px-6 py-6 transition-colors duration-200',
          isDragging
            ? 'border-primary-500 bg-primary-50'
            : 'border-neutral-300 hover:border-neutral-400 bg-white'
        )}
      >
        <input
          id="event-banner-upload"
          type="file"
          className="hidden"
          accept="image/jpeg, image/png, image/webp, image/gif, image/svg+xml"
          onChange={handleFileChange}
        />

        {banner ? (
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm font-medium text-neutral-900">{banner.name}</p>
            <label
              htmlFor="event-banner-upload"
              className="cursor-pointer text-xs text-primary-600 hover:text-primary-700 underline"
            >
              Change file
            </label>
          </div>
        ) : (
          <label
            htmlFor="event-banner-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            <span className="text-sm text-neutral-500">Upload banner</span>
            <span className="text-sm text-neutral-500">/ Drag & Drop file</span>
          </label>
        )}
      </div>
    </div>
  );
};

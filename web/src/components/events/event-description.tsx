interface EventDescriptionSectionProps {
  description: string | null;
}

export function EventDescriptionSection({ description }: EventDescriptionSectionProps) {
  if (!description) return null;

  return (
    <div className="py-6">
      <p className="text-sm font-semibold text-neutral-800 mb-3">Event Description</p>
      <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-line">{description}</p>
    </div>
  );
}

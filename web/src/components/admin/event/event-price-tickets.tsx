import React from 'react';
import { Input } from '@/components/ui';

interface EventPriceTicketsProps {
  priceCents: number | undefined;
  availableTicketsCount: number;
  onFieldChange: (field: 'price_cents' | 'available_tickets_count', value: number) => void;
}

const formatCentsToAmount = (cents: number | undefined): string => {
  return cents ? (cents / 100).toFixed(2) : '';
};

const parseAmountToCents = (value: string): number => {
  const parsed = parseFloat(value);
  return Number.isNaN(parsed) ? 0 : Math.round(parsed * 100);
};

export const EventPriceTickets: React.FC<EventPriceTicketsProps> = ({
  priceCents,
  availableTicketsCount,
  onFieldChange,
}) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Input
        type="number"
        label="Price (UAH)"
        value={formatCentsToAmount(priceCents)}
        onChange={(e) => onFieldChange('price_cents', parseAmountToCents(e.target.value))}
        className="text-sm"
        min={0}
        step="0.01"
        placeholder="0.00"
      />
      <Input
        type="number"
        label="Available tickets"
        value={availableTicketsCount || ''}
        onChange={(e) =>
          onFieldChange(
            'available_tickets_count',
            e.target.value ? Math.max(0, parseInt(e.target.value, 10)) : 0
          )
        }
        className="text-sm"
        min={0}
        step={1}
        placeholder="0"
      />
    </div>
  );
};

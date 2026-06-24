import React from 'react';
import { Input } from '@/components/ui';

interface DateTimeParsed {
  date: string;
  time: string;
}

interface EventDatesInputProps {
  startDateParsed: DateTimeParsed;
  endDateParsed: DateTimeParsed;
  onDateChange: (field: 'start_date' | 'end_date', date: string, time: string) => void;
}

export const EventDatesInput: React.FC<EventDatesInputProps> = ({
  startDateParsed,
  endDateParsed,
  onDateChange,
}) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1">
        <label className="text-sm font-medium text-neutral-600">Start date *</label>
        <div className="grid grid-cols-[3fr_2fr] gap-1.5">
          <Input
            type="date"
            value={startDateParsed.date}
            onChange={(e) => onDateChange('start_date', e.target.value, startDateParsed.time)}
            className="text-sm"
            lang="uk"
          />
          <Input
            type="time"
            value={startDateParsed.time}
            onChange={(e) => onDateChange('start_date', startDateParsed.date, e.target.value)}
            className="text-sm"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-neutral-600">End date</label>
        <div className="grid grid-cols-[3fr_2fr] gap-1.5">
          <Input
            type="date"
            value={endDateParsed.date}
            onChange={(e) => onDateChange('end_date', e.target.value, endDateParsed.time)}
            className="text-sm"
            lang="uk"
          />
          <Input
            type="time"
            value={endDateParsed.time}
            onChange={(e) => onDateChange('end_date', endDateParsed.date, e.target.value)}
            className="text-sm"
          />
        </div>
      </div>
    </div>
  );
};

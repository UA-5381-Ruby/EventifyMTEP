import React from 'react';
import { Input } from '@/components/ui/input.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import { Type, AlignLeft, MapPin, Calendar } from 'lucide-react';

interface EventFormData {
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
}

interface EventFormFieldsProps {
  formData: EventFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const EventFormFields = ({ formData, onChange }: EventFormFieldsProps) => (
  <div className="space-y-6">
    <div className="space-y-2">
      <label className="text-[11px] font-black uppercase tracking-[0.15em] text-neutral-400 flex items-center gap-2">
        <Type className="w-3 h-3" /> Event Title *
      </label>
      <Input
        name="title"
        required
        value={formData.title}
        onChange={onChange}
        className="rounded-none border-neutral-300 focus:border-black h-12 text-sm"
      />
    </div>

    <div className="space-y-2">
      <label className="text-[11px] font-black uppercase tracking-[0.15em] text-neutral-400 flex items-center gap-2">
        <AlignLeft className="w-3 h-3" /> Description
      </label>
      <Textarea
        name="description"
        rows={4}
        value={formData.description}
        onChange={onChange}
        className="rounded-none border-neutral-300 focus:border-black resize-none text-sm p-3"
      />
    </div>

    <div className="space-y-2">
      <label className="text-[11px] font-black uppercase tracking-[0.15em] text-neutral-400 flex items-center gap-2">
        <MapPin className="w-3 h-3" /> Location
      </label>
      <Input
        name="location"
        value={formData.location}
        onChange={onChange}
        className="rounded-none border-neutral-300 focus:border-black h-12 text-sm"
      />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <label className="text-[11px] font-black uppercase tracking-[0.15em] text-neutral-400 flex items-center gap-2">
          <Calendar className="w-3 h-3" /> Start Date *
        </label>
        <Input
          type="datetime-local"
          name="start_date"
          required
          value={formData.start_date}
          onChange={onChange}
          className="rounded-none border-neutral-300 h-12 text-sm"
        />
      </div>
      <div className="space-y-2">
        <label className="text-[11px] font-black uppercase tracking-[0.15em] text-neutral-400 flex items-center gap-2">
          <Calendar className="w-3 h-3" /> End Date
        </label>
        <Input
          type="datetime-local"
          name="end_date"
          value={formData.end_date}
          onChange={onChange}
          className="rounded-none border-neutral-300 h-12 text-sm"
        />
      </div>
    </div>
  </div>
);

import { Input } from './input';
import { Search } from 'lucide-react';

interface SearchInputProps {
  value: string;
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function SearchInput({ value, placeholder = 'Search…', onChange }: SearchInputProps) {
  return (
    <Input
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      leftIcon={<Search size={16} className="text-neutral-500" />}
    />
  );
}

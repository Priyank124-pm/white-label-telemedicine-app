'use client';

import { Search } from 'lucide-react';
import { Input } from './input';

interface SearchInputProps {
  value:       string;
  onChange:    (v: string) => void;
  placeholder?: string;
  className?:  string;
}

export function SearchInput({ value, onChange, placeholder = 'Search...', className }: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9"
      />
    </div>
  );
}

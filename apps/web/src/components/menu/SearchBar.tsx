'use client';
import { Search, X, Flame } from 'lucide-react';
import { Input } from '@/components/ui/Input';

interface Props {
  value: string;
  onChange: (v: string) => void;
  dishType: string;
  onDishTypeChange: (v: string) => void;
}

export function SearchBar({ value, onChange, dishType, onDishTypeChange }: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={17} />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search menu (e.g. Biryani, Burger, Roll, Chai)..."
          className="pl-10 pr-9 h-11 rounded-xl bg-card border-border/80 shadow-sm text-sm"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Dietary filter pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
        {[
          { label: 'All Dishes', value: '' },
          { label: '🟢 Veg Only', value: 'veg' },
          { label: '🔴 Non-Veg', value: 'non_veg' },
        ].map((f) => {
          const isActive = dishType === f.value;
          return (
            <button
              key={f.value}
              onClick={() => onDishTypeChange(f.value)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex-shrink-0 ${
                isActive
                  ? 'bg-foreground text-background shadow-md'
                  : 'bg-card border border-border text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

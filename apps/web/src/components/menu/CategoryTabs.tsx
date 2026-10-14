'use client';
import { useRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { Sparkles, Utensils } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  _count?: { items?: number };
  items?: unknown[];
}

interface Props {
  categories: Category[];
  selected: string | null;
  onSelect: (id: string | null) => void;
  orientation?: 'horizontal' | 'vertical';
}

function getCategoryIcon(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('starter') || n.includes('appetizer')) return '🥗';
  if (n.includes('main') || n.includes('curry') || n.includes('course')) return '🍛';
  if (n.includes('bread') || n.includes('roti') || n.includes('naan') || n.includes('rice')) return '🫓';
  if (n.includes('burger')) return '🍔';
  if (n.includes('side') || n.includes('fry') || n.includes('fries')) return '🍟';
  if (n.includes('sushi') || n.includes('roll') || n.includes('sashimi') || n.includes('nigiri')) return '🍣';
  if (n.includes('ramen') || n.includes('noodle')) return '🍜';
  if (n.includes('dessert') || n.includes('sweet')) return '🍨';
  if (n.includes('drink') || n.includes('beverage') || n.includes('shake') || n.includes('tea') || n.includes('chai')) return '🍹';
  return '🍽️';
}

export function CategoryTabs({ categories, selected, onSelect, orientation = 'horizontal' }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (orientation === 'vertical') {
    return (
      <div className="space-y-1">
        <button
          onClick={() => onSelect(null)}
          className={twMerge(
            'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left',
            !selected
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          )}
        >
          <span className="flex items-center gap-2">
            <Sparkles size={14} /> All Categories
          </span>
          <span className="text-[10px] opacity-75">All</span>
        </button>

        {categories.map((cat) => {
          const isSelected = selected === cat.id;
          const count = cat.items?.length ?? cat._count?.items;
          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={twMerge(
                'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left',
                isSelected
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <span className="flex items-center gap-2 truncate">
                <span>{getCategoryIcon(cat.name)}</span>
                <span className="truncate">{cat.name}</span>
              </span>
              {typeof count === 'number' && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isSelected ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex gap-2 overflow-x-auto py-2 px-1 scrollbar-hide">
      <button
        onClick={() => onSelect(null)}
        className={twMerge(
          'flex-shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm',
          !selected
            ? 'bg-primary text-primary-foreground ring-2 ring-primary/30'
            : 'bg-card border border-border text-muted-foreground hover:bg-muted hover:text-foreground',
        )}
      >
        <Sparkles size={13} />
        <span>All</span>
      </button>

      {categories.map((cat) => {
        const isSelected = selected === cat.id;
        const count = cat.items?.length ?? cat._count?.items;
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={twMerge(
              'flex-shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm',
              isSelected
                ? 'bg-primary text-primary-foreground ring-2 ring-primary/30'
                : 'bg-card border border-border text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <span>{getCategoryIcon(cat.name)}</span>
            <span>{cat.name}</span>
            {typeof count === 'number' && count > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                isSelected ? 'bg-primary-foreground/20' : 'bg-muted'
              }`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

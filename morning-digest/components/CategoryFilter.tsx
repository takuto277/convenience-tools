'use client';

import { Category } from '@/lib/types';

const CATEGORIES: { value: Category | 'all'; label: string; color: string }[] = [
  { value: 'all', label: 'すべて', color: 'bg-gray-200 text-gray-800' },
  { value: 'frontend', label: 'Frontend', color: 'bg-blue-100 text-blue-800' },
  { value: 'go', label: 'Go', color: 'bg-cyan-100 text-cyan-800' },
  { value: 'ai', label: 'AI/ML', color: 'bg-purple-100 text-purple-800' },
  { value: 'mobile', label: 'Mobile', color: 'bg-green-100 text-green-800' },
  { value: 'general', label: 'General', color: 'bg-orange-100 text-orange-800' },
];

interface Props {
  selected: Category | 'all';
  onChange: (cat: Category | 'all') => void;
  counts: Record<string, number>;
}

export function CategoryFilter({ selected, onChange, counts }: Props) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {CATEGORIES.map(({ value, label, color }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${color} ${
            selected === value
              ? 'opacity-100 ring-2 ring-offset-1 ring-gray-400'
              : 'opacity-50 hover:opacity-75'
          }`}
        >
          {label}
          {counts[value] != null && (
            <span className="ml-1 opacity-60">({counts[value]})</span>
          )}
        </button>
      ))}
    </div>
  );
}

'use client';

import { Category, CATEGORIES } from '@/lib/types';

interface FilterBarProps {
  activeCategory: Category | 'all';
  onCategoryChange: (category: Category | 'all') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function FilterBar({ activeCategory, onCategoryChange, searchQuery, onSearchChange }: FilterBarProps) {
  return (
    <div className="bg-white border-b border-gray-100 sticky top-[57px] z-40">
      <div className="max-w-4xl mx-auto px-4 py-3 space-y-3">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search deals..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          <button
            onClick={() => onCategoryChange('all')}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
              activeCategory === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => onCategoryChange(cat.value)}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                activeCategory === cat.value
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
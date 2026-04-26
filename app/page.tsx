'use client';

import { useState, useEffect, useMemo } from 'react';
import { getDeals, searchDeals, getDealsByCategory } from '@/lib/deals';
import { Deal, Category } from '@/lib/types';
import DealCard from '@/components/DealCard';
import FilterBar from '@/components/FilterBar';

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDeals() {
      setLoading(true);
      let fetchedDeals: Deal[];
      
      if (searchQuery) {
        fetchedDeals = await searchDeals(searchQuery);
      } else if (activeCategory === 'all') {
        fetchedDeals = await getDeals();
      } else {
        fetchedDeals = await getDealsByCategory(activeCategory);
      }
      
      setDeals(fetchedDeals);
      setLoading(false);
    }
    
    fetchDeals();
  }, [activeCategory, searchQuery]);

  const filteredDeals = useMemo(() => {
    return deals.filter(d => new Date(d.expiry) > new Date());
  }, [deals]);

  return (
    <div>
      <FilterBar 
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <div className="max-w-4xl mx-auto px-4 py-4">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="h-6 w-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : filteredDeals.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-5xl block mb-4">🥬</span>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No deals found</h2>
            <p className="text-gray-500 mb-4">Be the first to post something!</p>
            <a 
              href="/add"
              className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              Add a Deal
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredDeals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        )}
        
        <div className="mt-8 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>♻️ KK Deals | Reducing food waste in Kota Kinabalu</p>
        </div>
      </div>
    </div>
  );
}
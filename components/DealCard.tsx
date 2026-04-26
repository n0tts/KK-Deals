'use client';

import Link from 'next/link';
import { Deal } from '@/lib/types';
import { getCategoryInfo } from '@/lib/types';
import { useMemo } from 'react';

interface DealCardProps {
  deal: Deal;
}

export default function DealCard({ deal }: DealCardProps) {
  const category = getCategoryInfo(deal.category);
  
  const { isExpiring, isUrgent } = useMemo(() => {
    const expiry = new Date(deal.expiry);
    const now = new Date();
    const hoursUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60);
    return {
      isExpiring: hoursUntilExpiry < 24,
      isUrgent: hoursUntilExpiry < 6,
    };
  }, [deal.expiry]);

  return (
    <Link 
      href={`/deal/${deal.id}`}
      className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100"
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-2xl">{category.icon}</span>
          <span className={`text-xs px-2 py-1 rounded-full ${
            deal.price === 0 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {deal.price === 0 ? 'FREE' : `RM${deal.price}`}
          </span>
        </div>
        
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{deal.title}</h3>
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{deal.description}</p>
        
        <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="truncate">{deal.location}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-1 text-sm ${isUrgent ? 'text-red-600' : isExpiring ? 'text-orange-600' : 'text-gray-500'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              {deal.quantity} · {formatExpiry(deal.expiry)}
            </span>
          </div>
          
          {deal.profile?.display_name && (
            <div className="flex items-center gap-1">
              {deal.profile.photo_url ? (
                <img 
                  src={deal.profile.photo_url} 
                  alt={deal.profile.display_name}
                  className="w-5 h-5 rounded-full object-cover"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-xs text-gray-500">
                    {deal.profile.display_name[0]}
                  </span>
                </div>
              )}
              <span className="text-xs text-gray-500 truncate max-w-[80px]">
                {deal.profile.shop_name || deal.profile.display_name}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function formatExpiry(expiry: string): string {
  const expiryDate = new Date(expiry);
  const now = new Date();
  const diff = expiryDate.getTime() - now.getTime();
  
  if (diff < 0) return 'Expired';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d left`;
  if (hours > 0) return `${hours}h left`;
  return 'Expiring soon';
}
'use client';

import { use } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getDealById, markInterested } from '@/lib/deals';
import { getCategoryInfo } from '@/lib/types';
import { useAuth } from '@/providers/AuthProvider';
import { createClient } from '@/lib/supabase';
import { Deal } from '@/lib/types';

export default function DealDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [showContact, setShowContact] = useState(false);
  const [interestedLoading, setInterestedLoading] = useState(false);
  const [sellerProfile, setSellerProfile] = useState<{
    display_name: string | null;
    phone: string | null;
    shop_name: string | null;
    location: string | null;
  } | null>(null);
  
  const isOwner = user?.id === deal?.userId;
  const canShowContact = showContact || isOwner;

  useEffect(() => {
    async function fetchDeal() {
      const fetchedDeal = await getDealById(id);
      setDeal(fetchedDeal);
      
      if (fetchedDeal?.userId) {
        const { data } = await supabase
          .from('profiles')
          .select('display_name, phone, shop_name, location')
          .eq('id', fetchedDeal.userId)
          .single();
        setSellerProfile(data);
      }
      
      setLoading(false);
    }
    
    fetchDeal();
  }, [id]);

  const handleInterested = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (!deal || !user) return;
    
    setInterestedLoading(true);
    try {
      await markInterested(deal.id, user.id);
      
      if (sellerProfile?.phone) {
        const message = `Hi! I'm interested in your deal: ${deal.title} on KK Deals`;
        const whatsappUrl = `https://wa.me/${sellerProfile.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
      }
      
      setShowContact(true);
    } catch (err) {
      console.error(err);
    } finally {
      setInterestedLoading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!deal) {
    notFound();
  }
  
  const category = getCategoryInfo(deal.category);
  const isExpired = new Date(deal.expiry) < new Date();

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to deals
      </Link>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{category.icon}</span>
              <div>
                <span className="text-sm text-gray-500">{category.label}</span>
                <h1 className="text-2xl font-bold text-gray-900">{deal.title}</h1>
              </div>
            </div>
            <span className={`text-lg font-bold px-3 py-1 rounded-lg ${
              deal.price === 0 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {deal.price === 0 ? 'FREE' : `RM${deal.price}`}
            </span>
          </div>
          
          <p className="text-gray-700 mb-6">{deal.description}</p>
          
          {deal.profile?.display_name && (
            <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 rounded-lg">
              {deal.profile.photo_url ? (
                <img 
                  src={deal.profile.photo_url} 
                  alt={deal.profile.display_name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-700 font-medium">
                    {deal.profile.display_name[0]}
                  </span>
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900">
                  {deal.profile.shop_name || deal.profile.display_name}
                </p>
                {deal.profile.location && (
                  <p className="text-sm text-gray-500">{deal.profile.location}</p>
                )}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-500">📍 Location</p>
              <p className="font-medium">{deal.location}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-500">📦 Available</p>
              <p className="font-medium">{deal.quantity} items</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-500">⏰ Expires</p>
              <p className={`font-medium ${isExpired ? 'text-red-600' : ''}`}>
                {new Date(deal.expiry).toLocaleString('en-MY', {
                  day: 'numeric',
                  month: 'short',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-500">📅 Posted</p>
              <p className="font-medium">
                {new Date(deal.postedAt).toLocaleDateString('en-MY', {
                  day: 'numeric',
                  month: 'short',
                })}
              </p>
            </div>
          </div>
          
          {isExpired ? (
            <div className="w-full bg-gray-200 text-gray-600 py-4 rounded-lg font-medium text-center text-lg">
              This deal has expired
            </div>
          ) : isOwner ? (
            <div className="w-full bg-gray-100 text-gray-600 py-4 rounded-lg font-medium text-center">
              This is your deal
            </div>
          ) : (
            <button
              onClick={handleInterested}
              disabled={interestedLoading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white py-4 rounded-lg font-medium text-center text-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.278-.498.099-.198.05-.371-.025-.52-.075-.149-.66-1.446-1.185-2.192-.528-.746-1.02-1.524-1.07-1.783-.05-.26-.02-.597.15-.885.149-.298.347-.497.496-.596.149-.099.298-.099.496-.05.198.05.396.1.495.15.149.099.248.248.347.347.297.297.297.496.149.745-.149.297-.298.595-.595.795-.297.198-.595.347-.895.496 0 .05.05.198.05.297.05.198.148.396.347.545.198.149.446.347.694.447.248.099.546.099.794.05.248-.05.645-.248.795-.496.149-.248.198-.546.149-.795-.05-.248-.446-.894-.595-1.164-.149-.273-.248-.397-.347-.496-.099-.099-.198-.149-.297-.248-.099-.099-.347-.347-.347-.595 0-.248.149-.496.347-.645.198-.149.397-.298.595-.397.198-.099.397-.099.546-.05.149.05.248.05.347.05.248-.05.496-.149.794-.347.099-.05.248-.099.397-.099.149-.05.248.05.347.149z"/>
              </svg>
              {interestedLoading ? 'Opening WhatsApp...' : "I'm Interested"}
            </button>
          )}
          
          {canShowContact && sellerProfile?.phone && (
            <p className="text-center text-sm text-gray-500 mt-3">
              Seller contact: {sellerProfile.phone}
            </p>
          )}
          
          {!isExpired && !isOwner && !canShowContact && (
            <p className="text-center text-sm text-gray-500 mt-3">
              Click to open WhatsApp and connect with the seller
            </p>
          )}
        </div>
      </div>
      
      <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
        <p className="text-sm text-yellow-800">
          💡 <strong>Tip:</strong> Always confirm pick-up time before arriving. Please only take what you need so others can benefit too!
        </p>
      </div>
    </div>
  );
}
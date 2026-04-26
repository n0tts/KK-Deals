'use client';

import { useLayoutEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuth } from '@/providers/AuthProvider';
import { createClient } from '@/lib/supabase';

const ProfilePage = dynamic(() => Promise.resolve(ProfileContent), { ssr: false });

function ProfileContent() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const supabase = createClient();

  useLayoutEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    
    const formData = new FormData(e.currentTarget);
    
    try {
      await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          display_name: formData.get('display_name') as string,
          photo_url: formData.get('photo_url') as string,
          phone: formData.get('phone') as string,
          location: formData.get('location') as string,
          shop_name: formData.get('shop_name') as string,
          updated_at: new Date().toISOString(),
        });
      
      router.push('/');
    } catch (err) {
      console.error(err);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-6">My Profile</h1>
        
        {profile?.photo_url && (
          <div className="mb-6">
            <img 
              src={profile.photo_url} 
              alt="Profile" 
              className="w-20 h-20 rounded-full object-cover"
            />
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
            <input
              type="text"
              name="display_name"
              defaultValue={profile?.display_name || ''}
              required
              placeholder="How should we call you?"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo URL</label>
            <input
              type="url"
              name="photo_url"
              defaultValue={profile?.photo_url || ''}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone / WhatsApp</label>
            <input
              type="tel"
              name="phone"
              defaultValue={profile?.phone || ''}
              placeholder="e.g., 012-3456789"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-500 mt-1">Only shared when someone clicks &quot;I&apos;m Interested&quot;</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              name="location"
              defaultValue={profile?.location || ''}
              placeholder="e.g., Luyang, Kota Kinabalu"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name (Optional)</label>
            <input
              type="text"
              name="shop_name"
              defaultValue={profile?.shop_name || ''}
              placeholder="e.g., Mama&apos;s Kitchen"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-500 mt-1">Shown on your deals if you&apos;re a business</p>
          </div>
          
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors"
          >
            Save Profile
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfilePage;
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const handleSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .single();

        if (!existingProfile) {
          await supabase.from('profiles').insert({
            id: session.user.id,
            display_name: session.user.user_metadata?.full_name || 
                        session.user.user_metadata?.name || 
                        session.user.email?.split('@')[0] || '',
            photo_url: session.user.user_metadata?.avatar_url || null,
          });
        }
        
        router.push('/');
      } else {
        router.push('/login');
      }
    };

    handleSession();
  }, [router, supabase]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Signing you in...</p>
      </div>
    </div>
  );
}
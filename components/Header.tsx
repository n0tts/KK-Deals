import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';

export default function Header() {
  const { user, profile, loading } = useAuth();

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">♻️</span>
          <div>
            <h1 className="font-bold text-gray-900 leading-tight">KK Deals</h1>
            <p className="text-xs text-gray-500">Save food, save money</p>
          </div>
        </Link>
        
        <div className="flex items-center gap-2">
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
          ) : user ? (
            <>
              <Link 
                href="/add"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Add Deal</span>
              </Link>
              
              <Link href="/profile" className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-50 transition-colors">
                {profile?.photo_url ? (
                  <img 
                    src={profile.photo_url} 
                    alt={profile.display_name || 'Profile'}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-700 text-sm font-medium">
                      {(profile?.display_name || user.email || 'U')[0].toUpperCase()}
                    </span>
                  </div>
                )}
              </Link>
            </>
          ) : (
            <Link 
              href="/login"
              className="text-green-600 hover:text-green-700 px-4 py-2 font-medium text-sm"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
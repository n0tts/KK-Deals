'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuth } from '@/providers/AuthProvider';
import { addDeal } from '@/lib/deals';
import { Category, CATEGORIES } from '@/lib/types';

const AddDeal = dynamic(() => Promise.resolve(AddDealComponent), { ssr: false });

function AddDealComponent() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'produce' as Category,
    price: '',
    quantity: '1',
    location: '',
    expiry: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    
    try {
      await addDeal({
        title: form.title,
        description: form.description,
        category: form.category,
        price: Number(form.price) || 0,
        quantity: Number(form.quantity) || 1,
        location: form.location,
        expiry: form.expiry,
      }, user.id);
      
      router.push('/');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultExpiry = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(18, 0, 0, 0);
    return date.toISOString().slice(0, 16);
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
        <h1 className="text-xl font-bold text-gray-900 mb-6">Post a New Deal</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., Fresh Vegetables from Garden"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe your item..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setForm({ ...form, category: cat.value })}
                  className={`p-3 rounded-lg border text-center transition-colors ${
                    form.category === cat.value
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl block mb-1">{cat.icon}</span>
                  <span className="text-sm">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (RM)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="0 for free"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Available</label>
              <input
                type="number"
                min="1"
                required
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location</label>
            <input
              type="text"
              required
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="e.g., Luyang, Kota Kinabalu"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Time</label>
            <input
              type="datetime-local"
              required
              value={form.expiry || getDefaultExpiry()}
              onChange={(e) => setForm({ ...form, expiry: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white py-3 rounded-lg font-medium transition-colors"
          >
            {loading ? 'Posting...' : 'Post Deal'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddDeal;
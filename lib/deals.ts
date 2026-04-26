import { Deal, Category } from './types';
import { createClient } from './supabase';

const supabase = createClient();

export async function getDeals(): Promise<Deal[]> {
  const { data, error } = await supabase
    .from('deals')
    .select('*, profile:profiles(id, display_name, photo_url, shop_name, location)')
    .order('postedAt', { ascending: false });

  if (error) {
    console.error('Error fetching deals:', error);
    return [];
  }
  
  return data || [];
}

export async function getDealsByCategory(category: Category): Promise<Deal[]> {
  const { data, error } = await supabase
    .from('deals')
    .select('*, profile:profiles(id, display_name, photo_url, shop_name, location)')
    .eq('category', category)
    .order('postedAt', { ascending: false });

  if (error) {
    console.error('Error fetching deals:', error);
    return [];
  }
  
  return data || [];
}

export async function getDealById(id: string): Promise<Deal | null> {
  const { data, error } = await supabase
    .from('deals')
    .select('*, profile:profiles(id, display_name, photo_url, shop_name, location)')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching deal:', error);
    return null;
  }
  
  return data;
}

export async function addDeal(deal: Omit<Deal, 'id' | 'postedAt' | 'profile'>, userId: string): Promise<Deal> {
  const { data, error } = await supabase
    .from('deals')
    .insert({
      ...deal,
      userId,
    })
    .select('*, profile:profiles(id, display_name, photo_url, shop_name, location)')
    .single();

  if (error) {
    console.error('Error adding deal:', error);
    throw error;
  }
  
  return data;
}

export async function searchDeals(query: string): Promise<Deal[]> {
  const q = query.toLowerCase();
  const { data, error } = await supabase
    .from('deals')
    .select('*, profile:profiles(id, display_name, photo_url, shop_name, location)')
    .or(`title.ilike.%${q}%,description.ilike.%${q}%,location.ilike.%${q}%`)
    .order('postedAt', { ascending: false });

  if (error) {
    console.error('Error searching deals:', error);
    return [];
  }
  
  return data || [];
}

export async function getUserDeals(userId: string): Promise<Deal[]> {
  const { data, error } = await supabase
    .from('deals')
    .select('*, profile:profiles(id, display_name, photo_url, shop_name, location)')
    .eq('userId', userId)
    .order('postedAt', { ascending: false });

  if (error) {
    console.error('Error fetching user deals:', error);
    return [];
  }
  
  return data || [];
}

export async function markInterested(dealId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('interested')
    .insert({
      deal_id: dealId,
      user_id: userId,
    });

  if (error && !error.message.includes('duplicate key')) {
    console.error('Error marking interested:', error);
    throw error;
  }
}

export async function getInterestedCount(dealId: string): Promise<number> {
  const { count, error } = await supabase
    .from('interested')
    .select('*', { count: 'exact', head: true })
    .eq('deal_id', dealId);

  if (error) {
    console.error('Error getting interested count:', error);
    return 0;
  }
  
  return count || 0;
}
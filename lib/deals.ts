import { Deal, Category } from './types';
import { createClient } from './supabase';

const supabase = createClient();

const DEAL_SELECT_BASE = `
id,
title,
description,
category,
price,
quantity,
location,
expiry,
postedAt,
imageUrl:image_url,
userId:user_id
`;

const DEAL_SELECT_WITH_PROFILE = `
${DEAL_SELECT_BASE},
profile:profiles(id, display_name, photo_url, shop_name, location)
`;

function toPlainError(err: unknown) {
  if (!err) return { message: 'Unknown error (empty)' };
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
      stack: err.stack,
      ...(err.cause ? { cause: String(err.cause) } : {}),
    };
  }
  if (typeof err === 'object') {
    const props: Record<string, unknown> = {};
    const obj = err as Record<string, unknown>;
    for (const k of Object.getOwnPropertyNames(err)) {
      try {
        props[k] = obj[k];
      } catch {
        props[k] = '[unreadable]';
      }
    }
    return props;
  }
  return { message: String(err) };
}

function isProfileRelationshipError(err: unknown) {
  const msg = (() => {
    if (!err || typeof err !== 'object' || !('message' in err)) return '';
    const m = (err as { message?: unknown }).message;
    return typeof m === 'string' ? m : '';
  })();
  return (
    msg.includes('relationship') ||
    msg.includes('Could not find a relationship') ||
    msg.includes('No relationship found')
  );
}

function normalizeDeal(row: unknown): Deal {
  const r = row as Deal & { profile?: unknown };
  const profileVal = r?.profile;
  const profile = Array.isArray(profileVal) ? profileVal[0] : profileVal;
  return {
    ...r,
    profile: (profile as Deal['profile']) ?? undefined,
  };
}

export async function getDeals(): Promise<Deal[]> {
  const { data, error } = await supabase
    .from('deals')
    .select(DEAL_SELECT_WITH_PROFILE)
    .order('postedAt', { ascending: false });

  if (error) {
    console.error('Error fetching deals:', toPlainError(error));
    if (isProfileRelationshipError(error)) {
      const retry = await supabase
        .from('deals')
        .select(DEAL_SELECT_BASE)
        .order('postedAt', { ascending: false });
      if (!retry.error) return retry.data || [];
      console.error('Error fetching deals (retry without profile):', toPlainError(retry.error));
    }
    return [];
  }
  
  return (data || []).map(normalizeDeal);
}

export async function getDealsByCategory(category: Category): Promise<Deal[]> {
  const { data, error } = await supabase
    .from('deals')
    .select(DEAL_SELECT_WITH_PROFILE)
    .eq('category', category)
    .order('postedAt', { ascending: false });

  if (error) {
    console.error('Error fetching deals:', toPlainError(error));
    if (isProfileRelationshipError(error)) {
      const retry = await supabase
        .from('deals')
        .select(DEAL_SELECT_BASE)
        .eq('category', category)
        .order('postedAt', { ascending: false });
      if (!retry.error) return retry.data || [];
      console.error('Error fetching deals (retry without profile):', toPlainError(retry.error));
    }
    return [];
  }
  
  return (data || []).map(normalizeDeal);
}

export async function getDealById(id: string): Promise<Deal | null> {
  const { data, error } = await supabase
    .from('deals')
    .select(DEAL_SELECT_WITH_PROFILE)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching deal:', toPlainError(error));
    if (isProfileRelationshipError(error)) {
      const retry = await supabase
        .from('deals')
        .select(DEAL_SELECT_BASE)
        .eq('id', id)
        .single();
      if (!retry.error) return retry.data;
      console.error('Error fetching deal (retry without profile):', toPlainError(retry.error));
    }
    return null;
  }
  
  return normalizeDeal(data);
}

export async function addDeal(deal: Omit<Deal, 'id' | 'postedAt' | 'profile'>, userId: string): Promise<Deal> {
  const { data, error } = await supabase
    .from('deals')
    .insert({
      title: deal.title,
      description: deal.description,
      category: deal.category,
      price: deal.price,
      quantity: deal.quantity,
      location: deal.location,
      expiry: deal.expiry,
      image_url: deal.imageUrl ?? null,
      user_id: userId,
    })
    .select(DEAL_SELECT_WITH_PROFILE)
    .single();

  if (error) {
    console.error('Error adding deal:', toPlainError(error));
    throw error;
  }
  
  return normalizeDeal(data);
}

export async function searchDeals(query: string): Promise<Deal[]> {
  const q = query.toLowerCase();
  const { data, error } = await supabase
    .from('deals')
    .select(DEAL_SELECT_WITH_PROFILE)
    .or(`title.ilike.%${q}%,description.ilike.%${q}%,location.ilike.%${q}%`)
    .order('postedAt', { ascending: false });

  if (error) {
    console.error('Error searching deals:', toPlainError(error));
    if (isProfileRelationshipError(error)) {
      const retry = await supabase
        .from('deals')
        .select(DEAL_SELECT_BASE)
        .or(`title.ilike.%${q}%,description.ilike.%${q}%,location.ilike.%${q}%`)
        .order('postedAt', { ascending: false });
      if (!retry.error) return retry.data || [];
      console.error('Error searching deals (retry without profile):', toPlainError(retry.error));
    }
    return [];
  }
  
  return (data || []).map(normalizeDeal);
}

export async function getUserDeals(userId: string): Promise<Deal[]> {
  const { data, error } = await supabase
    .from('deals')
    .select(DEAL_SELECT_WITH_PROFILE)
    .eq('user_id', userId)
    .order('postedAt', { ascending: false });

  if (error) {
    console.error('Error fetching user deals:', toPlainError(error));
    if (isProfileRelationshipError(error)) {
      const retry = await supabase
        .from('deals')
        .select(DEAL_SELECT_BASE)
        .eq('user_id', userId)
        .order('postedAt', { ascending: false });
      if (!retry.error) return retry.data || [];
      console.error('Error fetching user deals (retry without profile):', toPlainError(retry.error));
    }
    return [];
  }
  
  return (data || []).map(normalizeDeal);
}

export async function markInterested(dealId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('interested')
    .insert({
      deal_id: dealId,
      user_id: userId,
    });

  if (error && !error.message.includes('duplicate key')) {
    console.error('Error marking interested:', toPlainError(error));
    throw error;
  }
}

export async function getInterestedCount(dealId: string): Promise<number> {
  const { count, error } = await supabase
    .from('interested')
    .select('*', { count: 'exact', head: true })
    .eq('deal_id', dealId);

  if (error) {
    console.error('Error getting interested count:', toPlainError(error));
    return 0;
  }
  
  return count || 0;
}
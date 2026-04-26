export type Category = 'produce' | 'cooked' | 'dairy' | 'other';

export interface Deal {
  id: string;
  title: string;
  description: string;
  category: Category;
  price: number;
  quantity: number;
  location: string;
  expiry: string;
  postedAt: string;
  imageUrl?: string;
  userId?: string;
  profile?: {
    display_name: string | null;
    photo_url: string | null;
    shop_name: string | null;
    location: string | null;
  };
}

export const CATEGORIES: { value: Category; label: string; icon: string }[] = [
  { value: 'produce', label: 'Fresh Produce', icon: '🥬' },
  { value: 'cooked', label: 'Cooked Food', icon: '🍱' },
  { value: 'dairy', label: 'Dairy & Eggs', icon: '🥛' },
  { value: 'other', label: 'Other', icon: '📦' },
];

export function getCategoryInfo(category: Category) {
  return CATEGORIES.find(c => c.value === category) || CATEGORIES[3];
}
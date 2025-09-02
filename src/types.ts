export type OrderStatus = 'pending' | 'accepted' | 'in_progress' | 'ready' | 'delivered' | 'cancelled';

export interface Category {
  id: number;
  name: string;
  sort_order: number;
}
export interface MenuItem {
  id: number;
  category_id: number;
  name: string;
  description?: string | null;
  price_cents: number;
  is_available: boolean;
  image_url?: string | null;
}

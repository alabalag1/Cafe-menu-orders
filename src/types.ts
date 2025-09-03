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

export interface Order {
  id: string;
  table_id: number;
  created_at: string;
  status: OrderStatus;
  note?: string | null;
  total_cents: number;
}

export interface OrderItem {
  id: number;
  order_id: string;
  menu_item_id: number;
  qty: number;
  price_cents: number;
}

export interface OrderEvent {
  id: number;
  order_id: string;
  event: string;
  at: string;
}

export interface Table {
  id: number;
  name: string;
  qr_slug?: string | null;
}

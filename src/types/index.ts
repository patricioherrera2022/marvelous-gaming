export type CardCondition = "NM" | "LP" | "MP" | "HP" | "DMG";

export type CardFinish =
  | "Normal"
  | "Holo"
  | "Reverse Holo"
  | "Full Art"
  | "1st Edition"
  | "Graded";

export type CardLanguage = "EN" | "ES" | "JP";

export type ProductDepartment = "tcg_sealed" | "games" | "accessories";

export interface TcgSeries {
  id: string;
  name: string;
  logo_url: string | null;
  sort_order: number;
}

export interface TcgSet {
  id: string;
  series_id: string;
  series_name: string;
  name: string;
  logo_url: string | null;
  symbol_url: string | null;
  release_date: string | null;
  official_count: number;
  total_count: number;
  active_listings_count?: number;
}

export interface TcgSeriesWithSets extends TcgSeries {
  sets: TcgSet[];
}

export interface TcgCard {
  id: string;
  set_id: string;
  set_name?: string;
  set_logo_url?: string | null;
  set_symbol_url?: string | null;
  local_id: string;
  name: string;
  image_base: string | null;
  rarity?: string | null;
  category?: string | null;
  hp?: number | null;
  types?: string[];
  illustrator?: string | null;
  variants?: Record<string, boolean>;
}

export interface CardListing {
  id: string;
  card_id: string;
  set_id: string;
  price_ars: number;
  compare_at_price_ars: number | null;
  stock: number;
  condition: CardCondition;
  finish: CardFinish;
  language: CardLanguage;
  custom_description: string;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface CardWithListings {
  card: TcgCard;
  listings: CardListing[];
  activeListings: CardListing[];
}

export interface Product {
  id: string;
  department: ProductDepartment;
  category: string;
  platform: string | null;
  title: string;
  slug: string;
  description: string;
  price_ars: number;
  compare_at_price_ars: number | null;
  stock: number;
  condition: "Nuevo" | "Usado";
  format: "Físico" | "Digital" | "N/A";
  images: string[];
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShippingZone {
  id: string;
  name: string;
  description: string;
  price_ars: number;
  estimated_days: string;
  enabled: boolean;
}

export interface ShippingQuoteOption {
  id: string;
  carrier: "andreani" | "correo_argentino" | "pickup" | "custom";
  carrier_label: string;
  service_name: string;
  delivery_type: "domicilio" | "sucursal" | "retiro";
  zone_label: string;
  province: string;
  price_ars: number;
  original_price_ars: number;
  is_free: boolean;
  estimated_days: string;
  weight_grams: number;
  requires_address: boolean;
}

export interface StoreSettings {
  id: number;
  store_name: string;
  promo_banner_enabled: boolean;
  promo_banner_text: string;
  whatsapp_number: string;
  instagram_handle: string;
  contact_email: string;
  mercadopago_enabled: boolean;
  transfer_enabled: boolean;
  cash_enabled: boolean;
  transfer_discount_percent: number;
  bank_name: string;
  bank_holder: string;
  bank_alias: string;
  bank_cbu: string;
  free_shipping_threshold_ars: number;
  shipping_zones: ShippingZone[];
  games_coming_soon: boolean;
  games_coming_soon_message: string;
  sender_name?: string;
  sender_address?: string;
  sender_city?: string;
  sender_province?: string;
  sender_postal_code?: string;
  sender_cuit?: string;
  andreani_enabled?: boolean;
  correo_argentino_enabled?: boolean;
  carrier_price_multiplier?: number;
  updated_at: string;
}

export type PaymentMethod = "mercadopago" | "transfer" | "cash";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  id: string;
  item_type: "card" | "product";
  ref_id: string;
  title: string;
  subtitle: string;
  image_url: string;
  unit_price_ars: number;
  quantity: number;
}

export interface Order {
  id: string;
  order_number: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  buyer_dni: string;
  shipping_zone_id: string;
  shipping_method: string;
  shipping_address: string;
  shipping_city: string;
  shipping_province: string;
  shipping_postal_code: string;
  notes: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  tracking_code: string;
  mp_preference_id: string | null;
  mp_payment_id: string | null;
  subtotal_ars: number;
  discount_ars: number;
  shipping_ars: number;
  total_ars: number;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  key: string; // unique per listing/product id
  item_type: "card" | "product";
  ref_id: string; // listing.id or product.id
  card_id?: string;
  set_id?: string;
  slug?: string;
  title: string;
  subtitle: string;
  image_url: string;
  unit_price_ars: number;
  quantity: number;
  max_stock: number;
}

-- ============================================================================
-- MARVELOUS GAMING - ESQUEMA COMPLETO PARA SUPABASE (PostgreSQL)
-- Ejecutá este script en el SQL Editor de tu proyecto Supabase.
-- ============================================================================

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

-- 1. ADMINISTRADORES AUTORIZADOS (Dashboard oculto /adminfacu)
create table if not exists public.admin_users (
  email text primary key,
  name text not null default 'Administrador',
  created_at timestamptz not null default now()
);

-- Helper para verificar admin desde RLS
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1
    from public.admin_users
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- 2. SERIES / ERAS DE POKÉMON TCG (Scarlet & Violet, Sword & Shield, etc.)
create table if not exists public.tcg_series (
  id text primary key,
  name text not null,
  logo_url text,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

-- 3. EXPANSIONES / SETS DE POKÉMON TCG
create table if not exists public.tcg_sets (
  id text primary key,
  series_id text references public.tcg_series(id) on delete set null,
  series_name text,
  name text not null,
  logo_url text,
  symbol_url text,
  release_date date,
  official_count integer not null default 0,
  total_count integer not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists idx_tcg_sets_series on public.tcg_sets (series_id);
create index if not exists idx_tcg_sets_release on public.tcg_sets (release_date desc nulls last);

-- 4. CATÁLOGO MAESTRO DE CARTAS POKÉMON TCG (20.000+ cartas desde TCGdex)
create table if not exists public.tcg_cards (
  id text primary key,
  set_id text not null references public.tcg_sets(id) on delete cascade,
  local_id text not null default '',
  name text not null,
  image_base text,
  rarity text,
  category text,
  hp integer,
  types text[] not null default '{}',
  illustrator text,
  variants jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists idx_tcg_cards_set_local on public.tcg_cards (set_id, local_id);
create index if not exists idx_tcg_cards_name_trgm on public.tcg_cards using gin (name gin_trgm_ops);

-- 5. INVENTARIO DE CARTAS HABILITADAS A LA VENTA
create table if not exists public.card_listings (
  id uuid primary key default gen_random_uuid(),
  card_id text not null references public.tcg_cards(id) on delete cascade,
  set_id text not null references public.tcg_sets(id) on delete cascade,
  price_ars numeric(12, 2) not null check (price_ars >= 0),
  compare_at_price_ars numeric(12, 2),
  stock integer not null default 1 check (stock >= 0),
  condition text not null default 'NM' check (condition in ('NM', 'LP', 'MP', 'HP', 'DMG')),
  finish text not null default 'Normal' check (finish in ('Normal', 'Holo', 'Reverse Holo', 'Full Art', '1st Edition', 'Graded')),
  language text not null default 'EN' check (language in ('EN', 'ES', 'JP')),
  custom_description text not null default '',
  is_active boolean not null default true,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_card_listings_card on public.card_listings (card_id);
create index if not exists idx_card_listings_set_active on public.card_listings (set_id, is_active);

-- 6. PRODUCTOS GENERALES (Sellados TCG, Juegos PS4/PS5 y Accesorios)
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  department text not null check (department in ('tcg_sealed', 'games', 'accessories')),
  category text not null default 'General',
  platform text,
  title text not null,
  slug text not null unique,
  description text not null default '',
  price_ars numeric(12, 2) not null check (price_ars >= 0),
  compare_at_price_ars numeric(12, 2),
  stock integer not null default 0 check (stock >= 0),
  condition text not null default 'Nuevo' check (condition in ('Nuevo', 'Usado')),
  format text not null default 'Físico' check (format in ('Físico', 'Digital', 'N/A')),
  images text[] not null default '{}',
  is_active boolean not null default true,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_products_dept_active on public.products (department, is_active);

-- 7. PEDIDOS Y DETALLE DE VENTAS
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  buyer_name text not null,
  buyer_email text not null,
  buyer_phone text not null,
  buyer_dni text not null default '',
  shipping_zone_id text not null default '',
  shipping_method text not null default '',
  shipping_address text not null default '',
  shipping_city text not null default '',
  shipping_province text not null default '',
  shipping_postal_code text not null default '',
  notes text not null default '',
  payment_method text not null check (payment_method in ('mercadopago', 'transfer', 'cash')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  order_status text not null default 'pending' check (order_status in ('pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled')),
  tracking_code text not null default '',
  mp_preference_id text,
  mp_payment_id text,
  subtotal_ars numeric(12, 2) not null default 0,
  discount_ars numeric(12, 2) not null default 0,
  shipping_ars numeric(12, 2) not null default 0,
  total_ars numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  item_type text not null check (item_type in ('card', 'product')),
  ref_id text not null,
  title text not null,
  subtitle text not null default '',
  image_url text not null default '',
  unit_price_ars numeric(12, 2) not null,
  quantity integer not null check (quantity > 0)
);

-- 8. CONFIGURACIÓN GLOBAL DE LA TIENDA (Singleton id = 1)
create table if not exists public.store_settings (
  id integer primary key default 1 check (id = 1),
  store_name text not null default 'Marvelous Gaming',
  promo_banner_enabled boolean not null default true,
  promo_banner_text text not null default '10% OFF pagando por Transferencia Bancaria • Envíos a todo el país',
  whatsapp_number text not null default '5491100000000',
  instagram_handle text not null default '@marvelousgaming.tcg',
  contact_email text not null default 'contacto@marvelousgaming.com',
  mercadopago_enabled boolean not null default true,
  transfer_enabled boolean not null default true,
  cash_enabled boolean not null default true,
  transfer_discount_percent numeric(5, 2) not null default 10,
  bank_name text not null default 'Banco / Billetera Virtual',
  bank_holder text not null default 'Marvelous Gaming',
  bank_alias text not null default 'MARVELOUS.GAMING.TCG',
  bank_cbu text not null default '0000000000000000000000',
  free_shipping_threshold_ars numeric(12, 2) not null default 120000,
  shipping_zones jsonb not null default '[
    {"id":"retiro","name":"Retiro en Punto de Entrega","description":"Coordinamos día y horario sin cargo","price_ars":0,"estimated_days":"En el día","enabled":true},
    {"id":"caba","name":"Moto Mensajería CABA","description":"Entrega rápida en Capital Federal","price_ars":4500,"estimated_days":"24 a 48 hs hábiles","enabled":true},
    {"id":"gba","name":"Moto / Correo GBA","description":"Gran Buenos Aires (1er y 2do cordón)","price_ars":6800,"estimated_days":"2 a 3 días hábiles","enabled":true},
    {"id":"interior","name":"Correo Argentino / Andreani (Todo el país)","description":"Envío asegurado con seguimiento","price_ars":9500,"estimated_days":"3 a 6 días hábiles","enabled":true}
  ]'::jsonb,
  games_coming_soon boolean not null default true,
  games_coming_soon_message text not null default 'Muy pronto vas a encontrar juegos físicos y digitales de PS4, PS5, joysticks DualSense, auriculares y accesorios oficiales.',
  updated_at timestamptz not null default now()
);

insert into public.store_settings (id)
values (1)
on conflict (id) do nothing;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
alter table public.admin_users enable row level security;
alter table public.tcg_series enable row level security;
alter table public.tcg_sets enable row level security;
alter table public.tcg_cards enable row level security;
alter table public.card_listings enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.store_settings enable row level security;

-- Lectura pública de catálogo y tienda
create policy "public_read_series" on public.tcg_series for select using (true);
create policy "public_read_sets" on public.tcg_sets for select using (true);
create policy "public_read_cards" on public.tcg_cards for select using (true);
create policy "public_read_active_listings" on public.card_listings for select using (is_active = true);
create policy "public_read_active_products" on public.products for select using (is_active = true);
create policy "public_read_settings" on public.store_settings for select using (true);

-- Acceso total solo para admins autenticados
create policy "admin_all_admin_users" on public.admin_users for all using (public.is_admin()) with check (public.is_admin());
create policy "admin_all_series" on public.tcg_series for all using (public.is_admin()) with check (public.is_admin());
create policy "admin_all_sets" on public.tcg_sets for all using (public.is_admin()) with check (public.is_admin());
create policy "admin_all_cards" on public.tcg_cards for all using (public.is_admin()) with check (public.is_admin());
create policy "admin_all_listings" on public.card_listings for all using (public.is_admin()) with check (public.is_admin());
create policy "admin_all_products" on public.products for all using (public.is_admin()) with check (public.is_admin());
create policy "admin_all_orders" on public.orders for all using (public.is_admin()) with check (public.is_admin());
create policy "admin_all_order_items" on public.order_items for all using (public.is_admin()) with check (public.is_admin());
create policy "admin_all_settings" on public.store_settings for all using (public.is_admin()) with check (public.is_admin());

-- Bucket de imágenes para sellados y juegos PS4/PS5
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "public_read_product_images"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "admin_write_product_images"
  on storage.objects for all
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

-- Campos de remitente y tarifas automáticas Andreani / Correo Argentino
alter table public.store_settings
  add column if not exists sender_name text not null default 'Marvelous Gaming',
  add column if not exists sender_address text not null default 'Av. Corrientes 1234',
  add column if not exists sender_city text not null default 'CABA',
  add column if not exists sender_province text not null default 'Ciudad Autónoma de Buenos Aires',
  add column if not exists sender_postal_code text not null default '1043',
  add column if not exists sender_cuit text not null default '',
  add column if not exists andreani_enabled boolean not null default true,
  add column if not exists correo_argentino_enabled boolean not null default true,
  add column if not exists carrier_price_multiplier numeric(5, 2) not null default 1;

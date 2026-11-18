create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);
create table if not exists public.admin_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','admin','staff')),
  created_at timestamptz not null default now()
);
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.admin_roles where user_id = auth.uid()); $$;

create table if not exists public.categories (
 id uuid primary key default gen_random_uuid(), name text not null unique, slug text not null unique,
 description text, banner_url text, display_order int not null default 0, created_at timestamptz not null default now()
);
create table if not exists public.products (
 id uuid primary key default gen_random_uuid(), category_id uuid references public.categories(id) on delete set null,
 name text not null, slug text not null unique, description text, fabric text, price numeric(12,2) not null check(price >= 0),
 sale_price numeric(12,2) check(sale_price is null or sale_price >= 0), sku text unique,
 is_published boolean not null default false, is_featured boolean not null default false,
 is_bestseller boolean not null default false, is_new_arrival boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.product_images (
 id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade,
 image_url text not null, alt_text text, is_primary boolean not null default false, sort_order int not null default 0
);
create table if not exists public.product_variants (
 id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade,
 size text not null, color text, sku text unique, stock_quantity int not null default 0 check(stock_quantity >= 0),
 low_stock_threshold int not null default 5, unique(product_id,size,color)
);
create table if not exists public.customers (
 id uuid primary key default gen_random_uuid(), name text not null, phone text not null unique,
 whatsapp text, email text, city text, created_at timestamptz not null default now()
);
create table if not exists public.orders (
 id uuid primary key default gen_random_uuid(), order_number text not null unique,
 customer_id uuid references public.customers(id) on delete set null,
 customer_name text not null, phone text not null, whatsapp text, city text not null, address text not null,
 subtotal numeric(12,2) not null, shipping numeric(12,2) not null default 0,
 discount numeric(12,2) not null default 0, total numeric(12,2) not null,
 payment_method text not null, payment_status text not null default 'pending',
 status text not null default 'pending', order_notes text,
 idempotency_key text unique, created_at timestamptz not null default now()
);
create table if not exists public.order_items (
 id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade,
 product_id uuid references public.products(id) on delete set null, variant_id uuid references public.product_variants(id) on delete set null,
 product_name text not null, size text, quantity int not null check(quantity > 0),
 unit_price numeric(12,2) not null, line_total numeric(12,2) not null
);
create table if not exists public.inventory_movements (
 id uuid primary key default gen_random_uuid(), variant_id uuid not null references public.product_variants(id),
 change_quantity int not null, reason text not null, reference_id uuid, created_at timestamptz not null default now()
);
create table if not exists public.order_status_history (
 id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade,
 status text not null, note text, changed_by uuid references auth.users(id), created_at timestamptz not null default now()
);
create table if not exists public.payments (
 id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade,
 method text not null, amount numeric(12,2) not null, status text not null default 'pending',
 transaction_reference text, screenshot_url text, verified_at timestamptz, created_at timestamptz not null default now()
);
create table if not exists public.coupons (
 id uuid primary key default gen_random_uuid(), code text not null unique, discount_type text not null check(discount_type in ('percentage','fixed')),
 discount_value numeric(12,2) not null, min_order numeric(12,2) not null default 0,
 usage_limit int, used_count int not null default 0, expires_at timestamptz, is_active boolean not null default true
);
create table if not exists public.whatsapp_notifications (
 id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade,
 status text not null default 'queued', provider_message_id text, error text, attempts int not null default 0,
 created_at timestamptz not null default now(), sent_at timestamptz
);
create table if not exists public.store_settings (
 key text primary key, value jsonb not null default '{}'::jsonb, updated_at timestamptz not null default now()
);
create table if not exists public.homepage_banners (
 id uuid primary key default gen_random_uuid(), title text, image_url text, link_url text, is_active boolean not null default true,
 sort_order int not null default 0
);
create table if not exists public.newsletter_subscribers (
 id uuid primary key default gen_random_uuid(), email text not null unique, created_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products(category_id);
create index if not exists products_published_idx on public.products(is_published);
create index if not exists orders_created_idx on public.orders(created_at desc);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists variants_product_idx on public.product_variants(product_id);

alter table public.profiles enable row level security;
alter table public.admin_roles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.order_status_history enable row level security;
alter table public.payments enable row level security;
alter table public.coupons enable row level security;
alter table public.whatsapp_notifications enable row level security;
alter table public.store_settings enable row level security;
alter table public.homepage_banners enable row level security;
alter table public.newsletter_subscribers enable row level security;

create policy "public read published products" on public.products for select using (is_published or public.is_admin());
create policy "public read categories" on public.categories for select using (true);
create policy "public read product images" on public.product_images for select using (exists(select 1 from public.products p where p.id=product_id and p.is_published) or public.is_admin());
create policy "public read variants" on public.product_variants for select using (exists(select 1 from public.products p where p.id=product_id and p.is_published) or public.is_admin());

do $$ declare t text; begin
 foreach t in array array['products','categories','product_images','product_variants','customers','orders','order_items','inventory_movements','order_status_history','payments','coupons','whatsapp_notifications','store_settings','homepage_banners','newsletter_subscribers','admin_roles','profiles']
 loop
  if not exists(select 1 from pg_policies where schemaname='public' and tablename=t and policyname='admin full access') then
   execute format('create policy %I on public.%I for all using (public.is_admin()) with check (public.is_admin())','admin full access',t);
  end if;
 end loop;
end $$;

-- The order RPC is deliberately installed only after review of your final checkout and shipping rules.
-- It must lock variant rows, calculate current prices on the server, decrement stock atomically,
-- snapshot product details, and use an idempotency key. Do not accept browser-submitted totals.


-- Transactional checkout RPC: callable only by the server's service-role client.
create or replace function public.create_customer_order(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
  v_variant public.product_variants%rowtype;
  v_product public.products%rowtype;
  v_customer_id uuid;
  v_order_id uuid;
  v_order_number text;
  v_subtotal numeric(12,2) := 0;
  v_shipping numeric(12,2) := 0;
  v_total numeric(12,2) := 0;
  v_line numeric(12,2);
  v_price numeric(12,2);
  v_existing public.orders%rowtype;
  v_idempotency text := coalesce(payload->>'idempotency_key','');
begin
  if v_idempotency = '' then raise exception 'Missing idempotency key'; end if;
  select * into v_existing from public.orders where idempotency_key=v_idempotency;
  if found then
    return jsonb_build_object('id',v_existing.id,'order_number',v_existing.order_number,'total',v_existing.total);
  end if;

  insert into public.customers(name,phone,whatsapp,city)
  values(payload->>'customer_name',payload->>'phone',payload->>'whatsapp',payload->>'city')
  on conflict(phone) do update set name=excluded.name,whatsapp=excluded.whatsapp,city=excluded.city
  returning id into v_customer_id;

  for item in select * from jsonb_array_elements(payload->'items') loop
    select * into v_variant from public.product_variants
      where id=(item->>'variant_id')::uuid for update;
    if not found then raise exception 'Selected size is unavailable'; end if;
    if v_variant.stock_quantity < (item->>'quantity')::int then raise exception 'Insufficient stock for selected size'; end if;
    select * into v_product from public.products where id=v_variant.product_id and is_published=true;
    if not found then raise exception 'Product is unavailable'; end if;
    v_price := coalesce(v_product.sale_price,v_product.price);
    v_line := v_price * (item->>'quantity')::int;
    v_subtotal := v_subtotal + v_line;
  end loop;

  select coalesce((value->>'shipping_fee')::numeric,250) into v_shipping
    from public.store_settings where key='shipping' limit 1;
  v_shipping := coalesce(v_shipping,250);
  if v_subtotal >= 8000 then v_shipping := 0; end if;
  v_total := v_subtotal + v_shipping;

  v_order_number := 'NC-' || to_char(now() at time zone 'Asia/Karachi','YYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,6));
  insert into public.orders(order_number,customer_id,customer_name,phone,whatsapp,city,address,subtotal,shipping,discount,total,payment_method,payment_status,status,idempotency_key)
  values(v_order_number,v_customer_id,payload->>'customer_name',payload->>'phone',payload->>'whatsapp',payload->>'city',payload->>'address',v_subtotal,v_shipping,0,v_total,payload->>'payment_method','pending','pending',v_idempotency)
  returning id into v_order_id;

  for item in select * from jsonb_array_elements(payload->'items') loop
    select * into v_variant from public.product_variants where id=(item->>'variant_id')::uuid for update;
    select * into v_product from public.products where id=v_variant.product_id;
    v_price := coalesce(v_product.sale_price,v_product.price);
    v_line := v_price * (item->>'quantity')::int;
    insert into public.order_items(order_id,product_id,variant_id,product_name,size,quantity,unit_price,line_total)
    values(v_order_id,v_product.id,v_variant.id,v_product.name,v_variant.size,(item->>'quantity')::int,v_price,v_line);
    update public.product_variants set stock_quantity=stock_quantity-(item->>'quantity')::int where id=v_variant.id;
    insert into public.inventory_movements(variant_id,change_quantity,reason,reference_id)
    values(v_variant.id,-(item->>'quantity')::int,'Customer order',v_order_id);
  end loop;

  insert into public.payments(order_id,method,amount,status)
  values(v_order_id,payload->>'payment_method',v_total,'pending');
  insert into public.order_status_history(order_id,status,note)
  values(v_order_id,'pending','Order placed by customer');
  return jsonb_build_object('id',v_order_id,'order_number',v_order_number,'total',v_total);
end;
$$;
revoke all on function public.create_customer_order(jsonb) from public, anon, authenticated;
grant execute on function public.create_customer_order(jsonb) to service_role;

-- Additional operational tables used by the full storefront roadmap.
create table if not exists public.addresses (
 id uuid primary key default gen_random_uuid(), customer_id uuid not null references public.customers(id) on delete cascade,
 label text, address text not null, city text not null, postal_code text, created_at timestamptz not null default now()
);
create table if not exists public.carts (
 id uuid primary key default gen_random_uuid(), customer_id uuid references public.customers(id) on delete cascade,
 session_id text unique, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.cart_items (
 id uuid primary key default gen_random_uuid(), cart_id uuid not null references public.carts(id) on delete cascade,
 variant_id uuid not null references public.product_variants(id), quantity int not null check(quantity>0)
);
create table if not exists public.wishlists (
 id uuid primary key default gen_random_uuid(), customer_id uuid references public.customers(id) on delete cascade,
 session_id text unique, created_at timestamptz not null default now()
);
create table if not exists public.wishlist_items (
 id uuid primary key default gen_random_uuid(), wishlist_id uuid not null references public.wishlists(id) on delete cascade,
 product_id uuid not null references public.products(id) on delete cascade, unique(wishlist_id,product_id)
);
create table if not exists public.payment_transactions (
 id uuid primary key default gen_random_uuid(), payment_id uuid not null references public.payments(id) on delete cascade,
 provider text, provider_reference text, amount numeric(12,2) not null, status text not null,
 raw_response jsonb, created_at timestamptz not null default now()
);
create table if not exists public.coupon_redemptions (
 id uuid primary key default gen_random_uuid(), coupon_id uuid not null references public.coupons(id),
 order_id uuid not null references public.orders(id), customer_id uuid references public.customers(id),
 created_at timestamptz not null default now(), unique(coupon_id,order_id)
);
alter table public.addresses enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.wishlists enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.payment_transactions enable row level security;
alter table public.coupon_redemptions enable row level security;
create policy "admin full access" on public.addresses for all using (public.is_admin()) with check (public.is_admin());
create policy "admin full access" on public.carts for all using (public.is_admin()) with check (public.is_admin());
create policy "admin full access" on public.cart_items for all using (public.is_admin()) with check (public.is_admin());
create policy "admin full access" on public.wishlists for all using (public.is_admin()) with check (public.is_admin());
create policy "admin full access" on public.wishlist_items for all using (public.is_admin()) with check (public.is_admin());
create policy "admin full access" on public.payment_transactions for all using (public.is_admin()) with check (public.is_admin());
create policy "admin full access" on public.coupon_redemptions for all using (public.is_admin()) with check (public.is_admin());

insert into public.categories(name,slug,display_order) values
 ('Lawn','lawn',1),('Chiffon','chiffon',2),('Cotton','cotton',3),('Formal Wear','formal-wear',4),
 ('Bridal Wear','bridal-wear',5),('Casual Wear','casual-wear',6),('Unstitched Suits','unstitched-suits',7),('Ready-to-Wear','ready-to-wear',8)
on conflict(slug) do nothing;

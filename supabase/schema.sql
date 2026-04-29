-- Supabase Database Schema for KK Deals
-- Run this in the Supabase SQL Editor

-- Profiles table (extends auth.users)
create table profiles (
  id uuid references auth.users not null primary key,
  display_name text,
  photo_url text,
  phone text,
  location text,
  shop_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Deals table
create table deals (
  id text primary key,
  title text not null,
  description text not null,
  category text not null,
  price numeric not null default 0,
  quantity numeric not null default 1,
  location text not null,
  expiry timestamptz not null,
  postedAt timestamptz default now(),
  image_url text,
  user_id uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- Create index for faster queries
create index idx_deals_postedAt on deals(postedAt desc);
create index idx_deals_category on deals(category);
create index idx_deals_user_id on deals(user_id);

-- Interested contacts table
create table interested (
  id uuid default gen_random_uuid() primary key,
  deal_id text references deals(id) not null,
  user_id uuid references auth.users not null,
  created_at timestamptz default now(),
  unique(deal_id, user_id)
);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table deals enable row level security;
alter table interested enable row level security;

-- Profile policies
create policy "Anyone can view profiles" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- Deals policies
create policy "Anyone can view deals" on deals for select using (true);
create policy "Authenticated users can insert deals" on deals for insert with check (auth.uid() = user_id);
create policy "Owners can update own deals" on deals for update using (auth.uid() = user_id);
create policy "Owners can delete own deals" on deals for delete using (auth.uid() = user_id);

-- Interested policies
create policy "Authenticated users can create interested" on interested for insert with check (auth.uid() = user_id);
create policy "Anyone can view interested" on interested for select using (true);

-- Function to get seller profile when user is interested
create function get_seller_contact(deal_id text, requesting_user_id uuid)
returns text
language plpgsql
security definer
as $$
declare
  seller_id uuid;
  seller_phone text;
begin
  -- Check if user has shown interest
  if not exists (
    select 1 from interested 
    where deal_id = get_seller_contact.deal_id 
    and user_id = requesting_user_id
  ) then
    return null;
  end if;
  
  -- Get seller phone
  select d.user_id, p.phone
  into seller_id, seller_phone
  from deals d
  join profiles p on p.id = d.user_id
  where d.id = deal_id;
  
  return seller_phone;
end;
$$;

-- Trigger to auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'display_name',
      split_part(new.email, '@', 1)
    )
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
-- Supabase SQL Schema for Testimonial Collector
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  plan text default 'free' check (plan in ('free', 'starter', 'pro')),
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Spaces (a space = a product/brand collecting testimonials)
create table public.spaces (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  slug text unique not null,
  description text,
  logo_url text,
  custom_domain text,
  header_title text default 'Share your experience',
  header_message text default 'How has our product or service helped you?',
  questions text[] default array['What is your name?', 'What is your role?', 'How has our product helped you?'],
  collect_video boolean default true,
  collect_text boolean default true,
  theme_color text default '#d4751f',
  widget_theme text default 'light' check (widget_theme in ('light', 'dark', 'auto')),
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Testimonials
create table public.testimonials (
  id uuid default uuid_generate_v4() primary key,
  space_id uuid references public.spaces(id) on delete cascade not null,
  type text not null check (type in ('text', 'video')),
  -- Submitter info
  submitter_name text not null,
  submitter_email text,
  submitter_role text,
  submitter_company text,
  submitter_avatar_url text,
  -- Content
  content text,
  video_url text,
  video_thumbnail_url text,
  -- AI enhanced
  ai_enhanced_content text,
  -- Rating
  rating integer check (rating >= 1 and rating <= 5),
  -- Status
  status text default 'pending' check (status in ('pending', 'approved', 'archived')),
  is_featured boolean default false,
  -- Source
  source text default 'direct' check (source in ('direct', 'google', 'trustpilot', 'import')),
  -- Meta
  tags text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Email invitations sent
create table public.invitations (
  id uuid default uuid_generate_v4() primary key,
  space_id uuid references public.spaces(id) on delete cascade not null,
  email text not null,
  name text,
  token text unique not null,
  status text default 'sent' check (status in ('sent', 'opened', 'submitted')),
  created_at timestamptz default now()
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.spaces enable row level security;
alter table public.testimonials enable row level security;
alter table public.invitations enable row level security;

-- Profiles: users can read/update their own
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Service role can insert profiles" on public.profiles for insert with check (true);

-- Spaces: owners manage their spaces
create policy "Owners manage spaces" on public.spaces for all using (auth.uid() = user_id);
create policy "Anyone can view active spaces" on public.spaces for select using (is_active = true);

-- Testimonials: owners manage, public can insert
create policy "Owners manage testimonials" on public.testimonials for all using (
  auth.uid() = (select user_id from public.spaces where id = space_id)
);
create policy "Anyone can submit testimonials" on public.testimonials for insert with check (true);
create policy "Anyone can view approved testimonials" on public.testimonials for select using (status = 'approved');

-- Invitations
create policy "Owners manage invitations" on public.invitations for all using (
  auth.uid() = (select user_id from public.spaces where id = space_id)
);

-- Function: auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

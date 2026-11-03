-- GymFlow multi-tenant schema.
-- This migration is safe to re-run after a partial execution. It never drops
-- objects or data, and it does not disable row-level security.
create extension if not exists "pgcrypto";

-- Enum creation is guarded because CREATE TYPE has no IF NOT EXISTS form.
-- Existing enum definitions and values are never modified or removed. If an
-- existing enum is missing a required value, stop and review it rather than
-- changing a live type implicitly.
do $$
begin
  create type public.app_role as enum ('owner', 'manager', 'trainer');
exception when duplicate_object then
  null;
end
$$;

do $$
begin
  create type public.member_status as enum ('active', 'expired', 'paused');
exception when duplicate_object then
  null;
end
$$;

do $$
begin
  create type public.payment_status as enum ('paid', 'pending', 'refunded');
exception when duplicate_object then
  null;
end
$$;

-- Existing tables are left untouched. The IF NOT EXISTS guards are important
-- after a migration has stopped part-way through.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gyms (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete restrict,
  name text not null,
  email text,
  phone text,
  address text,
  timezone text not null default 'UTC',
  subscription_plan text not null default 'starter' check (subscription_plan in ('starter','growth','pro')),
  subscription_status text not null default 'trialing' check (subscription_status in ('trialing','active','past_due','canceled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gym_staff (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null default 'trainer',
  created_at timestamptz not null default now(),
  unique(gym_id, user_id)
);

create table if not exists public.membership_plans (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  name text not null,
  description text,
  price numeric(12,2) not null check (price >= 0),
  duration_months integer not null check (duration_months > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gym_members (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text not null,
  gender text,
  date_of_birth date,
  address text,
  emergency_contact text,
  plan_id uuid references public.membership_plans(id) on delete set null,
  membership_start date,
  membership_expiry date,
  status public.member_status not null default 'active',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  member_id uuid not null references public.gym_members(id) on delete cascade,
  plan_id uuid references public.membership_plans(id) on delete set null,
  starts_on date not null,
  ends_on date not null,
  status public.member_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_on >= starts_on)
);

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  member_id uuid not null references public.gym_members(id) on delete cascade,
  checked_in_at timestamptz not null default now(),
  checked_out_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists attendance_one_active_checkin
  on public.attendance(member_id) where checked_out_at is null;

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  member_id uuid references public.gym_members(id) on delete set null,
  amount numeric(12,2) not null check (amount >= 0),
  method text not null,
  status public.payment_status not null default 'pending',
  paid_at timestamptz,
  external_reference text,
  source text not null default 'manual' check (source in ('manual','gateway')),
  created_at timestamptz not null default now()
);

create index if not exists gym_members_gym_id_idx on public.gym_members(gym_id);
create index if not exists payments_gym_id_created_idx on public.payments(gym_id, created_at desc);
create index if not exists attendance_gym_id_created_idx on public.attendance(gym_id, created_at desc);
create index if not exists gym_staff_user_id_idx on public.gym_staff(user_id);

create or replace function public.is_gym_member(target_gym uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.gyms where id = target_gym and owner_id = auth.uid())
      or exists (select 1 from public.gym_staff where gym_id = target_gym and user_id = auth.uid());
$$;

create or replace function public.is_gym_admin(target_gym uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.gyms where id = target_gym and owner_id = auth.uid())
      or exists (select 1 from public.gym_staff where gym_id = target_gym and user_id = auth.uid() and role in ('owner','manager'));
$$;

-- ENABLE is intentionally retained: this migration never disables RLS.
alter table public.profiles enable row level security;
alter table public.gyms enable row level security;
alter table public.gym_staff enable row level security;
alter table public.membership_plans enable row level security;
alter table public.gym_members enable row level security;
alter table public.subscriptions enable row level security;
alter table public.attendance enable row level security;
alter table public.payments enable row level security;

-- CREATE POLICY has no IF NOT EXISTS. Each block creates the policy only if
-- that exact policy name is absent, preserving any existing policy definition.
do $$ begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_self') then
    create policy profiles_self on public.profiles for select using (id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_update_self') then
    create policy profiles_update_self on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'gyms' and policyname = 'gyms_visible_to_members') then
    create policy gyms_visible_to_members on public.gyms for select using (owner_id = auth.uid() or public.is_gym_member(id));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'gyms' and policyname = 'gyms_owner_update') then
    create policy gyms_owner_update on public.gyms for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'gyms' and policyname = 'gyms_owner_insert') then
    create policy gyms_owner_insert on public.gyms for insert with check (owner_id = auth.uid());
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'gym_staff' and policyname = 'staff_visible_to_gym') then
    create policy staff_visible_to_gym on public.gym_staff for select using (public.is_gym_member(gym_id));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'gym_staff' and policyname = 'staff_admin_manage') then
    create policy staff_admin_manage on public.gym_staff for all using (public.is_gym_admin(gym_id)) with check (public.is_gym_admin(gym_id));
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'membership_plans' and policyname = 'plans_visible_to_gym') then
    create policy plans_visible_to_gym on public.membership_plans for select using (public.is_gym_member(gym_id));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'membership_plans' and policyname = 'plans_admin_manage') then
    create policy plans_admin_manage on public.membership_plans for all using (public.is_gym_admin(gym_id)) with check (public.is_gym_admin(gym_id));
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'gym_members' and policyname = 'members_visible_to_gym') then
    create policy members_visible_to_gym on public.gym_members for select using (public.is_gym_member(gym_id));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'gym_members' and policyname = 'members_admin_insert') then
    create policy members_admin_insert on public.gym_members for insert with check (public.is_gym_admin(gym_id));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'gym_members' and policyname = 'members_admin_update') then
    create policy members_admin_update on public.gym_members for update using (public.is_gym_admin(gym_id)) with check (public.is_gym_admin(gym_id));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'gym_members' and policyname = 'members_admin_delete') then
    create policy members_admin_delete on public.gym_members for delete using (public.is_gym_admin(gym_id));
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'subscriptions' and policyname = 'subscriptions_visible_to_gym') then
    create policy subscriptions_visible_to_gym on public.subscriptions for select using (public.is_gym_member(gym_id));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'subscriptions' and policyname = 'subscriptions_admin_manage') then
    create policy subscriptions_admin_manage on public.subscriptions for all using (public.is_gym_admin(gym_id)) with check (public.is_gym_admin(gym_id));
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'attendance' and policyname = 'attendance_visible_to_gym') then
    create policy attendance_visible_to_gym on public.attendance for select using (public.is_gym_member(gym_id));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'attendance' and policyname = 'attendance_staff_manage') then
    create policy attendance_staff_manage on public.attendance for insert with check (public.is_gym_member(gym_id));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'attendance' and policyname = 'attendance_staff_checkout') then
    create policy attendance_staff_checkout on public.attendance for update using (public.is_gym_member(gym_id)) with check (public.is_gym_member(gym_id));
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'payments' and policyname = 'payments_visible_to_gym') then
    create policy payments_visible_to_gym on public.payments for select using (public.is_gym_member(gym_id));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'payments' and policyname = 'payments_admin_manage') then
    create policy payments_admin_manage on public.payments for insert with check (public.is_gym_admin(gym_id));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'payments' and policyname = 'payments_admin_update') then
    create policy payments_admin_update on public.payments for update using (public.is_gym_admin(gym_id)) with check (public.is_gym_admin(gym_id));
  end if;
end $$;

-- Signup bootstrap: creates a profile, gym, and owner staff row without
-- exposing a service role key.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  new_gym uuid;
begin
  insert into public.profiles (id, full_name)
    values (new.id, coalesce(new.raw_user_meta_data->>'full_name', 'Gym owner'));
  insert into public.gyms (owner_id, name, email)
    values (new.id, coalesce(new.raw_user_meta_data->>'gym_name', 'My Gym'), new.email)
    returning id into new_gym;
  insert into public.gym_staff (gym_id, user_id, role)
    values (new_gym, new.id, 'owner');
  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgrelid = 'auth.users'::regclass
      and tgname = 'on_auth_user_created'
      and not tgisinternal
  ) then
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute procedure public.handle_new_user();
  end if;
end
$$;

-- GymFlow tenant-integrity hardening.
-- This migration is additive: it does not drop objects, delete data, or change
-- existing RLS policies. It prevents new cross-gym foreign-key references.

create or replace function public.enforce_same_gym_references()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if tg_table_name = 'gym_members' then
    if new.plan_id is not null
       and not exists (
         select 1 from public.membership_plans
         where id = new.plan_id and gym_id = new.gym_id
       ) then
      raise exception 'membership plan must belong to the same gym';
    end if;

  elsif tg_table_name = 'subscriptions' then
    if not exists (
      select 1 from public.gym_members
      where id = new.member_id and gym_id = new.gym_id
    ) then
      raise exception 'member must belong to the same gym';
    end if;
    if new.plan_id is not null
       and not exists (
         select 1 from public.membership_plans
         where id = new.plan_id and gym_id = new.gym_id
       ) then
      raise exception 'membership plan must belong to the same gym';
    end if;

  elsif tg_table_name = 'attendance' then
    if not exists (
      select 1 from public.gym_members
      where id = new.member_id and gym_id = new.gym_id
    ) then
      raise exception 'member must belong to the same gym';
    end if;

  elsif tg_table_name = 'payments' then
    if new.member_id is not null
       and not exists (
         select 1 from public.gym_members
         where id = new.member_id and gym_id = new.gym_id
       ) then
      raise exception 'member must belong to the same gym';
    end if;
  end if;

  return new;
end;
$$;

-- Prevent moving a referenced parent row to another gym. Child-row triggers
-- cannot catch this direction of the relationship.
create or replace function public.prevent_cross_gym_parent_move()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if tg_table_name = 'membership_plans'
     and new.gym_id is distinct from old.gym_id
     and (
       exists (
         select 1 from public.gym_members
         where plan_id = old.id and gym_id <> new.gym_id
       )
       or exists (
         select 1 from public.subscriptions
         where plan_id = old.id and gym_id <> new.gym_id
       )
     ) then
    raise exception 'membership plan cannot move while referenced by another gym';
  end if;

  if tg_table_name = 'gym_members'
     and new.gym_id is distinct from old.gym_id
     and (
       exists (
         select 1 from public.subscriptions
         where member_id = old.id and gym_id <> new.gym_id
       )
       or exists (
         select 1 from public.attendance
         where member_id = old.id and gym_id <> new.gym_id
       )
       or exists (
         select 1 from public.payments
         where member_id = old.id and gym_id <> new.gym_id
       )
     ) then
    raise exception 'member cannot move while referenced by another gym';
  end if;

  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgrelid = 'public.gym_members'::regclass
      and tgname = 'gym_members_same_gym_refs'
      and not tgisinternal
  ) then
    create trigger gym_members_same_gym_refs
      before insert or update of gym_id, plan_id on public.gym_members
      for each row execute function public.enforce_same_gym_references();
  end if;

  if not exists (
    select 1 from pg_trigger
    where tgrelid = 'public.subscriptions'::regclass
      and tgname = 'subscriptions_same_gym_refs'
      and not tgisinternal
  ) then
    create trigger subscriptions_same_gym_refs
      before insert or update of gym_id, member_id, plan_id on public.subscriptions
      for each row execute function public.enforce_same_gym_references();
  end if;

  if not exists (
    select 1 from pg_trigger
    where tgrelid = 'public.attendance'::regclass
      and tgname = 'attendance_same_gym_refs'
      and not tgisinternal
  ) then
    create trigger attendance_same_gym_refs
      before insert or update of gym_id, member_id on public.attendance
      for each row execute function public.enforce_same_gym_references();
  end if;

  if not exists (
    select 1 from pg_trigger
    where tgrelid = 'public.payments'::regclass
      and tgname = 'payments_same_gym_refs'
      and not tgisinternal
  ) then
    create trigger payments_same_gym_refs
      before insert or update of gym_id, member_id on public.payments
      for each row execute function public.enforce_same_gym_references();
  end if;

  if not exists (
    select 1 from pg_trigger
    where tgrelid = 'public.membership_plans'::regclass
      and tgname = 'membership_plans_prevent_cross_gym_move'
      and not tgisinternal
  ) then
    create trigger membership_plans_prevent_cross_gym_move
      before update of gym_id on public.membership_plans
      for each row execute function public.prevent_cross_gym_parent_move();
  end if;

  if not exists (
    select 1 from pg_trigger
    where tgrelid = 'public.gym_members'::regclass
      and tgname = 'gym_members_prevent_cross_gym_move'
      and not tgisinternal
  ) then
    create trigger gym_members_prevent_cross_gym_move
      before update of gym_id on public.gym_members
      for each row execute function public.prevent_cross_gym_parent_move();
  end if;
end
$$;

-- Review existing data before relying on this hardening migration. This query
-- is intentionally informational and does not modify rows:
-- select 'gym_members.plan_id' as reference_type, gm.id, gm.gym_id,
--        gm.plan_id as referenced_id, mp.gym_id as referenced_gym_id
-- from public.gym_members gm
-- join public.membership_plans mp on mp.id = gm.plan_id
-- where gm.plan_id is not null and gm.gym_id <> mp.gym_id
-- union all
-- select 'subscriptions.member_id', s.id, s.gym_id,
--        s.member_id, gm.gym_id
-- from public.subscriptions s
-- join public.gym_members gm on gm.id = s.member_id
-- where s.gym_id <> gm.gym_id
-- union all
-- select 'subscriptions.plan_id', s.id, s.gym_id,
--        s.plan_id, mp.gym_id
-- from public.subscriptions s
-- join public.membership_plans mp on mp.id = s.plan_id
-- where s.plan_id is not null and s.gym_id <> mp.gym_id
-- union all
-- select 'attendance.member_id', a.id, a.gym_id,
--        a.member_id, gm.gym_id
-- from public.attendance a
-- join public.gym_members gm on gm.id = a.member_id
-- where a.gym_id <> gm.gym_id
-- union all
-- select 'payments.member_id', p.id, p.gym_id,
--        p.member_id, gm.gym_id
-- from public.payments p
-- join public.gym_members gm on gm.id = p.member_id
-- where p.member_id is not null and p.gym_id <> gm.gym_id;

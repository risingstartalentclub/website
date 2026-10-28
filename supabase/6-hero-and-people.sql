-- Homepage contest flag, profile emails, and admin list access.
-- Safe to run again. It does not delete contests, profiles, entries, or reels.

alter table public.contests add column if not exists is_hero boolean not null default false;

alter table public.profiles add column if not exists email text;

do $$
begin
  alter table public.profiles
    add constraint profiles_email_length check (email is null or char_length(email) between 5 and 160);
exception
  when duplicate_object then null;
end $$;

update public.profiles p
set email = nullif(u.email, '')
from auth.users u
where u.id = p.id
  and (p.email is null or p.email = '');

with ranked as (
  select slug, row_number() over (order by sort_order, created_at) as n
  from public.contests
  where is_hero
)
update public.contests c
set is_hero = false
from ranked r
where c.slug = r.slug
  and r.n > 1;

update public.contests
set is_hero = true
where slug = (
  select slug
  from public.contests
  order by sort_order asc, created_at asc
  limit 1
)
and not exists (
  select 1 from public.contests where is_hero
);

create unique index if not exists contests_one_hero_idx
  on public.contests ((true))
  where is_hero;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, guardian_name, phone, email)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), 'Participant'),
    nullif(new.raw_user_meta_data ->> 'guardian_name', ''),
    case
      when coalesce(new.raw_user_meta_data ->> 'phone', '') ~ '^\+91[6-9][0-9]{9}$'
        then new.raw_user_meta_data ->> 'phone'
      else null
    end,
    nullif(new.email, '')
  )
  on conflict (id) do update
  set email = coalesce(public.profiles.email, excluded.email);
  return new;
end;
$$;

create or replace function public.admin_account_counts()
returns table (
  admin_count integer,
  participant_count integer,
  contest_count integer,
  open_contest_count integer,
  hero_title text
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    return;
  end if;

  return query
  select
    (select count(*)::integer from public.profiles where role = 'admin'),
    (select count(*)::integer from public.profiles where role = 'participant'),
    (select count(*)::integer from public.contests),
    (select count(*)::integer from public.contests where status = 'open'),
    (
      select c.title
      from public.contests c
      where c.is_hero
      order by c.sort_order asc, c.created_at asc
      limit 1
    );
end;
$$;

create or replace function public.admin_list_profiles(requested_role text)
returns table (
  id uuid,
  full_name text,
  email text,
  phone text,
  role text,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    return;
  end if;

  if requested_role not in ('admin', 'participant') then
    return;
  end if;

  return query
  select p.id, p.full_name, p.email, p.phone, p.role, p.created_at
  from public.profiles p
  where p.role = requested_role
  order by p.created_at desc
  limit 200;
end;
$$;

revoke all on function public.is_admin() from public;
revoke all on function public.admin_account_counts() from public;
revoke all on function public.admin_list_profiles(text) from public;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.admin_account_counts() to authenticated;
grant execute on function public.admin_list_profiles(text) to authenticated;

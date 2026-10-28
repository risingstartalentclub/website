-- Rising Star Talent Club
-- Run this once in the Supabase SQL editor on a new or emptied project.
-- It creates empty tables, policies, and the image bucket.
-- It does not insert contests, parents, or admins.
-- Then run supabase/2-make-admin.sql after setting the admin email and password.
-- Re-running this file is safe. Run it again so Admin List can add more admins.

create table if not exists public.admins (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text,
  created_at timestamptz not null default now(),
  constraint admins_email_length check (char_length(email) between 5 and 160)
);

alter table public.admins add column if not exists full_name text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'admins_name_length'
  ) then
    alter table public.admins
      add constraint admins_name_length
      check (full_name is null or char_length(btrim(full_name)) between 2 and 120);
  end if;
end $$;

create table if not exists public.parents (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null unique,
  mobile text not null,
  address text,
  city text,
  pincode text,
  state text,
  instagram_url text,
  created_at timestamptz not null default now(),
  constraint parents_name_length check (char_length(full_name) between 2 and 120),
  constraint parents_email_length check (char_length(email) between 5 and 160),
  constraint parents_mobile_format check (mobile ~ '^\+91[6-9][0-9]{9}$'),
  constraint parents_address_length check (address is null or char_length(address) between 5 and 240),
  constraint parents_city_length check (city is null or char_length(city) between 2 and 80),
  constraint parents_pincode_format check (pincode is null or pincode ~ '^[1-9][0-9]{5}$'),
  constraint parents_state_length check (state is null or char_length(state) between 2 and 80),
  constraint parents_instagram_length check (instagram_url is null or char_length(instagram_url) between 12 and 300)
);

alter table public.parents alter column address drop not null;
alter table public.parents alter column city drop not null;
alter table public.parents alter column pincode drop not null;
alter table public.parents alter column state drop not null;

create table if not exists public.contests (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  banner_url text not null,
  description text not null,
  reward text not null,
  entry_fee numeric(10, 2) not null default 0,
  start_date date not null,
  end_date date not null,
  result_date date not null,
  registration_status text not null default 'open',
  age_range text not null,
  is_hero boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint contests_registration_status_check check (registration_status in ('open', 'closed')),
  constraint contests_entry_fee_check check (entry_fee >= 0),
  constraint contests_date_order_check check (start_date <= end_date and end_date <= result_date),
  constraint contests_age_range_length check (char_length(age_range) between 1 and 40)
);

create unique index if not exists contests_one_hero_idx
  on public.contests ((true))
  where is_hero;

create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  contest_slug text not null,
  contest_title text not null,
  participant_name text not null,
  email text not null,
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint entries_name_length check (char_length(participant_name) between 2 and 120),
  constraint entries_email_length check (char_length(email) between 5 and 160),
  constraint entries_slug_length check (char_length(contest_slug) between 2 and 80),
  constraint entries_title_length check (char_length(contest_title) between 2 and 200)
);

create index if not exists entries_user_id_idx on public.entries (user_id);
create index if not exists entries_email_idx on public.entries (email);
create unique index if not exists entries_email_contest_uidx
  on public.entries (lower(email), contest_slug);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now(),
  constraint contact_name_length check (char_length(name) between 2 and 120),
  constraint contact_email_length check (char_length(email) between 5 and 160),
  constraint contact_message_length check (char_length(message) between 10 and 2000)
);

create table if not exists public.site_media (
  key text primary key,
  label text not null,
  image_url text not null,
  updated_at timestamptz not null default now(),
  constraint site_media_key_length check (char_length(key) between 2 and 80),
  constraint site_media_url_length check (char_length(image_url) between 12 and 1000)
);

create table if not exists public.winner_reels (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  video_url text not null,
  visible boolean not null default true,
  slot smallint unique,
  created_at timestamptz not null default now(),
  constraint winner_reels_title_length check (char_length(title) between 1 and 80),
  constraint winner_reels_url_length check (char_length(video_url) between 12 and 500),
  constraint winner_reels_slot_range check (slot is null or slot >= 1)
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins where id = auth.uid()
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  account_type text := coalesce(new.raw_user_meta_data ->> 'account_type', '');
begin
  if account_type = 'admin' then
    insert into public.admins (id, email, full_name)
    values (
      new.id,
      new.email,
      nullif(btrim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), '')
    )
    on conflict (id) do update
    set
      email = excluded.email,
      full_name = coalesce(excluded.full_name, public.admins.full_name);
    return new;
  end if;

  if account_type = 'parent' then
    insert into public.parents (id, full_name, email, mobile)
    values (
      new.id,
      new.raw_user_meta_data ->> 'full_name',
      new.email,
      coalesce(new.raw_user_meta_data ->> 'phone', '')
    )
    on conflict (id) do nothing;
  end if;

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
    (select count(*)::integer from public.admins),
    (select count(*)::integer from public.parents),
    (select count(*)::integer from public.contests),
    (select count(*)::integer from public.contests where registration_status = 'open'),
    (
      select c.name
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
  city text,
  state text,
  instagram_url text,
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

  if requested_role = 'admin' then
    return query
    select
      a.id,
      coalesce(nullif(btrim(a.full_name), ''), a.email),
      a.email,
      null::text,
      null::text,
      null::text,
      null::text,
      a.created_at
    from public.admins a
    order by a.created_at desc
    limit 200;
    return;
  end if;

  if requested_role = 'parent' then
    return query
    select p.id, p.full_name, p.email, p.mobile, p.city, p.state, p.instagram_url, p.created_at
    from public.parents p
    order by p.created_at desc
    limit 200;
  end if;
end;
$$;

-- Lets a signed-in admin create another admin who can log in immediately.
create extension if not exists pgcrypto with schema extensions;

create or replace function public.admin_create_admin(
  admin_name text,
  admin_email text,
  admin_password text
)
returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  new_id uuid;
  clean_name text := btrim(coalesce(admin_name, ''));
  clean_email text := lower(btrim(coalesce(admin_email, '')));
begin
  if not public.is_admin() then
    raise exception 'Only an admin can add another admin.';
  end if;

  if char_length(clean_name) < 2 or char_length(clean_name) > 120 then
    raise exception 'Enter the admin name.';
  end if;

  if char_length(clean_email) < 5
    or char_length(clean_email) > 160
    or position('..' in clean_email) > 0
    or clean_email !~ '^[a-z0-9](?:[a-z0-9._%+-]*[a-z0-9])?@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$'
  then
    raise exception 'Enter a valid email address.';
  end if;

  if admin_password is null
    or char_length(admin_password) < 8
    or char_length(admin_password) > 72
    or admin_password !~ '[A-Za-z]'
    or admin_password !~ '[0-9]'
  then
    raise exception 'Use at least 8 characters, including one letter and one number.';
  end if;

  if exists (select 1 from auth.users where lower(email) = clean_email)
    or exists (select 1 from public.admins where lower(email) = clean_email)
    or exists (select 1 from public.parents where lower(email) = clean_email)
  then
    raise exception 'An account with this email already exists.';
  end if;

  new_id := gen_random_uuid();

  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  ) values (
    '00000000-0000-0000-0000-000000000000',
    new_id,
    'authenticated',
    'authenticated',
    clean_email,
    extensions.crypt(admin_password, extensions.gen_salt('bf')),
    now(),
    '',
    '',
    '',
    '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('account_type', 'admin', 'full_name', clean_name),
    now(),
    now()
  );

  insert into auth.identities (
    id,
    user_id,
    provider,
    provider_id,
    identity_data,
    last_sign_in_at,
    created_at,
    updated_at
  )
  select
    gen_random_uuid(),
    new_id,
    'email',
    new_id::text,
    jsonb_build_object('sub', new_id::text, 'email', clean_email),
    now(),
    now(),
    now()
  where not exists (
    select 1
    from auth.identities
    where user_id = new_id
      and provider = 'email'
  );

  update public.admins
  set
    email = clean_email,
    full_name = clean_name
  where id = new_id;

  if not found then
    insert into public.admins (id, email, full_name)
    values (new_id, clean_email, clean_name);
  end if;

  return new_id;
exception
  when unique_violation then
    raise exception 'An account with this email already exists.';
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.admins enable row level security;
alter table public.parents enable row level security;
alter table public.contests enable row level security;
alter table public.entries enable row level security;
alter table public.contact_messages enable row level security;
alter table public.site_media enable row level security;
alter table public.winner_reels enable row level security;

drop policy if exists "Admins read own row" on public.admins;
create policy "Admins read own row"
  on public.admins for select
  to authenticated
  using (id = auth.uid());

drop policy if exists "Parents read own row" on public.parents;
create policy "Parents read own row"
  on public.parents for select
  to authenticated
  using (id = auth.uid());

drop policy if exists "Anyone can read contests" on public.contests;
create policy "Anyone can read contests"
  on public.contests for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins insert contests" on public.contests;
create policy "Admins insert contests"
  on public.contests for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admins update contests" on public.contests;
create policy "Admins update contests"
  on public.contests for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins delete contests" on public.contests;
create policy "Admins delete contests"
  on public.contests for delete
  to authenticated
  using (public.is_admin());

drop policy if exists "Anyone can submit an entry" on public.entries;
create policy "Anyone can submit an entry"
  on public.entries for insert
  to anon, authenticated
  with check (
    char_length(participant_name) between 2 and 120
    and char_length(contest_slug) between 2 and 80
    and char_length(contest_title) between 2 and 200
    and char_length(email) between 5 and 160
    and email like '%_@_%._%'
    and email !~ '[[:space:]]'
    and (user_id is null or user_id = auth.uid())
  );

drop policy if exists "Members read their own entries" on public.entries;
create policy "Members read their own entries"
  on public.entries for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Anyone can send a message" on public.contact_messages;
create policy "Anyone can send a message"
  on public.contact_messages for insert
  to anon, authenticated
  with check (
    char_length(name) between 2 and 120
    and char_length(email) between 5 and 160
    and char_length(message) between 10 and 2000
    and email like '%_@_%._%'
    and email !~ '[[:space:]]'
  );

drop policy if exists "Admins read contact messages" on public.contact_messages;
create policy "Admins read contact messages"
  on public.contact_messages for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Anyone can read site media" on public.site_media;
create policy "Anyone can read site media"
  on public.site_media for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins insert site media" on public.site_media;
create policy "Admins insert site media"
  on public.site_media for insert
  to authenticated
  with check (
    public.is_admin()
    and image_url like 'https://%'
    and image_url !~ '[[:space:]]'
    and char_length(key) between 2 and 80
    and char_length(image_url) between 12 and 1000
  );

drop policy if exists "Admins update site media" on public.site_media;
create policy "Admins update site media"
  on public.site_media for update
  to authenticated
  using (public.is_admin())
  with check (
    public.is_admin()
    and image_url like 'https://%'
    and image_url !~ '[[:space:]]'
    and char_length(key) between 2 and 80
    and char_length(image_url) between 12 and 1000
  );

drop policy if exists "Anyone can read visible reels" on public.winner_reels;
create policy "Anyone can read visible reels"
  on public.winner_reels for select
  to anon, authenticated
  using (visible = true);

drop policy if exists "Admins add reels" on public.winner_reels;
create policy "Admins add reels"
  on public.winner_reels for insert
  to authenticated
  with check (
    public.is_admin()
    and visible = true
    and video_url like 'https://%'
    and video_url !~ '[[:space:]]'
    and char_length(title) between 1 and 80
    and char_length(video_url) between 12 and 500
  );

drop policy if exists "Admins update reels" on public.winner_reels;
create policy "Admins update reels"
  on public.winner_reels for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins delete reels" on public.winner_reels;
create policy "Admins delete reels"
  on public.winner_reels for delete
  to authenticated
  using (public.is_admin());

grant select on public.admins, public.parents to authenticated;
grant select on public.contests, public.winner_reels, public.site_media to anon, authenticated;
grant insert, update, delete on public.contests to authenticated;
grant insert on public.entries to anon, authenticated;
grant select on public.entries to authenticated;
grant insert on public.contact_messages to anon, authenticated;
grant select on public.contact_messages to authenticated;
grant insert, update on public.site_media to authenticated;
grant insert, update, delete on public.winner_reels to authenticated;

revoke all on function public.is_admin() from public;
revoke all on function public.admin_account_counts() from public;
revoke all on function public.admin_list_profiles(text) from public;
revoke all on function public.admin_create_admin(text, text, text) from public, anon;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.admin_account_counts() to authenticated;
grant execute on function public.admin_list_profiles(text) to authenticated;
grant execute on function public.admin_create_admin(text, text, text) to authenticated;

insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do update
set public = true
where storage.buckets.id = excluded.id;

drop policy if exists "Public read site images" on storage.objects;
drop policy if exists "Admins upload site images" on storage.objects;
drop policy if exists "Admins replace site images" on storage.objects;

create policy "Public read site images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'site-images');

create policy "Admins upload site images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'site-images' and public.is_admin());

create policy "Admins replace site images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'site-images' and public.is_admin())
  with check (bucket_id = 'site-images' and public.is_admin());

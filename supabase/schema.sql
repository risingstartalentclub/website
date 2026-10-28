-- Rising Star Talent Club
-- Run this once in the Supabase SQL editor on a new project.
-- It only creates tables, policies, and the image bucket.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id),
  full_name text not null,
  guardian_name text,
  role text not null default 'participant',
  created_at timestamptz not null default now(),
  constraint profiles_role_check check (role in ('participant', 'admin'))
);

create table if not exists public.contests (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category_label text not null,
  age_group text not null,
  reward text not null,
  fee text not null,
  deadline text not null,
  description text not null,
  image_url text not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  contest_slug text not null,
  contest_title text not null,
  participant_name text not null,
  email text not null,
  user_id uuid references auth.users (id),
  created_at timestamptz not null default now(),
  constraint entries_name_length check (char_length(participant_name) between 2 and 120),
  constraint entries_email_length check (char_length(email) between 5 and 160),
  constraint entries_slug_length check (char_length(contest_slug) between 2 and 80),
  constraint entries_title_length check (char_length(contest_title) between 2 and 200)
);

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

create table if not exists public.winners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contest text not null,
  quote text not null,
  badge text not null,
  title text not null,
  image_url text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.site_media (
  key text primary key,
  label text not null,
  image_url text not null,
  updated_at timestamptz not null default now(),
  constraint site_media_key_length check (char_length(key) between 2 and 80),
  constraint site_media_url_length check (char_length(image_url) between 12 and 1000)
);

create index if not exists entries_user_id_idx on public.entries (user_id);
create index if not exists entries_email_idx on public.entries (email);
create unique index if not exists entries_email_contest_uidx
  on public.entries (lower(email), contest_slug);

alter table public.profiles enable row level security;
alter table public.contests enable row level security;
alter table public.entries enable row level security;
alter table public.contact_messages enable row level security;
alter table public.winners enable row level security;
alter table public.site_media enable row level security;

create policy "Anyone can read contests"
  on public.contests for select
  to anon, authenticated
  using (true);

create policy "Anyone can read winners"
  on public.winners for select
  to anon, authenticated
  using (true);

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
  );

create policy "Members read their own entries"
  on public.entries for select
  to authenticated
  using (user_id = auth.uid());

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

create policy "Members read their profile"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

create policy "Members update their profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "Anyone can read site media"
  on public.site_media for select
  to anon, authenticated
  using (true);

create policy "Admins insert site media"
  on public.site_media for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
    and image_url like 'https://%'
    and image_url !~ '[[:space:]]'
    and char_length(key) between 2 and 80
    and char_length(image_url) between 12 and 1000
  );

create policy "Admins update site media"
  on public.site_media for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
    and image_url like 'https://%'
    and image_url !~ '[[:space:]]'
    and char_length(key) between 2 and 80
    and char_length(image_url) between 12 and 1000
  );

grant select on public.contests, public.winners to anon, authenticated;
grant insert on public.entries to anon, authenticated;
grant select on public.entries to authenticated;
grant insert on public.contact_messages to anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select on public.site_media to anon, authenticated;
grant insert, update on public.site_media to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, guardian_name)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), 'Participant'),
    nullif(new.raw_user_meta_data ->> 'guardian_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace function public.protect_profile_role()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() is null then
    return new;
  end if;

  if new.role is distinct from old.role
    and not exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    ) then
    raise exception 'Only an admin can change account roles';
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create trigger protect_profile_role
  before update on public.profiles
  for each row execute function public.protect_profile_role();

insert into public.contests (slug, title, category_label, age_group, reward, fee, deadline, description, image_url)
values
  (
    'baby-toddler-festive-look',
    'Baby & Toddler Festive Look',
    'Baby & Toddler (Ages 1-3)',
    'baby',
    '₹25,000 + Golden Star Trophy',
    'Free Entry',
    'Oct 28, 2025',
    'Showcase your little star''s cutest festive avatar, regional ethnic attire, and adorable cheerful charm.',
    'https://lh3.googleusercontent.com/aida/AEtjO1Ui4nVL8Ja6pQxRbs9r3aK5_-RDcxD06uRi7OV56G8SMCEMU_oPocoPPukhF8OOkPTQiuairLEySShcvmD_ortKuAdgtdxbCJ8McdQ0I0TjnlO3ZkUfJjof6iIQm0HGvgMyD8q3jeZsjl9LrxX4Mgpj0WHQXL_l72Wle4V9mTgqacgU6-hsVHAf9x-BR9g94RA4NK6iwXc5nqFUkBnvs9MzsXVgdcLi5J-ylxR050d5ivh4KpqphnNiklI'
  ),
  (
    'diwali-cultural-showcase-2026',
    'Diwali & Cultural Showcase 2026',
    'Kids & Juniors (Ages 4-12)',
    'kids',
    '₹35,000 + Certificate & Medal',
    'Free Entry',
    'Nov 4, 2025',
    'Celebrate cultural heritage, festive tradition, creative dance, or music. Open to passionate budding artists.',
    'https://lh3.googleusercontent.com/aida/AEtjO1WWro9Xd7A39GB4QBIE1QR6ghcaBO7fO6pedwFvOKeg27oUPyw20ALHQjQ_kzxHH8r3np4B2r26Eg9QUzud7dvP7RvUe1R3-yKbVYOu9hAbNhIfZ7NlYx6q6ZbAZFEq84oMpQ_iED82PaHi0O7lifHJ8XILCl8zjXzGagMqGp6lRENfhthH51014fm3voYbCtWAEcrtspWznXo08XkMQkgVn07DlM7g9E7o6b8qHbM9OGru7JHSTD_8JZHC'
  ),
  (
    'club-registration',
    'New Participant Registration',
    'Youth Category (Ages 1-20)',
    'all',
    'Official Star Entry Badge',
    'Free to Join',
    'Ongoing',
    'Create a free Rising Star Talent Club account.',
    ''
  )
on conflict (slug) do nothing;

insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do update
set public = true
where storage.buckets.id = excluded.id;

create policy "Public read site images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'site-images');

create policy "Admins upload site images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'site-images'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins replace site images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'site-images'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  )
  with check (
    bucket_id = 'site-images'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

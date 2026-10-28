-- Run this once in the Supabase SQL editor.
-- Safe to run when the reels table already exists.
-- It does not remove any existing data.

create table if not exists public.winner_reels (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  video_url text not null,
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  constraint winner_reels_title_length check (char_length(title) between 1 and 80),
  constraint winner_reels_url_length check (char_length(video_url) between 12 and 500)
);

alter table public.winner_reels add column if not exists slot smallint;

alter table public.winner_reels drop constraint if exists winner_reels_slot_range;

do $$
begin
  alter table public.winner_reels
    add constraint winner_reels_slot_range check (slot is null or slot >= 1);
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.winner_reels
    add constraint winner_reels_slot_key unique (slot);
exception
  when duplicate_object then null;
end $$;

alter table public.winner_reels enable row level security;

do $$
begin
  create policy "Anyone can read visible reels"
    on public.winner_reels for select
    to anon, authenticated
    using (visible = true);
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create policy "Admins add reels"
    on public.winner_reels for insert
    to authenticated
    with check (
      exists (
        select 1 from public.profiles
        where id = auth.uid() and role = 'admin'
      )
      and visible = true
      and video_url like 'https://%'
      and video_url !~ '[[:space:]]'
      and char_length(title) between 1 and 80
      and char_length(video_url) between 12 and 500
    );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create policy "Admins update reels"
    on public.winner_reels for update
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
    );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create policy "Admins read contact messages"
    on public.contact_messages for select
    to authenticated
    using (
      exists (
        select 1 from public.profiles
        where id = auth.uid() and role = 'admin'
      )
    );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create policy "Admins delete reels"
    on public.winner_reels for delete
    to authenticated
    using (
      exists (
        select 1 from public.profiles
        where id = auth.uid() and role = 'admin'
      )
    );
exception
  when duplicate_object then null;
end $$;

grant select on public.winner_reels to anon, authenticated;
grant insert, update, delete on public.winner_reels to authenticated;
grant select on public.contact_messages to authenticated;

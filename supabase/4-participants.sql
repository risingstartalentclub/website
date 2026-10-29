-- Rising Star Talent Club
-- Run this once in the Supabase SQL editor on the live project.
-- Do not edit or re-run supabase/1-schema.sql for this change.
-- Re-running this file is safe.

create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.parents (id) on delete cascade,
  full_name text not null,
  age smallint not null,
  gender text not null,
  instagram_url text not null,
  created_at timestamptz not null default now(),
  constraint participants_name_length check (char_length(btrim(full_name)) between 2 and 120),
  constraint participants_age_check check (age between 0 and 21),
  constraint participants_gender_check check (gender in ('boy', 'girl')),
  constraint participants_instagram_length check (char_length(instagram_url) between 12 and 300)
);

create index if not exists participants_parent_id_idx on public.participants (parent_id);

alter table public.entries add column if not exists participant_id uuid references public.participants (id) on delete restrict;
alter table public.entries add column if not exists is_winner boolean not null default false;
alter table public.entries add column if not exists prize_address text;
alter table public.entries add column if not exists prize_city text;
alter table public.entries add column if not exists prize_pincode text;
alter table public.entries add column if not exists prize_state text;
alter table public.contests add column if not exists results_announced boolean not null default false;

-- One parent email can enter more than one child in the same contest.
drop index if exists entries_email_contest_uidx;
create unique index if not exists entries_participant_contest_uidx
  on public.entries (participant_id, contest_slug)
  where participant_id is not null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'entries_prize_address_length') then
    alter table public.entries
      add constraint entries_prize_address_length
      check (prize_address is null or char_length(prize_address) between 5 and 240);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'entries_prize_city_length') then
    alter table public.entries
      add constraint entries_prize_city_length
      check (prize_city is null or char_length(prize_city) between 2 and 80);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'entries_prize_pincode_format') then
    alter table public.entries
      add constraint entries_prize_pincode_format
      check (prize_pincode is null or prize_pincode ~ '^[1-9][0-9]{5}$');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'entries_prize_state_length') then
    alter table public.entries
      add constraint entries_prize_state_length
      check (prize_state is null or char_length(prize_state) between 2 and 80);
  end if;
end $$;

alter table public.participants enable row level security;

drop policy if exists "Anyone can submit an entry" on public.entries;
drop policy if exists "Parents enter their child" on public.entries;
create policy "Parents enter their child"
  on public.entries for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and participant_id is not null
    and exists (
      select 1 from public.participants
      where id = participant_id and parent_id = auth.uid()
    )
    and char_length(participant_name) between 2 and 120
    and char_length(contest_slug) between 2 and 80
    and char_length(contest_title) between 2 and 200
    and char_length(email) between 5 and 160
    and email like '%_@_%._%'
    and email !~ '[[:space:]]'
  );

drop policy if exists "Admins read entries" on public.entries;
create policy "Admins read entries"
  on public.entries for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Parents read own children" on public.participants;
create policy "Parents read own children"
  on public.participants for select
  to authenticated
  using (parent_id = auth.uid());

drop policy if exists "Parents add own children" on public.participants;
create policy "Parents add own children"
  on public.participants for insert
  to authenticated
  with check (
    parent_id = auth.uid()
    and gender in ('boy', 'girl')
    and age between 0 and 21
    and char_length(btrim(full_name)) between 2 and 120
    and char_length(instagram_url) between 12 and 300
  );

drop policy if exists "Admins read children" on public.participants;
create policy "Admins read children"
  on public.participants for select
  to authenticated
  using (public.is_admin());

create or replace function public.admin_announce_winners(target_slug text, winner_ids uuid[])
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  picked integer;
begin
  if not public.is_admin() then
    raise exception 'Only an admin can choose a winner.';
  end if;

  if target_slug is null or char_length(target_slug) < 2 then
    raise exception 'Choose a contest.';
  end if;

  if winner_ids is null or cardinality(winner_ids) < 1 then
    raise exception 'Select at least one winner.';
  end if;

  if not exists (select 1 from public.contests where slug = target_slug) then
    raise exception 'That contest was not found.';
  end if;

  select count(*) into picked
  from public.entries
  where contest_slug = target_slug
    and id = any(winner_ids);

  if picked <> cardinality(winner_ids) then
    raise exception 'Choose winners from this contest only.';
  end if;

  update public.entries
  set is_winner = id = any(winner_ids)
  where contest_slug = target_slug;

  update public.contests
  set results_announced = true
  where slug = target_slug;
end;
$$;

create or replace function public.claim_prize(
  entry_id uuid,
  claim_address text,
  claim_city text,
  claim_pincode text,
  claim_state text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_address text := btrim(coalesce(claim_address, ''));
  clean_city text := btrim(coalesce(claim_city, ''));
  clean_pin text := btrim(coalesce(claim_pincode, ''));
  clean_state text := btrim(coalesce(claim_state, ''));
begin
  if auth.uid() is null then
    raise exception 'Log in before claiming a prize.';
  end if;

  if char_length(clean_address) < 5 or char_length(clean_address) > 240 then
    raise exception 'Enter the full address.';
  end if;
  if char_length(clean_city) < 2 or char_length(clean_city) > 80 then
    raise exception 'Enter the city.';
  end if;
  if clean_pin !~ '^[1-9][0-9]{5}$' then
    raise exception 'Enter a 6-digit PIN code.';
  end if;
  if char_length(clean_state) < 2 or char_length(clean_state) > 80 then
    raise exception 'Choose a state.';
  end if;

  update public.entries as entry
  set
    prize_address = clean_address,
    prize_city = clean_city,
    prize_pincode = clean_pin,
    prize_state = clean_state
  where entry.id = entry_id
    and entry.user_id = auth.uid()
    and entry.is_winner
    and exists (
      select 1
      from public.contests as contest
      where contest.slug = entry.contest_slug
        and contest.results_announced
    );

  if not found then
    raise exception 'This prize cannot be claimed.';
  end if;
end;
$$;

grant select, insert on public.participants to authenticated;
revoke insert on public.entries from anon;
grant insert, select on public.entries to authenticated;

revoke all on function public.admin_announce_winners(text, uuid[]) from public, anon;
revoke all on function public.claim_prize(uuid, text, text, text, text) from public, anon;
grant execute on function public.admin_announce_winners(text, uuid[]) to authenticated;
grant execute on function public.claim_prize(uuid, text, text, text, text) to authenticated;

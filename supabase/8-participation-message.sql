-- Rising Star Talent Club
-- Run this once in the Supabase SQL editor after supabase/7-contact-text.sql.
-- Each contest can store the thank-you or instruction shown after a parent enters.
-- Re-running this file is safe.

alter table public.contests add column if not exists participation_message text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'contests_participation_message_length'
  ) then
    alter table public.contests
      add constraint contests_participation_message_length
      check (
        participation_message is null
        or char_length(participation_message) between 10 and 800
      );
  end if;
end $$;

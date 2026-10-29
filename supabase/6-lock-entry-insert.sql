-- Rising Star Talent Club
-- Run this once in the Supabase SQL editor after supabase/4-participants.sql.
-- A new entry must be a non-winner, have no prize address, and target an open contest.
-- Re-running this file is safe.

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
    and is_winner = false
    and prize_address is null
    and prize_city is null
    and prize_pincode is null
    and prize_state is null
    and exists (
      select 1
      from public.contests
      where contests.slug = contest_slug
        and contests.registration_status = 'open'
        and contests.name = contest_title
    )
  );

revoke insert on public.entries from anon;
grant insert, select on public.entries to authenticated;

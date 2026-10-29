-- Rising Star Talent Club
-- Run this once in the Supabase SQL editor after supabase/6-lock-entry-insert.sql.
-- Contact Us rejects script and HTML in the name and message.
-- Re-running this file is safe.

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
    and name !~ '[<>]'
    and message !~ '[<>]'
    and name !~* 'javascript[[:space:]]*:'
    and message !~* 'javascript[[:space:]]*:'
  );

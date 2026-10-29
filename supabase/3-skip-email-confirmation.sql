-- Run this once in the Supabase SQL editor after supabase/1-schema.sql.
-- Parents can log in without confirming an email.
-- Existing unconfirmed accounts are confirmed. New accounts are confirmed on signup.

create or replace function public.confirm_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.email_confirmed_at = coalesce(new.email_confirmed_at, now());
  return new;
end;
$$;

drop trigger if exists confirm_auth_user on auth.users;
create trigger confirm_auth_user
  before insert on auth.users
  for each row execute function public.confirm_new_user();

update auth.users
set email_confirmed_at = now()
where email_confirmed_at is null;

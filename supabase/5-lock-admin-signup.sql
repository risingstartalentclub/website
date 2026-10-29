-- Rising Star Talent Club
-- Run this once in the Supabase SQL editor on the live project.
-- Public signup can no longer create an admin by sending account_type.
-- Re-running this file is safe.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  account_type text := coalesce(new.raw_user_meta_data ->> 'account_type', '');
begin
  -- Signup metadata is chosen by the caller. Never create an admin from it.
  -- Admin rows are inserted by admin_create_admin and supabase/2-make-admin.sql.
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

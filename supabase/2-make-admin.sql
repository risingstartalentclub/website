-- Creates an admin you can log in with immediately.
-- Run supabase/1-schema.sql first.
-- 1. Change the email and password below.
-- 2. Run this once in the Supabase SQL editor.
-- 3. On the site, log in at /admin/login with that same email and password.

create extension if not exists pgcrypto with schema extensions;

do $$
declare
  admin_email text := '';
  admin_password text := '';
  admin_id uuid;
begin
  select id into admin_id
  from auth.users
  where email = admin_email;

  if admin_id is null then
    admin_id := gen_random_uuid();

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
      admin_id,
      'authenticated',
      'authenticated',
      admin_email,
      extensions.crypt(admin_password, extensions.gen_salt('bf')),
      now(),
      '',
      '',
      '',
      '',
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      now(),
      now()
    );
  else
    update auth.users
    set
      encrypted_password = extensions.crypt(admin_password, extensions.gen_salt('bf')),
      email_confirmed_at = coalesce(email_confirmed_at, now()),
      updated_at = now()
    where id = admin_id;
  end if;

  insert into public.admins (id, email)
  values (admin_id, admin_email)
  on conflict (id) do update set email = excluded.email;

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
    admin_id,
    'email',
    admin_id::text,
    jsonb_build_object('sub', admin_id::text, 'email', admin_email),
    now(),
    now(),
    now()
  where not exists (
    select 1
    from auth.identities
    where user_id = admin_id
      and provider = 'email'
  );
end $$;

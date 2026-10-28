-- Contest cards the admin can edit. Safe to run again.
-- It does not delete contests, profiles, entries, reels, or the admin account.

alter table public.contests add column if not exists image_alt text not null default '';
alter table public.contests add column if not exists ends_label text not null default '';
alter table public.contests add column if not exists ends_urgent boolean not null default false;
alter table public.contests add column if not exists reward_icon text not null default 'emoji_events';
alter table public.contests add column if not exists sort_order integer not null default 0;

drop policy if exists "Admins insert contests" on public.contests;
drop policy if exists "Admins update contests" on public.contests;
drop policy if exists "Admins delete contests" on public.contests;

create policy "Admins insert contests"
  on public.contests for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins update contests"
  on public.contests for update
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

create policy "Admins delete contests"
  on public.contests for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

grant insert, update, delete on public.contests to authenticated;

alter table public.contests drop column if exists age_group;
alter table public.contests drop column if exists age_badge;

insert into public.contests (
  slug, title, category_label, reward, reward_icon, fee,
  deadline, ends_label, ends_urgent, description, image_url, image_alt, status, sort_order
)
values
  (
    'baby-toddler-festive-look',
    'Baby & Toddler Festive Look',
    'Festive Look',
    '₹25,000 + Golden Star Trophy',
    'emoji_events',
    'Free Entry',
    'Oct 28, 2025',
    'Ends in 6 Days (Oct 28)',
    true,
    'Showcase your little star''s cutest festive avatar, regional ethnic attire, and adorable cheerful charm.',
    '/contests/baby-festive.jpg',
    'Baby & Toddler Festive Look winner',
    'open',
    1
  ),
  (
    'diwali-cultural-showcase-2026',
    'Diwali & Cultural Showcase 2026',
    'Cultural Showcase',
    '₹35,000 + Certificate & Medal',
    'military_tech',
    'Free Entry',
    'Nov 4, 2025',
    'Ends in 12 Days (Nov 4)',
    false,
    'Celebrate cultural heritage, festive tradition, creative dance, or music. Open to passionate budding artists.',
    '/contests/diwali.jpg',
    'Diwali & Cultural Showcase 2026',
    'open',
    2
  )
on conflict (slug) do nothing;

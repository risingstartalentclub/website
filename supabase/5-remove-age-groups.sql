-- Remove contest age groups. Safe to run again.
-- It does not delete contests, profiles, entries, reels, or the admin account.

alter table public.contests drop column if exists age_group;
alter table public.contests drop column if exists age_badge;

update public.contests
set category_label = 'Festive Look'
where slug = 'baby-toddler-festive-look'
  and category_label in ('Baby & Toddler (Ages 1-3)', 'Baby & Toddler');

update public.contests
set category_label = 'Cultural Showcase'
where slug = 'diwali-cultural-showcase-2026'
  and category_label in ('Kids & Juniors (Ages 4-12)', 'Kids & Juniors');

update public.contests
set category_label = regexp_replace(category_label, '\s*\(Ages[^)]*\)', '', 'gi')
where category_label ~* '\(Ages';

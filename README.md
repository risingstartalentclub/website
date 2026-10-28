# Rising Star Talent Club

Next.js site for the Rising Star Talent Club homepage, contests, accounts, and support pages. Accounts, contest entries, and contact messages are stored in Supabase.

## Supabase

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local` and fill in the project URL and anon key.
3. Open the Supabase SQL editor and run `supabase/1-schema.sql`.
4. Set the email and password in `supabase/2-make-admin.sql`, then run that file. Sign in at `/admin/login`.
5. In Authentication, allow email sign-up. If email confirmation is on, parents confirm by email before they can log in.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000.

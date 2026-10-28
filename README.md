# Rising Star Talent Club

Next.js site for the Rising Star Talent Club homepage, contests, accounts, and support pages. Accounts, contest entries, and contact messages are stored in Supabase.

## Supabase

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local` and fill in the project URL and anon key.
3. Open the Supabase SQL editor and run `supabase/1-schema.sql`.
4. In Authentication, allow email sign-up. If email confirmation is on, new members confirm by email before they can log in.
5. Create an account, then promote it in the SQL editor: `update public.profiles set role = 'admin' where id = 'your-user-id';`. Open `/admin` to replace the logo, homepage photos, contest photos, and winner portraits.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000.

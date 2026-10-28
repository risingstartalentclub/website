import Link from "next/link";
import { connection } from "next/server";
import { signOut } from "@/app/actions/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatEntryDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-");
  const monthIndex = Number(month) - 1;
  if (!year || !day || monthIndex < 0 || monthIndex > 11) return "";
  return `${Number(day)} ${months[monthIndex]} ${year}`;
}

export async function ProfilePanel() {
  await connection();

  if (!isSupabaseConfigured()) {
    return (
      <Notice
        title="Connect Supabase to open profiles"
        body="Add the project URL and anon key in .env.local, then run supabase/schema.sql. Accounts and saved entries will appear here."
      />
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Notice
        title="Log in to see your entries"
        body="Your contest registrations are kept with your account."
        actionHref="/login"
        actionLabel="Log In"
      />
    );
  }

  const [profileResult, entriesResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, guardian_name")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("entries")
      .select("id, contest_title, participant_name, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  if (profileResult.error || entriesResult.error) {
    return (
      <Notice
        title="We could not load your profile"
        body="Check your connection and refresh this page. Your entries are still saved."
      />
    );
  }

  const profile = profileResult.data;
  const entries = entriesResult.data ?? [];

  const name = profile?.full_name || user.email || "Participant";

  return (
    <section className="w-full bg-surface-container-low py-space-xl">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-space-lg px-margin-mobile md:px-margin">
        <div className="flex flex-col justify-between gap-space-md rounded-xl bg-primary-container p-space-lg text-on-primary md:flex-row md:items-center">
          <div>
            <p className="font-label-sm text-label-sm text-tertiary-fixed uppercase">
              Participant profile
            </p>
            <h1 className="font-headline-xl text-headline-xl-mobile md:text-headline-xl">
              {name}
            </h1>
            <p className="font-body-md text-body-md text-surface-container-highest">
              {user.email}
              {profile?.guardian_name
                ? ` · Guardian: ${profile.guardian_name}`
                : ""}
            </p>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="font-label-lg text-label-lg rounded-lg bg-surface-container-lowest px-space-lg py-3 text-primary transition-colors hover:bg-surface-container"
            >
              Log Out
            </button>
          </form>
        </div>

        <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
          <h2 className="font-headline-md text-headline-md text-primary">
            Your entries
          </h2>
          {entries.length > 0 ? (
            <ul className="mt-space-md flex flex-col gap-space-sm">
              {entries.map((entry) => (
                <li
                  key={entry.id}
                  className="flex flex-col justify-between gap-1 rounded-lg bg-surface-container-low p-space-md sm:flex-row sm:items-center"
                >
                  <div>
                    <p className="font-headline-sm text-headline-sm text-primary">
                      {entry.contest_title}
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {entry.participant_name}
                    </p>
                  </div>
                  <p className="font-label-sm text-label-sm text-secondary">
                    {formatEntryDate(entry.created_at)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-body-md text-body-md mt-space-md text-on-surface-variant">
              No entries yet.{" "}
              <Link href="/competitions" className="font-semibold text-secondary">
                Explore contests
              </Link>{" "}
              and confirm a free participation while you are logged in.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function Notice({
  title,
  body,
  actionHref,
  actionLabel,
}: {
  title: string;
  body: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <section className="w-full bg-surface-container-low py-space-xl">
      <div className="mx-auto max-w-xl px-margin-mobile md:px-margin">
        <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
          <h1 className="font-headline-md text-headline-md text-primary">{title}</h1>
          <p className="font-body-md text-body-md mt-2 text-on-surface-variant">
            {body}
          </p>
          {actionHref && actionLabel ? (
            <Link
              href={actionHref}
              className="font-label-lg text-label-lg mt-space-md inline-flex rounded-lg bg-primary-container px-space-lg py-3 text-on-primary"
            >
              {actionLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}

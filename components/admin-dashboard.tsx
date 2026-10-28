import Link from "next/link";
import { Icon } from "@/components/icon";
import { adminPath, adminPeopleSql, type AdminCounts } from "@/lib/admin-path";

const cards = [
  {
    key: "contests" as const,
    label: "Contests",
    icon: "emoji_events",
    href: `${adminPath}?section=contests`,
  },
  {
    key: "admins" as const,
    label: "Admins",
    icon: "verified",
    href: `${adminPath}?section=admins`,
  },
  {
    key: "participants" as const,
    label: "Web users",
    icon: "how_to_reg",
    href: `${adminPath}?section=users`,
  },
];

export function AdminDashboard({
  counts,
  ready,
  name,
}: {
  counts: AdminCounts;
  ready: boolean;
  name: string | null;
}) {
  if (!ready) {
    return (
      <p className="font-body-md text-body-md rounded-xl bg-error-container px-4 py-3 text-on-error-container">
        Run {adminPeopleSql} once in the Supabase SQL editor, then open the dashboard again.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="font-body-md text-body-md text-on-surface-variant">
        {name ? `Signed in as ${name}.` : "Signed in."} Choose a section to manage the club.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.key}
            href={card.href}
            className="rounded-xl bg-surface-container-lowest p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase">
                {card.label}
              </p>
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container text-on-primary">
                <Icon name={card.icon} className="text-[20px]" />
              </span>
            </div>
            <p className="font-headline-lg text-headline-lg mt-4 text-primary">{counts[card.key]}</p>
            {card.key === "contests" ? (
              <p className="font-body-sm text-body-sm mt-1 text-on-surface-variant">
                {counts.openContests} open for registration
              </p>
            ) : (
              <p className="font-body-sm text-body-sm mt-1 text-secondary">Open list</p>
            )}
          </Link>
        ))}
      </div>
      <section className="rounded-xl border border-tertiary-fixed-dim/50 bg-surface-container-lowest p-5 shadow-sm">
        <p className="font-label-sm text-label-sm tracking-wider text-tertiary-container uppercase">
          Homepage contest
        </p>
        <h2 className="font-headline-sm text-headline-sm mt-2 text-primary">
          {counts.heroTitle || "No contest is featured yet"}
        </h2>
        <p className="font-body-sm text-body-sm mt-1 text-on-surface-variant">
          {counts.heroTitle
            ? "This is the contest visitors see on the homepage."
            : "Open Contests and tick “Show this contest on the homepage” on one card."}
        </p>
        <Link
          href={`${adminPath}?section=contests`}
          className="font-label-md text-label-md mt-4 inline-flex items-center gap-1 font-bold text-secondary"
        >
          Manage contests
          <Icon name="arrow_forward" className="text-[16px]" />
        </Link>
      </section>
    </div>
  );
}

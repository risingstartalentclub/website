import type { ReactNode } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { ClaimPrizeForm } from "@/components/claim-prize-form";
import { CompetitionsSection } from "@/components/competitions-section";
import { LogoutButton } from "@/components/logout-button";
import { OpenEntryForm } from "@/components/open-entry-form";
import type { SavedChild } from "@/components/participate-modal";
import { getContests } from "@/lib/get-contests";
import { getSiteImages } from "@/lib/get-site-images";
import { parentEntryPath, parentPanelPath } from "@/lib/parent-panel";
import { applyContestImages } from "@/lib/site-images";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getViewer } from "@/lib/viewer";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatEntryDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-");
  const monthIndex = Number(month) - 1;
  if (!year || !day || monthIndex < 0 || monthIndex > 11) return "";
  return `${Number(day)} ${months[monthIndex]} ${year}`;
}

type PanelEntry = {
  id: string;
  contestSlug: string;
  contestTitle: string;
  participantName: string;
  createdAt: string;
  isWinner: boolean;
  age: number | null;
  gender: string | null;
  prizeAddress: string;
  prizeCity: string;
  prizePincode: string;
  prizeState: string;
};

function textValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function savedChildrenFromRows(rows: unknown): SavedChild[] {
  if (!Array.isArray(rows)) return [];
  return rows.flatMap((row) => {
    if (!row || typeof row !== "object") return [];
    const record = row as Record<string, unknown>;
    if (typeof record.id !== "string" || typeof record.full_name !== "string") return [];
    if (record.gender !== "boy" && record.gender !== "girl") return [];
    if (typeof record.age !== "number" || typeof record.instagram_url !== "string") return [];
    return [
      {
        id: record.id,
        fullName: record.full_name,
        age: record.age,
        gender: record.gender,
        instagramUrl: record.instagram_url,
      },
    ];
  });
}

function panelEntriesFromRows(rows: unknown): PanelEntry[] {
  if (!Array.isArray(rows)) return [];
  return rows.flatMap((row) => {
    if (!row || typeof row !== "object") return [];
    const record = row as Record<string, unknown>;
    if (typeof record.id !== "string" || typeof record.contest_title !== "string") return [];
    const child = record.participants;
    const related = Array.isArray(child) ? child[0] : child;
    const profile =
      related && typeof related === "object" ? (related as Record<string, unknown>) : null;
    return [
      {
        id: record.id,
        contestSlug: textValue(record.contest_slug),
        contestTitle: record.contest_title,
        participantName: textValue(record.participant_name) || textValue(profile?.full_name) || "Participant",
        createdAt: textValue(record.created_at),
        isWinner: record.is_winner === true,
        age: typeof profile?.age === "number" ? profile.age : null,
        gender: profile?.gender === "boy" || profile?.gender === "girl" ? profile.gender : null,
        prizeAddress: textValue(record.prize_address),
        prizeCity: textValue(record.prize_city),
        prizePincode: textValue(record.prize_pincode),
        prizeState: textValue(record.prize_state),
      },
    ];
  });
}

function announcedSlugs(rows: unknown) {
  if (!Array.isArray(rows)) return new Set<string>();
  return new Set(
    rows.flatMap((row) => {
      if (!row || typeof row !== "object") return [];
      const record = row as Record<string, unknown>;
      return record.results_announced === true && typeof record.slug === "string" ? [record.slug] : [];
    }),
  );
}

function entrySlug(value: string | undefined) {
  if (!value || !/^[a-z0-9-]{1,80}$/i.test(value)) return null;
  return value;
}

export async function ParentPanel({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; enter?: string }>;
}) {
  await connection();
  const params = await searchParams;
  const requestedSlug = entrySlug(params.enter);
  const view = params.view === "participated" && !requestedSlug ? "participated" : "live";

  if (!isSupabaseConfigured()) {
    return (
      <Notice
        title="Connect Supabase to open the parent panel"
        body="Add the project URL and anon key in .env.local, then run supabase/1-schema.sql. Live contests and saved entries will appear here."
      />
    );
  }

  const viewer = await getViewer("public");
  if (!viewer.signedIn || !viewer.id) {
    const next = requestedSlug
      ? parentEntryPath(requestedSlug)
      : view === "participated"
        ? `${parentPanelPath}?view=participated`
        : parentPanelPath;
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  const supabase = await createClient();
  const [profileResult, entryResult, childResult, announcedResult, images, contests] = await Promise.all([
    supabase
      .from("parents")
      .select("full_name, email, mobile")
      .eq("id", viewer.id)
      .maybeSingle(),
    supabase
      .from("entries")
      .select(
        "id, contest_slug, contest_title, participant_name, created_at, is_winner, prize_address, prize_city, prize_pincode, prize_state, participants(age, gender)",
      )
      .eq("user_id", viewer.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("participants")
      .select("id, full_name, age, gender, instagram_url")
      .eq("parent_id", viewer.id)
      .order("created_at", { ascending: true }),
    supabase.from("contests").select("slug, results_announced"),
    getSiteImages(),
    getContests(true),
  ]);

  let entries = panelEntriesFromRows(entryResult.data);
  let resultsReady = !entryResult.error;
  if (entryResult.error) {
    const basicEntries = await supabase
      .from("entries")
      .select("id, contest_slug, contest_title, participant_name, created_at")
      .eq("user_id", viewer.id)
      .order("created_at", { ascending: false });
    if (profileResult.error || basicEntries.error) {
      return (
        <Notice
          title="We could not load your parent panel"
          body="Check your connection and refresh this page. Your entries are still saved."
        />
      );
    }
    entries = panelEntriesFromRows(basicEntries.data);
    resultsReady = false;
  } else if (profileResult.error) {
    return (
      <Notice
        title="We could not load your parent panel"
        body="Check your connection and refresh this page. Your entries are still saved."
      />
    );
  }

  const profile = profileResult.data;
  if (!profile) {
    redirect("/login");
  }

  const children = childResult.error ? [] : savedChildrenFromRows(childResult.data);
  const announced = announcedResult.error ? new Set<string>() : announcedSlugs(announcedResult.data);
  const live = applyContestImages(contests, images).filter((contest) => contest.status !== "closed");
  const openSlugs = new Set(live.map((contest) => contest.slug));
  const opening = requestedSlug ? live.find((contest) => contest.slug === requestedSlug) : undefined;
  const participated = new Map<string, PanelEntry[]>();
  for (const entry of entries) {
    const group = participated.get(entry.contestSlug) ?? [];
    group.push(entry);
    participated.set(entry.contestSlug, group);
  }
  const name = profile.full_name || viewer.name || "Parent";

  return (
    <div className="bg-surface-container-low">
      <section className="w-full pt-space-xl">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-space-lg px-margin-mobile md:px-margin">
          <div className="flex flex-col justify-between gap-space-md rounded-xl bg-primary-container p-space-lg text-on-primary md:flex-row md:items-center">
            <div>
              <p className="font-label-sm text-label-sm text-tertiary-fixed uppercase">Parent panel</p>
              <h1 className="font-headline-xl text-headline-xl-mobile md:text-headline-xl">{name}</h1>
              <p className="font-body-md text-body-md text-surface-container-highest">
                {profile.email}
                {profile.mobile ? ` · ${profile.mobile}` : ""}
              </p>
            </div>
            <LogoutButton className="font-label-lg text-label-lg rounded-lg bg-surface-container-lowest px-space-lg py-3 text-primary transition-colors hover:bg-surface-container">
              Log Out
            </LogoutButton>
          </div>

          <nav className="flex flex-col gap-2 sm:flex-row" aria-label="Parent panel">
            <PanelLink href={parentPanelPath} active={view === "live"}>
              Live Contests
            </PanelLink>
            <PanelLink href={`${parentPanelPath}?view=participated`} active={view === "participated"}>
              Participated{entries.length > 0 ? ` (${entries.length})` : ""}
            </PanelLink>
          </nav>
        </div>
      </section>

      {view === "live" ? (
        <CompetitionsSection
          items={live}
          signedIn
          eyebrow="OPEN NOW"
          heading="Live Contests"
          intro="Every open contest is listed here. Choose Participate Now to enter one."
        />
      ) : (
        <section className="w-full py-space-xl">
          <div className="mx-auto max-w-[1280px] px-margin-mobile md:px-margin">
            <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
              <h2 className="font-headline-md text-headline-md text-primary">Participated</h2>
              {entries.length > 0 ? (
                <div className="mt-space-md flex flex-col gap-space-md">
                  {[...participated.entries()].map(([slug, group]) => (
                    <section key={slug} className="rounded-lg bg-surface-container-low p-space-md">
                      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                        <h3 className="font-headline-sm text-headline-sm text-primary">{group[0]?.contestTitle}</h3>
                        {openSlugs.has(slug) ? (
                          <Link
                            href={parentEntryPath(slug)}
                            className="font-label-md text-label-md w-fit rounded-lg bg-primary-container px-4 py-2 font-bold text-on-primary"
                          >
                            Add another child
                          </Link>
                        ) : null}
                      </div>
                      <ul className="mt-space-sm flex flex-col gap-space-sm">
                        {group.map((entry) => {
                          const decided = resultsReady && announced.has(entry.contestSlug);
                          return (
                            <li key={entry.id} className="rounded-lg bg-surface-container-lowest p-space-md">
                              <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                                <div>
                                  <p className="font-body-md text-body-md font-semibold text-primary">{entry.participantName}</p>
                                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                                    {entry.age !== null ? `Age ${entry.age}` : "Entered"}
                                    {entry.gender === "boy" ? " · Boy" : entry.gender === "girl" ? " · Girl" : ""}
                                  </p>
                                </div>
                                <p className="font-label-sm text-label-sm text-secondary">{formatEntryDate(entry.createdAt)}</p>
                              </div>
                              {decided && entry.isWinner ? (
                                <p className="font-label-md text-label-md mt-2 font-bold text-primary">This participant won.</p>
                              ) : null}
                              {decided && !entry.isWinner ? (
                                <p className="font-label-md text-label-md mt-2 text-on-surface-variant">Better luck next time.</p>
                              ) : null}
                              {decided && entry.isWinner ? (
                                <ClaimPrizeForm
                                  entryId={entry.id}
                                  address={entry.prizeAddress}
                                  city={entry.prizeCity}
                                  pincode={entry.prizePincode}
                                  state={entry.prizeState}
                                />
                              ) : null}
                            </li>
                          );
                        })}
                      </ul>
                    </section>
                  ))}
                </div>
              ) : (
                <p className="font-body-md text-body-md mt-space-md text-on-surface-variant">
                  You have not entered a contest yet. Open Live Contests and choose Participate Now.
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {opening ? (
        <OpenEntryForm
          contest={{
            slug: opening.slug,
            title: opening.title,
            categoryLabel: opening.categoryLabel,
            reward: opening.reward,
            fee: opening.fee,
            deadline: opening.deadline,
          }}
          savedChildren={children}
        />
      ) : null}
    </div>
  );
}

function PanelLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={
        active
          ? "font-label-lg text-label-lg rounded-lg bg-primary-container px-space-lg py-3 text-center font-bold text-on-primary"
          : "font-label-lg text-label-lg rounded-lg bg-surface-container-lowest px-space-lg py-3 text-center font-bold text-primary shadow-sm transition-colors hover:bg-surface-container"
      }
    >
      {children}
    </Link>
  );
}

function Notice({ title, body }: { title: string; body: string }) {
  return (
    <section className="w-full bg-surface-container-low py-space-xl">
      <div className="mx-auto max-w-xl px-margin-mobile md:px-margin">
        <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
          <h1 className="font-headline-md text-headline-md text-primary">{title}</h1>
          <p className="font-body-md text-body-md mt-2 text-on-surface-variant">{body}</p>
        </div>
      </div>
    </section>
  );
}

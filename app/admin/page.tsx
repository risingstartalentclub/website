import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { AdminDesk } from "@/components/admin-desk";
import type { ContestEntryRow } from "@/components/admin-winners";
import { contests as fallbackContests } from "@/lib/content";
import { contestColumns, contestColumnsLegacy, contestFromRow, type ContestRow } from "@/lib/get-contests";
import {
  adminSection,
  adminSections,
  type AdminCounts,
  type AdminEnquiry,
  type AdminPerson,
} from "@/lib/admin-path";
import { getSiteImages } from "@/lib/get-site-images";
import { isSupabaseConfigured, supabaseSetupMessage } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

const emptyCounts: AdminCounts = {
  admins: 0,
  participants: 0,
  contests: 0,
  openContests: 0,
  heroTitle: null,
};

function joinedLabel(value: string, withTime = false) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime
      ? { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" }
      : {}),
  }).format(date);
}

function peopleFromRows(rows: unknown, withTime = false): AdminPerson[] {
  if (!Array.isArray(rows)) return [];
  return rows.flatMap((row) => {
    if (!row || typeof row !== "object") return [];
    const record = row as Record<string, unknown>;
    if (typeof record.id !== "string") return [];
    return [
      {
        id: record.id,
        name: typeof record.full_name === "string" && record.full_name.trim() ? record.full_name : "Unnamed",
        email: typeof record.email === "string" ? record.email : "",
        phone: typeof record.phone === "string" ? record.phone : "",
        city: typeof record.city === "string" ? record.city : "",
        state: typeof record.state === "string" ? record.state : "",
        joined: typeof record.created_at === "string" ? joinedLabel(record.created_at, withTime) : "—",
      },
    ];
  });
}

function enquiriesFromRows(rows: unknown): AdminEnquiry[] {
  if (!Array.isArray(rows)) return [];
  return rows.flatMap((row) => {
    if (!row || typeof row !== "object") return [];
    const record = row as Record<string, unknown>;
    if (typeof record.id !== "string" || typeof record.name !== "string" || typeof record.email !== "string") {
      return [];
    }
    return [
      {
        id: record.id,
        name: record.name,
        email: record.email,
        message: typeof record.message === "string" ? record.message : "",
        received: typeof record.created_at === "string" ? joinedLabel(record.created_at) : "—",
      },
    ];
  });
}

function entriesFromRows(rows: unknown): ContestEntryRow[] {
  if (!Array.isArray(rows)) return [];
  return rows.flatMap((row) => {
    if (!row || typeof row !== "object") return [];
    const record = row as Record<string, unknown>;
    if (typeof record.id !== "string" || typeof record.contest_slug !== "string") return [];
    const child = record.participants;
    const related = Array.isArray(child) ? child[0] : child;
    const profile =
      related && typeof related === "object" ? (related as Record<string, unknown>) : null;
    const name =
      typeof profile?.full_name === "string" && profile.full_name.trim()
        ? profile.full_name
        : typeof record.participant_name === "string"
          ? record.participant_name
          : "Participant";
    return [
      {
        id: record.id,
        contestSlug: record.contest_slug,
        name,
        age: typeof profile?.age === "number" ? profile.age : null,
        gender: profile?.gender === "boy" || profile?.gender === "girl" ? profile.gender : null,
        instagramUrl: typeof profile?.instagram_url === "string" ? profile.instagram_url : null,
        winner: record.is_winner === true,
      },
    ];
  });
}

function announcedFromRows(rows: unknown): string[] {
  if (!Array.isArray(rows)) return [];
  return rows.flatMap((row) => {
    if (!row || typeof row !== "object") return [];
    const record = row as Record<string, unknown>;
    if (record.results_announced === true && typeof record.slug === "string") return [record.slug];
    return [];
  });
}

function countsFromRow(row: unknown): AdminCounts {
  if (!row || typeof row !== "object") return emptyCounts;
  const record = row as Record<string, unknown>;
  const number = (key: string) => (typeof record[key] === "number" ? record[key] : 0);
  return {
    admins: number("admin_count"),
    participants: number("participant_count"),
    contests: number("contest_count"),
    openContests: number("open_contest_count"),
    heroTitle: typeof record.hero_title === "string" && record.hero_title ? record.hero_title : null,
  };
}

function contestQuery(value: string | undefined) {
  if (!value || !/^[a-z0-9-]{1,80}$/i.test(value)) return null;
  return value;
}

async function AdminGate({
  section,
  contest,
}: {
  section: string | undefined;
  contest: string | undefined;
}) {
  if (!isSupabaseConfigured()) {
    return (
      <div className="flex h-dvh items-center justify-center bg-surface px-4">
        <p className="font-body-md text-body-md max-w-lg text-on-surface-variant">{supabaseSetupMessage}</p>
      </div>
    );
  }

  const current = adminSection(section);
  const needsContests = current === "contests";
  const needsPeople = current === "admins" || current === "users";
  const needsEnquiries = current === "enquiries";
  const needsCounts = current === "dashboard";
  const supabase = await createClient("admin");
  const [viewer, images, contestResult, peopleResult, countsResult, entryResult, announcedResult, enquiryResult] =
    await Promise.all([
      getViewer("admin"),
      getSiteImages(),
      needsContests
        ? supabase.from("contests").select(contestColumns).order("sort_order", { ascending: true })
        : Promise.resolve(null),
      needsPeople
        ? supabase.rpc("admin_list_profiles", {
            requested_role: current === "admins" ? "admin" : "parent",
          })
        : Promise.resolve(null),
      needsCounts ? supabase.rpc("admin_account_counts") : Promise.resolve(null),
      needsContests
        ? supabase
            .from("entries")
            .select(
              "id, contest_slug, participant_name, is_winner, participants(full_name, age, gender, instagram_url)",
            )
            .order("created_at", { ascending: true })
        : Promise.resolve(null),
      needsContests ? supabase.from("contests").select("slug, results_announced") : Promise.resolve(null),
      needsEnquiries
        ? supabase
            .from("contact_messages")
            .select("id, name, email, message, created_at")
            .order("created_at", { ascending: false })
            .limit(200)
        : Promise.resolve(null),
    ]);

  if (!viewer.signedIn) redirect("/admin/login");
  if (!viewer.isAdmin) notFound();

  let contestsResult = contestResult;
  if (needsContests && contestsResult?.error?.code === "42703") {
    contestsResult = (await supabase
      .from("contests")
      .select(contestColumnsLegacy)
      .order("sort_order", { ascending: true })) as typeof contestsResult;
  }

  const countRow = Array.isArray(countsResult?.data) ? countsResult.data[0] : countsResult?.data;

  return (
    <AdminDesk
      section={current}
      logo={images.logo}
      viewerName={viewer.name}
      contestsReady={!contestsResult?.error}
      contests={
        contestsResult?.error
          ? fallbackContests
          : (contestsResult?.data ?? []).map((row) => contestFromRow(row as ContestRow))
      }
      entriesReady={!entryResult?.error}
      entries={entriesFromRows(entryResult?.data)}
      announcedSlugs={announcedResult?.error ? [] : announcedFromRows(announcedResult?.data)}
      contestSlug={current === "contests" ? contestQuery(contest) : null}
      peopleReady={!peopleResult?.error}
      people={peopleFromRows(peopleResult?.data, current === "users")}
      enquiriesReady={!enquiryResult?.error}
      enquiries={enquiriesFromRows(enquiryResult?.data)}
      countsReady={!countsResult?.error}
      counts={countsResult?.error ? emptyCounts : countsFromRow(countRow)}
    />
  );
}

function DeskFrame() {
  return (
    <div className="min-h-dvh bg-surface md:pl-64">
      <aside className="fixed inset-y-0 left-0 z-40 hidden h-dvh w-64 flex-col bg-primary-container text-on-primary md:flex">
        <div className="px-4 py-6">
          <p className="font-label-sm text-label-sm tracking-widest text-tertiary-fixed uppercase">Rising Star</p>
          <p className="font-headline-sm text-headline-sm">Admin</p>
        </div>
        <nav className="flex flex-col gap-1 px-3">
          {adminSections.map((item) => (
            <span key={item.id} className="font-label-md text-label-md rounded-lg px-3 py-2 text-on-primary/80">
              {item.label}
            </span>
          ))}
        </nav>
      </aside>
    </div>
  );
}

export default function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string; contest?: string }>;
}) {
  return (
    <Suspense fallback={<DeskFrame />}>
      <AdminLoader searchParams={searchParams} />
    </Suspense>
  );
}

async function AdminLoader({
  searchParams,
}: {
  searchParams: Promise<{ section?: string; contest?: string }>;
}) {
  const { section, contest } = await searchParams;
  return <AdminGate section={section} contest={contest} />;
}

import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { AdminDesk } from "@/components/admin-desk";
import { contests as fallbackContests } from "@/lib/content";
import { contestColumns, contestFromRow, type ContestRow } from "@/lib/get-contests";
import {
  adminSection,
  adminSections,
  type AdminCounts,
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

function joinedLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function peopleFromRows(rows: unknown): AdminPerson[] {
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
        joined: typeof record.created_at === "string" ? joinedLabel(record.created_at) : "—",
      },
    ];
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

async function AdminGate({ section }: { section: string | undefined }) {
  if (!isSupabaseConfigured()) {
    return (
      <div className="flex h-dvh items-center justify-center bg-surface px-4">
        <p className="font-body-md text-body-md max-w-lg text-on-surface-variant">{supabaseSetupMessage}</p>
      </div>
    );
  }

  const viewer = await getViewer("admin");
  if (!viewer.signedIn) redirect("/admin/login");
  if (!viewer.isAdmin) notFound();

  const current = adminSection(section);
  const supabase = await createClient("admin");
  const images = await getSiteImages();
  const needsContests = current === "contests";
  const needsPeople = current === "admins" || current === "users";
  const needsCounts = current === "dashboard";
  const [contestResult, peopleResult, countsResult] = await Promise.all([
    needsContests
      ? supabase.from("contests").select(contestColumns).order("sort_order", { ascending: true })
      : Promise.resolve(null),
    needsPeople
      ? supabase.rpc("admin_list_profiles", {
          requested_role: current === "admins" ? "admin" : "participant",
        })
      : Promise.resolve(null),
    needsCounts ? supabase.rpc("admin_account_counts") : Promise.resolve(null),
  ]);

  const countRow = Array.isArray(countsResult?.data) ? countsResult.data[0] : countsResult?.data;

  return (
    <AdminDesk
      section={current}
      logo={images.logo}
      viewerName={viewer.name}
      contestsReady={!contestResult?.error}
      contests={
        contestResult?.error
          ? fallbackContests
          : (contestResult?.data ?? []).map((row) => contestFromRow(row as ContestRow))
      }
      peopleReady={!peopleResult?.error}
      people={peopleFromRows(peopleResult?.data)}
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
  searchParams: Promise<{ section?: string }>;
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
  searchParams: Promise<{ section?: string }>;
}) {
  const { section } = await searchParams;
  return <AdminGate section={section} />;
}

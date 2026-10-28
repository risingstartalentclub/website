import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { AdminDesk } from "@/components/admin-desk";
import { contests as fallbackContests } from "@/lib/content";
import { contestColumns, contestFromRow, type ContestRow } from "@/lib/get-contests";
import { adminSection, adminSections } from "@/lib/admin-path";
import { getSiteImages } from "@/lib/get-site-images";
import { siteImageSlots, type SiteImages } from "@/lib/site-images";
import { isSupabaseConfigured, supabaseSetupMessage } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

function localImages(): SiteImages {
  return Object.fromEntries(siteImageSlots.map((slot) => [slot.key, slot.fallback])) as SiteImages;
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
  if (!viewer.isAdmin) {
    notFound();
  }

  const current = adminSection(section);
  const needsImages = current === "home";
  const needsReels = current === "winners";
  const needsContests = current === "competitions";
  const supabase = needsReels || needsContests ? await createClient("admin") : null;
  const [images, reelResult, contestResult] = await Promise.all([
    needsImages ? getSiteImages() : Promise.resolve(localImages()),
    needsReels && supabase
      ? supabase
          .from("winner_reels")
          .select("id, title, video_url, slot")
          .eq("visible", true)
          .order("slot", { ascending: true })
      : Promise.resolve(null),
    needsContests && supabase
      ? supabase.from("contests").select(contestColumns).order("sort_order", { ascending: true })
      : Promise.resolve(null),
  ]);

  return (
    <AdminDesk
      section={current}
      images={images}
      reelsReady={!reelResult?.error}
      contestsReady={!contestResult?.error}
      contests={
        contestResult?.error
          ? fallbackContests
          : (contestResult?.data ?? []).map((row) => contestFromRow(row as ContestRow))
      }
      reels={(reelResult?.data ?? []).flatMap((row) => {
        const slot = Number(row.slot);
        if (!Number.isInteger(slot) || slot < 1 || typeof row.video_url !== "string") return [];
        return [
          {
            slot,
            title: typeof row.title === "string" ? row.title : "",
            videoUrl: row.video_url,
          },
        ];
      })}
    />
  );
}

function DeskFrame() {
  return (
    <div className="min-h-dvh bg-surface md:pl-60">
      <aside className="fixed inset-y-0 left-0 z-40 hidden h-dvh w-60 flex-col bg-primary-container text-on-primary md:flex">
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

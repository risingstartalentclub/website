"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link, { useLinkStatus } from "next/link";
import { AdminContests } from "@/components/admin-contests";
import { AdminImages } from "@/components/admin-images";
import { BusyScreen } from "@/components/busy-screen";
import { LogoutButton } from "@/components/logout-button";
import { adminPath, adminSections, type AdminSectionId } from "@/lib/admin-path";
import type { Contest } from "@/lib/content";
import type { SiteImageKey, SiteImages } from "@/lib/site-images";

const AdminReels = dynamic(() =>
  import("@/components/admin-reels").then((mod) => mod.AdminReels),
);

const imageKeys: Partial<Record<AdminSectionId, SiteImageKey[]>> = {
  home: ["logo", "hero-stage", "hero-thumb"],
};

const sectionCopy: Record<AdminSectionId, { title: string; body: string }> = {
  home: {
    title: "Home",
    body: "Replace the club logo and the two homepage photos.",
  },
  competitions: {
    title: "Competitions",
    body: "Change any contest card, or add a new one. Saved cards show on the website.",
  },
  winners: {
    title: "Winners",
    body: "Add a reel card, replace a reel link, or delete a card. Changes show in Meet Our Rising Stars.",
  },
};

function NavPending({ onPending }: { onPending: (pending: boolean) => void }) {
  const { pending } = useLinkStatus();

  useEffect(() => {
    onPending(pending);
  }, [onPending, pending]);

  return null;
}

function navClass(active: boolean) {
  return active
    ? "font-label-md text-label-md rounded-lg bg-surface px-3 py-2 font-bold text-primary"
    : "font-label-md text-label-md rounded-lg px-3 py-2 text-on-primary/80 hover:bg-on-primary/10";
}

export function AdminDesk({
  section,
  images,
  reels,
  reelsReady,
  contests,
  contestsReady,
}: {
  section: AdminSectionId;
  images: SiteImages;
  reels: { slot: number; title: string; videoUrl: string }[];
  reelsReady: boolean;
  contests: Contest[];
  contestsReady: boolean;
}) {
  const copy = sectionCopy[section];
  const keys = imageKeys[section];
  const [draftSlots, setDraftSlots] = useState<number[]>([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const onMenuPending = useCallback((pending: boolean) => {
    setMenuLoading(pending);
  }, []);

  function addCard() {
    setDraftSlots((current) => {
      const used = new Set([...reels.map((reel) => reel.slot), ...current]);
      let next = 1;
      while (used.has(next)) next += 1;
      return [...current, next];
    });
  }

  return (
    <div className="min-h-dvh bg-surface md:pl-60">
      <aside className="fixed inset-y-0 left-0 z-40 hidden h-dvh w-60 flex-col bg-primary-container text-on-primary md:flex">
        <div className="px-4 py-6">
          <p className="font-label-sm text-label-sm tracking-widest text-tertiary-fixed uppercase">
            Rising Star
          </p>
          <p className="font-headline-sm text-headline-sm">Admin</p>
        </div>
        <nav className="flex flex-col gap-1 px-3">
          {adminSections.map((item) => (
            <Link
              key={item.id}
              href={`${adminPath}?section=${item.id}`}
              aria-current={section === item.id ? "page" : undefined}
              className={navClass(section === item.id)}
            >
              {item.label}
              <NavPending onPending={onMenuPending} />
            </Link>
          ))}
        </nav>
        <div className="mt-auto p-3">
          <LogoutButton
            scope="admin"
            className="font-label-md text-label-md w-full rounded-lg px-3 py-2 text-left text-on-primary/80 hover:bg-on-primary/10"
          >
            Log out
          </LogoutButton>
        </div>
      </aside>

      <div className="min-w-0">
        <div className="sticky top-0 z-30 flex items-center gap-2 overflow-x-auto border-b border-surface-variant bg-surface px-3 py-3 md:hidden">
          {adminSections.map((item) => (
            <Link
              key={item.id}
              href={`${adminPath}?section=${item.id}`}
              aria-current={section === item.id ? "page" : undefined}
              className={
                section === item.id
                  ? "font-label-md text-label-md shrink-0 rounded-lg bg-primary-container px-3 py-2 font-bold text-on-primary"
                  : "font-label-md text-label-md shrink-0 rounded-lg bg-surface-container px-3 py-2 text-primary"
              }
            >
              {item.label}
              <NavPending onPending={onMenuPending} />
            </Link>
          ))}
          <LogoutButton scope="admin" className="font-label-md text-label-md shrink-0 px-3 py-2 text-secondary">
            Log out
          </LogoutButton>
        </div>

        <div className="mx-auto flex w-full max-w-7xl flex-col gap-space-md px-4 py-6 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-headline-xl text-headline-xl-mobile text-primary md:text-headline-xl">
                {copy.title}
              </h1>
              <p className="font-body-md text-body-md mt-space-sm text-on-surface-variant">{copy.body}</p>
            </div>
            {section === "winners" ? (
              <button
                type="button"
                onClick={addCard}
                className="font-label-lg text-label-lg mt-1 shrink-0 rounded-lg bg-primary-container px-space-lg py-3 font-bold text-on-primary shadow-md transition-colors hover:bg-secondary"
              >
                Add card
              </button>
            ) : null}
          </div>
          {keys ? <AdminImages images={images} keys={keys} /> : null}
          {section === "competitions" ? (
            <AdminContests contests={contests} ready={contestsReady} />
          ) : null}
          {section === "winners" ? (
            <>
              {reelsReady ? null : (
                <p className="font-body-md text-body-md text-error">
                  Run supabase/3-winner-reels.sql once in the Supabase SQL editor, then open this section again.
                </p>
              )}
              <AdminReels
                reels={reels}
                draftSlots={draftSlots}
                onRemoveDraft={(slot) => setDraftSlots((current) => current.filter((item) => item !== slot))}
              />
            </>
          ) : null}
        </div>
      </div>
      {menuLoading ? <BusyScreen label="Loading..." /> : null}
    </div>
  );
}

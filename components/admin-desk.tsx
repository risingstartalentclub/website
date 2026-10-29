"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link, { useLinkStatus } from "next/link";
import { AdminContests } from "@/components/admin-contests";
import type { ContestEntryRow } from "@/components/admin-winners";
import { AdminDashboard } from "@/components/admin-dashboard";
import { AdminPeople } from "@/components/admin-people";
import { BusyScreen } from "@/components/busy-screen";
import { LogoutButton } from "@/components/logout-button";
import {
  adminPath,
  adminSections,
  type AdminCounts,
  type AdminPerson,
  type AdminSectionId,
} from "@/lib/admin-path";
import type { Contest } from "@/lib/content";

const sectionCopy: Record<AdminSectionId, { title: string; body: string }> = {
  dashboard: {
    title: "Dashboard",
    body: "Contests, staff accounts, and families registered on the website.",
  },
  contests: {
    title: "Contests",
    body: "Review contests in the table. Add a new contest from the button, or edit one from its row.",
  },
  admins: {
    title: "Admin List",
    body: "Staff accounts that can sign in to this desk. Add another admin from this page.",
  },
  users: {
    title: "Parent List",
    body: "Parents who created an account on the website.",
  },
};

function NavPending({ onPending }: { onPending: (pending: boolean) => void }) {
  const { pending } = useLinkStatus();

  useEffect(() => {
    onPending(pending);
  }, [onPending, pending]);

  return null;
}

function MenuIcon({
  name,
  className = "h-5 w-5",
}: {
  name: AdminSectionId | "logout";
  className?: string;
}) {
  const paths: Record<AdminSectionId | "logout", ReactNode> = {
    dashboard: (
      <>
        <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
        <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
        <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
      </>
    ),
    contests: (
      <>
        <path d="M8 20h8" />
        <path d="M12 16v4" />
        <path d="M7.5 4h9v5.2a4.5 4.5 0 0 1-9 0V4z" />
        <path d="M7.5 6H5a2.8 2.8 0 0 0 2.6 3.2" />
        <path d="M16.5 6H19a2.8 2.8 0 0 1-2.6 3.2" />
      </>
    ),
    admins: <path d="M12 3.5 18.5 6v5.2c0 4-2.6 6.7-6.5 8.3-3.9-1.6-6.5-4.3-6.5-8.3V6L12 3.5z" />,
    users: (
      <>
        <circle cx="9" cy="8" r="2.6" />
        <circle cx="16.2" cy="9" r="2.1" />
        <path d="M3.8 18.5c.5-2.6 2.6-4.2 5.2-4.2s4.7 1.6 5.2 4.2" />
        <path d="M14.2 14.4c1.6.2 3 .9 3.8 2.4" />
      </>
    ),
    logout: (
      <>
        <path d="M9 6.5H6.5A1.5 1.5 0 0 0 5 8v8a1.5 1.5 0 0 0 1.5 1.5H9" />
        <path d="M12 16.5 16.5 12 12 7.5" />
        <path d="M16.2 12H9" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`${className} shrink-0`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

function navClass(active: boolean) {
  return active
    ? "font-label-md text-label-md flex min-w-0 items-center gap-2.5 rounded-lg bg-surface px-3 py-2.5 font-bold text-primary"
    : "font-label-md text-label-md flex min-w-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-on-primary/80 hover:bg-on-primary/10";
}

export function AdminDesk({
  section,
  logo,
  viewerName,
  contests,
  contestsReady,
  entries,
  entriesReady,
  announcedSlugs,
  people,
  peopleReady,
  counts,
  countsReady,
}: {
  section: AdminSectionId;
  logo: string;
  viewerName: string | null;
  contests: Contest[];
  contestsReady: boolean;
  entries: ContestEntryRow[];
  entriesReady: boolean;
  announcedSlugs: string[];
  people: AdminPerson[];
  peopleReady: boolean;
  counts: AdminCounts;
  countsReady: boolean;
}) {
  const copy = sectionCopy[section];
  const [menuLoading, setMenuLoading] = useState(false);
  const onMenuPending = useCallback((pending: boolean) => {
    setMenuLoading(pending);
  }, []);

  return (
    <div className="min-h-dvh bg-surface md:pl-64">
      <aside className="fixed inset-y-0 left-0 z-40 hidden h-dvh w-64 flex-col overflow-hidden bg-primary-container text-on-primary md:flex">
        <div className="border-b border-on-primary/10 px-4 py-5">
          <div className="flex items-center gap-3">
            {logo ? (
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-surface">
                <img alt="" src={logo} className="h-9 w-9 object-contain" style={{ mixBlendMode: "multiply" }} />
              </span>
            ) : null}
            <div>
              <p className="font-label-sm text-label-sm tracking-widest text-tertiary-fixed uppercase">Rising Star</p>
              <p className="font-headline-sm text-headline-sm">Admin</p>
            </div>
          </div>
          {viewerName ? (
            <p className="font-body-sm text-body-sm mt-3 truncate text-on-primary/70">{viewerName}</p>
          ) : null}
        </div>
        <nav className="flex flex-col gap-1 px-3 py-4">
          {adminSections.map((item) => (
            <Link
              key={item.id}
              href={`${adminPath}?section=${item.id}`}
              aria-current={section === item.id ? "page" : undefined}
              className={navClass(section === item.id)}
            >
              <MenuIcon name={item.id} />
              <span className="truncate">{item.label}</span>
              <NavPending onPending={onMenuPending} />
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-on-primary/10 p-3">
          <LogoutButton
            scope="admin"
            className="font-label-md text-label-md flex w-full min-w-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-on-primary/80 hover:bg-on-primary/10"
          >
            <MenuIcon name="logout" />
            <span className="truncate">Log out</span>
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
                  ? "font-label-md text-label-md flex shrink-0 items-center gap-1.5 rounded-lg bg-primary-container px-3 py-2 font-bold text-on-primary"
                  : "font-label-md text-label-md flex shrink-0 items-center gap-1.5 rounded-lg bg-surface-container px-3 py-2 text-primary"
              }
            >
              <MenuIcon name={item.id} className="h-4 w-4" />
              <span>{item.label}</span>
              <NavPending onPending={onMenuPending} />
            </Link>
          ))}
          <LogoutButton scope="admin" className="font-label-md text-label-md shrink-0 px-3 py-2 text-secondary">
            Log out
          </LogoutButton>
        </div>

        <div className="mx-auto flex w-full max-w-7xl flex-col gap-space-md px-4 py-6 sm:px-6">
          <div>
            <h1 className="font-headline-xl text-headline-xl-mobile text-primary md:text-headline-xl">{copy.title}</h1>
            <p className="font-body-md text-body-md mt-space-sm text-on-surface-variant">{copy.body}</p>
          </div>
          {section === "dashboard" ? (
            <AdminDashboard counts={counts} ready={countsReady} name={viewerName} />
          ) : null}
          {section === "contests" ? (
            <AdminContests
              contests={contests}
              ready={contestsReady}
              entries={entries}
              entriesReady={entriesReady}
              announcedSlugs={announcedSlugs}
            />
          ) : null}
          {section === "admins" ? (
            <AdminPeople people={people} ready={peopleReady} emptyLabel="No admin accounts yet." kind="admin" />
          ) : null}
          {section === "users" ? (
            <AdminPeople people={people} ready={peopleReady} emptyLabel="No parents yet." />
          ) : null}
        </div>
      </div>
      {menuLoading ? <BusyScreen label="Loading..." /> : null}
    </div>
  );
}

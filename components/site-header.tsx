"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AuthDialog } from "@/components/auth-dialog";
import { navLinks } from "@/lib/content";

export function SiteHeader({
  logo,
  signedIn,
  isAdmin,
}: {
  logo: string;
  signedIn: boolean;
  isAdmin: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [menuPath, setMenuPath] = useState(pathname);
  const [authMode, setAuthMode] = useState<"login" | "signup" | null>(null);

  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setOpen(false);
  }

  function active(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <header className="fixed top-0 z-50 w-full border-b border-surface-variant bg-surface shadow-[0_1px_8px_rgba(20,43,74,0.06)]">
      <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <img
            alt="Rising Star Talent Club Logo"
            className="h-10 w-auto object-contain"
            src={logo}
            style={{ mixBlendMode: "multiply", filter: "contrast(1.05)" }}
          />
          <span className="font-headline-sm text-headline-sm hidden tracking-tight text-primary xl:inline-block">
            Rising Star Talent Club
          </span>
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-center lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active(link.href) ? "page" : undefined}
              className={
                active(link.href)
                  ? "font-label-md text-label-md whitespace-nowrap rounded-lg bg-surface-container px-2.5 py-2 font-bold text-primary"
                  : "font-label-md text-label-md whitespace-nowrap rounded-lg px-2.5 py-2 text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {signedIn ? (
            <>
              {isAdmin ? (
                <Link
                  href="/admin"
                  aria-current={pathname.startsWith("/admin") ? "page" : undefined}
                  className="font-label-md text-label-md hidden rounded-lg bg-primary-container px-3 py-2 font-bold text-on-primary lg:inline"
                >
                  Admin
                </Link>
              ) : null}
              <Link
                href="/profile"
                aria-label="Your account"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-container text-on-primary"
              >
                <span className="material-symbols-outlined text-[18px]">person</span>
              </Link>
            </>
          ) : (
            <button
              type="button"
              className="font-label-lg text-label-lg rounded-lg bg-primary-container px-space-md py-space-sm text-on-primary transition-colors hover:bg-secondary"
              onClick={() => setAuthMode("login")}
            >
              Log In
            </button>
          )}
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container text-primary lg:hidden"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="material-symbols-outlined text-[22px]">
              {open ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {open ? (
        <nav className="border-t border-surface-variant bg-surface-container-lowest px-margin-mobile py-space-md lg:hidden">
          <div className="mx-auto flex max-w-[1280px] flex-col gap-space-sm">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  active(link.href)
                    ? "font-label-lg text-label-lg font-bold text-primary"
                    : "font-label-lg text-label-lg text-on-surface-variant"
                }
              >
                {link.label}
              </Link>
            ))}
            {signedIn ? (
              <Link href="/profile" className="font-label-lg text-label-lg text-primary">
                Your account
              </Link>
            ) : null}
            {signedIn && isAdmin ? (
              <Link href="/admin" className="font-label-lg text-label-lg text-primary">
                Admin
              </Link>
            ) : null}
          </div>
        </nav>
      ) : null}
      {authMode ? (
        <AuthDialog
          mode={authMode}
          onClose={() => setAuthMode(null)}
          onMode={setAuthMode}
        />
      ) : null}
    </header>
  );
}

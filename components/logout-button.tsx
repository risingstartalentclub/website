"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { signOut } from "@/app/actions/auth";
import { Icon } from "@/components/icon";

export function LogoutButton({
  className,
  children,
}: {
  className?: string;
  children: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {children}
      </button>
      {open
        ? createPortal(
            <div
              className="fixed inset-0 z-[90] flex items-center justify-center bg-primary/60 p-4 backdrop-blur-sm"
              role="dialog"
              aria-modal="true"
              aria-labelledby="logout-dialog-title"
            >
              <div className="relative w-full max-w-sm rounded-xl bg-surface-container-lowest p-space-lg shadow-2xl">
                <button
                  type="button"
                  aria-label="Close"
                  className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-surface-container text-primary"
                  onClick={() => setOpen(false)}
                >
                  <Icon name="close" className="text-[20px]" />
                </button>
                <h2 id="logout-dialog-title" className="font-headline-md text-headline-md pr-8 text-primary">
                  Log out?
                </h2>
                <p className="font-body-md text-body-md mt-space-sm text-on-surface-variant">
                  You will be signed out of this account.
                </p>
                <div className="mt-space-lg flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    className="font-label-lg text-label-lg flex-1 rounded-lg bg-surface-container px-4 py-3 text-primary"
                    onClick={() => setOpen(false)}
                  >
                    Stay signed in
                  </button>
                  <form action={signOut} className="flex-1">
                    <button
                      type="submit"
                      className="font-label-lg text-label-lg w-full rounded-lg bg-primary-container px-4 py-3 font-bold text-on-primary"
                    >
                      Log out
                    </button>
                  </form>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useFormStatus } from "react-dom";
import { signOut } from "@/app/actions/auth";
import { BusyScreen } from "@/components/busy-screen";
import { Icon } from "@/components/icon";

function LogoutActions({
  onStay,
  onPending,
}: {
  onStay: () => void;
  onPending: (pending: boolean) => void;
}) {
  const { pending } = useFormStatus();

  useEffect(() => {
    onPending(pending);
  }, [onPending, pending]);

  return (
    <>
      <div className="mt-space-lg flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          disabled={pending}
          className="font-label-lg text-label-lg flex-1 rounded-lg bg-surface-container px-4 py-3 text-primary disabled:opacity-70"
          onClick={onStay}
        >
          Stay signed in
        </button>
        <button
          type="submit"
          disabled={pending}
          className="font-label-lg text-label-lg flex-1 rounded-lg bg-primary-container px-4 py-3 font-bold text-on-primary disabled:opacity-70"
        >
          Log out
        </button>
      </div>
      {pending ? <BusyScreen label="Logging out..." /> : null}
    </>
  );
}

export function LogoutButton({
  className,
  children,
  scope = "public",
}: {
  className?: string;
  children: ReactNode;
  scope?: "public" | "admin";
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const onPending = useCallback((value: boolean) => {
    setPending(value);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, pending]);

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
                  disabled={pending}
                  className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-surface-container text-primary disabled:opacity-70"
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
                <form action={signOut}>
                  {scope === "admin" ? <input type="hidden" name="scope" value="admin" /> : null}
                  <LogoutActions onStay={() => setOpen(false)} onPending={onPending} />
                </form>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

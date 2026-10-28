"use client";

import { AuthForm } from "@/components/auth-form";
import { Icon } from "@/components/icon";

export function AuthCard({
  mode,
  nextPath,
}: {
  mode: "login" | "signup";
  nextPath?: string;
}) {
  const isSignup = mode === "signup";

  return (
    <section className="w-full bg-surface-container-low py-space-xl">
      <div className="mx-auto grid max-w-[1280px] items-center gap-gutter px-margin-mobile md:px-margin lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-xl bg-primary-container p-space-xl text-on-primary">
          <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 rounded-full bg-secondary/30 blur-3xl" />
          <div className="relative z-10 flex flex-col gap-space-md">
            <div className="font-label-sm text-label-sm inline-flex items-center gap-space-xs self-start rounded-full bg-primary/60 px-3 py-1 text-tertiary-fixed">
              <Icon name="stars" className="text-[16px]" />
              Autumn & Festive Season 2026
            </div>
            <h1 className="font-headline-xl text-headline-xl-mobile md:text-headline-xl text-on-primary">
              {isSignup ? "Create your free account." : "Welcome back."}
            </h1>
            <p className="font-body-lg text-body-lg text-surface-container-highest">
              Join Rising Star Talent Club with parent or guardian guidance for
              younger participants. Entries stay free, and every contest is
              reviewed by a certified jury.
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-md">
          <AuthForm mode={mode} nextPath={nextPath} />
        </div>
      </div>
    </section>
  );
}

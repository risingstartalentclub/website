"use client";

import { AuthForm } from "@/components/auth-form";
import { assets } from "@/lib/content";

export function AuthCard({
  mode,
  nextPath,
  adminGate = false,
}: {
  mode: "login" | "signup";
  nextPath?: string;
  adminGate?: boolean;
}) {
  const isSignup = mode === "signup";

  return (
    <section className="grid min-h-[calc(100dvh-4rem)] bg-surface lg:grid-cols-2">
      <div className="flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <img
            alt="Rising Star Talent Club"
            src={assets.logo}
            className="mb-6 h-12 w-auto object-contain"
          />
          <AuthForm
            mode={mode}
            nextPath={nextPath}
            adminGate={adminGate}
            allowSignup={!adminGate}
          />
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-primary-container text-on-primary lg:block">
        <img
          alt=""
          src={assets.heroStage}
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-primary-container/80" />
        <div className="relative flex h-full items-center px-12 xl:px-16">
          <div className="max-w-lg">
            <p className="font-label-sm text-label-sm tracking-widest text-tertiary-fixed uppercase">
              Rising Star Talent Club
            </p>
            <h1 className="font-headline-xl text-headline-xl mt-4 text-on-primary">
              {isSignup ? "Create your free account." : "Welcome back."}
            </h1>
            <p className="font-body-lg text-body-lg mt-4 text-surface-container-highest">
              Join with parent or guardian guidance for younger participants.
              Entries stay free, and every contest is reviewed by a certified jury.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

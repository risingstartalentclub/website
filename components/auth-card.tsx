"use client";

import { AuthForm } from "@/components/auth-form";
import { Icon } from "@/components/icon";
import { assets } from "@/lib/content";

const highlights = [
  { icon: "stars", title: "Free to join", body: "Contest entries stay free." },
  { icon: "family_restroom", title: "Parent guided", body: "A grown-up opens the account." },
  { icon: "verified", title: "Fair jury", body: "A certified panel reviews each entry." },
];

function Spark({ className }: { className: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 1.8 14.2 8l6.4.4-4.9 4.1 1.6 6.2L12 15.6 6.7 18.7l1.6-6.2L3.4 8.4 9.8 8 12 1.8Z" />
    </svg>
  );
}

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
    <section className="relative min-h-[calc(100dvh-4rem)] overflow-hidden bg-gradient-to-b from-secondary-fixed/80 via-surface to-tertiary-fixed/45">
      <div className="pointer-events-none absolute -top-20 -left-16 h-64 w-64 rounded-full bg-tertiary-fixed blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-20 h-72 w-72 rounded-full bg-secondary-fixed blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-primary-fixed/80 blur-2xl" />
      <Spark className="pointer-events-none absolute top-6 left-[7%] h-8 w-8 rotate-12 text-tertiary-container" />
      <Spark className="pointer-events-none absolute top-16 right-[10%] h-5 w-5 -rotate-12 text-secondary" />
      <Spark className="pointer-events-none absolute bottom-10 left-[22%] hidden h-6 w-6 text-tertiary-container sm:block" />
      <Spark className="pointer-events-none absolute right-[28%] bottom-8 hidden h-4 w-4 text-secondary lg:block" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-5 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:gap-10 lg:py-12">
        <aside className="relative overflow-hidden rounded-[2rem] bg-primary-container px-6 py-6 text-on-primary shadow-xl lg:order-2 lg:px-10 lg:py-12">
          <div className="pointer-events-none absolute -top-10 -right-8 h-36 w-36 rounded-full bg-tertiary-fixed/25 blur-2xl" />
          <Spark className="pointer-events-none absolute top-5 right-6 h-7 w-7 text-tertiary-fixed" />
          <Spark className="pointer-events-none absolute bottom-6 left-6 hidden h-5 w-5 text-secondary-fixed lg:block" />
          <p className="font-label-sm text-label-sm relative tracking-[0.18em] text-tertiary-fixed uppercase">
            Rising Star Talent Club
          </p>
          <h1 className="font-headline-lg text-headline-lg relative mt-3 text-on-primary lg:text-headline-xl">
            {isSignup ? "A new star starts here." : "Welcome back, star family."}
          </h1>
          <p className="font-body-md text-body-md relative mt-3 max-w-md text-surface-container-highest">
            {isSignup
              ? "Parents and guardians can open a free account and help a young talent join the club."
              : "Pick up your family’s place in the club. Contests stay free, friendly, and reviewed by a certified jury."}
          </p>
          <ul className="relative mt-5 grid grid-cols-3 gap-2 lg:grid-cols-1 lg:gap-3">
            {highlights.map((item) => (
              <li
                key={item.title}
                className="rounded-2xl bg-on-primary/10 px-2 py-3 text-center lg:flex lg:items-center lg:gap-3 lg:px-4 lg:text-left"
              >
                <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-tertiary-fixed text-on-tertiary-fixed lg:mx-0">
                  <Icon name={item.icon} filled className="text-[18px]" />
                </span>
                <span className="mt-2 block lg:mt-0">
                  <span className="font-label-md text-label-md block font-bold text-tertiary-fixed">{item.title}</span>
                  <span className="font-body-sm text-body-sm mt-0.5 hidden text-on-primary/80 lg:block">{item.body}</span>
                </span>
              </li>
            ))}
          </ul>
        </aside>

        <div className="rounded-[2rem] bg-surface-container-lowest px-5 py-6 shadow-xl ring-4 ring-white/80 sm:px-8 sm:py-8 lg:order-1">
          <div className="mb-5 flex items-center gap-3">
            <img
              alt="Rising Star Talent Club"
              src={assets.logo}
              className="h-12 w-auto object-contain"
            />
            <span className="inline-flex items-center gap-1 rounded-full bg-tertiary-fixed px-3 py-1 font-label-sm text-label-sm font-bold text-on-tertiary-fixed">
              <Icon name="stars" filled className="text-[14px]" />
              Kids club
            </span>
          </div>
          <AuthForm
            mode={mode}
            nextPath={nextPath}
            adminGate={adminGate}
            allowSignup={!adminGate}
            headingClassName=""
            note={
              isSignup
                ? "Tell us about the parent or guardian, then pick a password."
                : "Use the email and password from your parent account."
            }
            playful
          />
        </div>
      </div>
    </section>
  );
}

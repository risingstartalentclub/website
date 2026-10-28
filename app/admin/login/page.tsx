import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { adminPath } from "@/lib/admin-path";
import { getSiteImages } from "@/lib/get-site-images";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

async function SignedInAdminRedirect() {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient("admin");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role === "admin") redirect(adminPath);
  return null;
}

function BrandMark({ logo }: { logo: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface shadow-lg">
        {logo ? (
          <img
            alt="Rising Star Talent Club"
            src={logo}
            className="h-12 w-12 object-contain"
            style={{ mixBlendMode: "multiply" }}
          />
        ) : (
          <span className="font-headline-sm text-headline-sm text-primary">RS</span>
        )}
      </span>
      <div>
        <p className="font-label-sm text-label-sm tracking-[0.22em] text-tertiary-fixed uppercase">Rising Star</p>
        <p className="font-headline-sm text-headline-sm text-on-primary">Talent Club</p>
      </div>
    </div>
  );
}

export default async function AdminLoginPage() {
  const images = await getSiteImages();

  return (
    <div className="min-h-dvh bg-primary lg:grid lg:grid-cols-2">
      <Suspense fallback={null}>
        <SignedInAdminRedirect />
      </Suspense>
      <section className="relative overflow-hidden bg-primary-container px-6 py-8 text-on-primary lg:flex lg:min-h-dvh lg:flex-col lg:justify-center lg:px-14 lg:py-10">
        <div className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-tertiary-fixed/25 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 -left-20 h-80 w-80 rounded-full bg-secondary/40 blur-3xl" />
        <div className="relative">
          <BrandMark logo={images.logo} />
        </div>
        <div className="relative mt-8 max-w-lg">
          <p className="font-label-sm text-label-sm tracking-[0.18em] text-tertiary-fixed uppercase">Staff desk</p>
          <h1 className="font-headline-xl text-headline-xl-mobile mt-3 text-on-primary md:text-headline-xl">
            Manage the club with a clear desk.
          </h1>
          <p className="font-body-md text-body-md mt-3 hidden max-w-md text-on-primary/80 lg:block">
            Contests, admin accounts, and website families stay in one place. The homepage features the single contest you mark.
          </p>
          <ul className="mt-6 hidden gap-2 lg:grid">
            {[
              ["Dashboard", "See contests, admins, and web users at a glance."],
              ["Contests", "Publish cards and choose the homepage contest."],
              ["People", "Review staff accounts and registered families."],
            ].map(([title, body]) => (
              <li key={title} className="rounded-xl border border-on-primary/10 bg-on-primary/5 px-4 py-3">
                <p className="font-label-md text-label-md font-bold text-tertiary-fixed">{title}</p>
                <p className="font-body-sm text-body-sm mt-1 text-on-primary/75">{body}</p>
              </li>
            ))}
          </ul>
        </div>
        <p className="font-label-sm text-label-sm relative mt-6 hidden tracking-wider text-on-primary/50 uppercase lg:block">
          Family friendly · Verified entries
        </p>
      </section>
      <section className="flex items-center justify-center bg-surface px-5 py-8 sm:px-10">
        <div className="w-full max-w-md rounded-2xl bg-surface-container-lowest p-6 shadow-xl sm:p-7">
          <p className="font-label-sm text-label-sm tracking-[0.18em] text-secondary uppercase">Admin sign in</p>
          <p className="font-body-sm text-body-sm mt-2 mb-6 text-on-surface-variant">
            Use the club admin email and password. Participant accounts stay on the public site.
          </p>
          <AuthForm
            mode="login"
            adminGate
            allowSignup={false}
            heading="Welcome back"
            headingClassName=""
            submitLabel="Sign in"
            titleId="admin-login-title"
          />
          <p className="font-body-sm text-body-sm mt-4 text-on-surface-variant">This page is only for club staff.</p>
        </div>
      </section>
    </div>
  );
}

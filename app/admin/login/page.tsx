import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { adminPath } from "@/lib/admin-path";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Admin log in",
  robots: { index: false, follow: false },
};

async function SignedInAdminRedirect() {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient("admin");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role === "admin") redirect(adminPath);
  return null;
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-primary-container px-5 py-10">
      <Suspense fallback={null}>
        <SignedInAdminRedirect />
      </Suspense>
      <div className="w-full max-w-md rounded-xl bg-surface-container-lowest p-8 shadow-md">
        <p className="font-label-sm text-label-sm tracking-widest text-secondary uppercase">
          Admin
        </p>
        <p className="font-body-sm text-body-sm mt-2 mb-6 text-on-surface-variant">
          This sign-in is only for the club admin account.
        </p>
        <AuthForm mode="login" adminGate allowSignup={false} heading="Admin sign in" titleId="admin-login-title" />
      </div>
    </div>
  );
}

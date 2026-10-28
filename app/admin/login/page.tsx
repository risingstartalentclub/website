import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth-card";
import { SiteFrame } from "@/components/site-frame";
import { adminPath } from "@/lib/admin-path";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Admin log in",
  robots: { index: false, follow: false },
};

async function SignedInAdminRedirect() {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
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
    <SiteFrame>
      <Suspense fallback={null}>
        <SignedInAdminRedirect />
      </Suspense>
      <AuthCard mode="login" adminGate />
    </SiteFrame>
  );
}

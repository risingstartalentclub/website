import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth-card";
import { SiteFrame } from "@/components/site-frame";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Sign Up" };

async function SignupGate() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      if (profile?.role !== "admin") redirect("/profile");
    }
  }
  return <AuthCard mode="signup" />;
}

export default function SignupPage() {
  return (
    <SiteFrame>
      <Suspense fallback={null}>
        <SignupGate />
      </Suspense>
    </SiteFrame>
  );
}

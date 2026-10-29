import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth-card";
import { SiteFrame } from "@/components/site-frame";
import { isAdminDestination } from "@/lib/admin-path";
import { parentPanelPath } from "@/lib/parent-panel";
import { safeNextPath } from "@/lib/safe-next";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Register" };

async function SignupGate({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const nextPath = safeNextPath((await searchParams).next);
  const destination = nextPath && !isAdminDestination(nextPath) ? nextPath : parentPanelPath;
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: parent } = await supabase.from("parents").select("id").eq("id", user.id).maybeSingle();
      if (parent) redirect(destination);
    }
  }
  return <AuthCard mode="signup" nextPath={nextPath ?? undefined} />;
}

export default function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  return (
    <SiteFrame>
      <Suspense fallback={null}>
        <SignupGate searchParams={searchParams} />
      </Suspense>
    </SiteFrame>
  );
}

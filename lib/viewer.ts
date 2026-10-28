import { cache } from "react";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { hasAuthSessionCookie, type AuthScope } from "@/lib/supabase/session-cookie";

export type Viewer = {
  signedIn: boolean;
  isAdmin: boolean;
  name: string | null;
  id: string | null;
};

const guest: Viewer = {
  signedIn: false,
  isAdmin: false,
  name: null,
  id: null,
};

export const getViewer = cache(async function getViewer(scope: AuthScope = "public"): Promise<Viewer> {
  if (!isSupabaseConfigured()) return guest;

  await connection();
  const cookieStore = await cookies();
  if (!hasAuthSessionCookie(cookieStore.getAll(), scope)) return guest;

  const supabase = await createClient(scope);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return guest;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  return {
    signedIn: true,
    isAdmin: profile?.role === "admin",
    name: profile?.full_name ?? null,
    id: user.id,
  };
});

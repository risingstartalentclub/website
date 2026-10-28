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

  if (scope === "admin") {
    const { data: admin } = await supabase.from("admins").select("email").eq("id", user.id).maybeSingle();
    if (!admin) return guest;
    const metaName = user.user_metadata?.full_name;
    return {
      signedIn: true,
      isAdmin: true,
      name:
        typeof metaName === "string" && metaName.trim()
          ? metaName.trim()
          : typeof admin.email === "string"
            ? admin.email
            : null,
      id: user.id,
    };
  }

  const { data: parent } = await supabase.from("parents").select("full_name").eq("id", user.id).maybeSingle();
  if (!parent) return guest;

  return {
    signedIn: true,
    isAdmin: false,
    name: parent.full_name ?? null,
    id: user.id,
  };
});

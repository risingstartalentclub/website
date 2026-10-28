import { isSupabaseConfigured, supabaseEnv } from "@/lib/supabase/env";

export type AuthScope = "public" | "admin";

export function authCookieName(scope: AuthScope = "public") {
  if (!isSupabaseConfigured()) return null;
  const { url } = supabaseEnv();
  const ref = new URL(url).hostname.split(".")[0];
  return scope === "admin" ? `sb-${ref}-admin-auth-token` : `sb-${ref}-auth-token`;
}

export function hasAuthSessionCookie(
  cookies: { name: string }[],
  scope: AuthScope = "public",
) {
  const name = authCookieName(scope);
  if (!name) return false;
  return cookies.some((cookie) => cookie.name === name || cookie.name.startsWith(`${name}.`));
}

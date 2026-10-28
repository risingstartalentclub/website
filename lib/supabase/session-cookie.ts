import { isSupabaseConfigured, supabaseEnv } from "@/lib/supabase/env";

export function authCookieName() {
  if (!isSupabaseConfigured()) return null;
  const { url } = supabaseEnv();
  const ref = new URL(url).hostname.split(".")[0];
  return `sb-${ref}-auth-token`;
}

export function hasAuthSessionCookie(cookies: { name: string }[]) {
  const name = authCookieName();
  if (!name) return false;
  return cookies.some((cookie) => cookie.name === name || cookie.name.startsWith(`${name}.`));
}

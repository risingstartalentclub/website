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

type StoredSession = {
  expires_at?: number;
  access_token?: string;
  user?: {
    email?: string;
    user_metadata?: { full_name?: string };
  };
};

function cookieValue(cookies: { name: string; value: string }[], name: string) {
  const direct = cookies.find((cookie) => cookie.name === name)?.value;
  if (direct) return direct;
  const chunks: string[] = [];
  for (let index = 0; ; index += 1) {
    const chunk = cookies.find((cookie) => cookie.name === `${name}.${index}`)?.value;
    if (!chunk) break;
    chunks.push(chunk);
  }
  return chunks.length > 0 ? chunks.join("") : null;
}

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  return Buffer.from(padded, "base64").toString("utf8");
}

function readSession(cookies: { name: string; value: string }[], scope: AuthScope) {
  const name = authCookieName(scope);
  if (!name) return null;
  const raw = cookieValue(cookies, name);
  if (!raw) return null;
  try {
    const json = raw.startsWith("base64-") ? decodeBase64Url(raw.slice("base64-".length)) : raw;
    const session = JSON.parse(json) as StoredSession;
    return session && typeof session === "object" ? session : null;
  } catch {
    return null;
  }
}

function accessTokenExpiry(session: StoredSession) {
  if (typeof session.expires_at === "number") return session.expires_at * 1000;
  const payload = session.access_token?.split(".")[1];
  if (!payload) return null;
  try {
    const claims = JSON.parse(decodeBase64Url(payload)) as { exp?: number };
    return typeof claims.exp === "number" ? claims.exp * 1000 : null;
  } catch {
    return null;
  }
}

/** True when the access token is still valid for at least a minute. No network call. */
export function accessTokenFresh(
  cookies: { name: string; value: string }[],
  scope: AuthScope,
  now = Date.now(),
) {
  const session = readSession(cookies, scope);
  if (!session) return false;
  const expiry = accessTokenExpiry(session);
  return expiry !== null && expiry > now + 60_000;
}

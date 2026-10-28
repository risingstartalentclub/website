import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured, supabaseEnv } from "@/lib/supabase/env";
import { authCookieName, hasAuthSessionCookie } from "@/lib/supabase/session-cookie";

function headersForRender(request: NextRequest) {
  const headers = new Headers(request.headers);
  // A hard refresh and Chrome's "Disable cache" send these. Next.js treats
  // them as an order to skip its dev cache and then shows "Cache disabled".
  headers.delete("cache-control");
  headers.delete("pragma");
  return headers;
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: headersForRender(request) },
  });
  if (!isSupabaseConfigured()) return response;

  const present = (["public", "admin"] as const).filter((scope) =>
    hasAuthSessionCookie(request.cookies.getAll(), scope),
  );
  if (present.length === 0) return response;

  const { url, key } = supabaseEnv();
  for (const scope of present) {
    const name = authCookieName(scope);
    const supabase = createServerClient(url, key, {
      cookieOptions: name ? { name } : undefined,
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name: cookieName, value }) => {
            request.cookies.set(cookieName, value);
          });
          response = NextResponse.next({
            request: { headers: headersForRender(request) },
          });
          cookiesToSet.forEach(({ name: cookieName, value, options }) => {
            response.cookies.set(cookieName, value, options);
          });
        },
      },
    });
    await supabase.auth.getUser();
  }
  return response;
}

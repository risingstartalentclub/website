import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured, supabaseEnv } from "@/lib/supabase/env";
import { hasAuthSessionCookie } from "@/lib/supabase/session-cookie";

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
  if (!isSupabaseConfigured() || !hasAuthSessionCookie(request.cookies.getAll())) return response;

  const { url, key } = supabaseEnv();
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({
          request: { headers: headersForRender(request) },
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  await supabase.auth.getUser();
  return response;
}

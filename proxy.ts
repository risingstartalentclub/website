import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { hasAuthSessionCookie } from "@/lib/supabase/session-cookie";

export async function proxy(request: NextRequest) {
  if (
    isSupabaseConfigured() &&
    request.nextUrl.pathname === "/parent-panel" &&
    !hasAuthSessionCookie(request.cookies.getAll(), "public")
  ) {
    const url = request.nextUrl.clone();
    const next = `${url.pathname}${url.search}`;
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", next);
    return NextResponse.redirect(url);
  }
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { supabaseEnv } from "@/lib/supabase/env";
import { authCookieName, type AuthScope } from "@/lib/supabase/session-cookie";

export async function createClient(scope: AuthScope = "public") {
  await connection();
  const cookieStore = await cookies();
  const { url, key } = supabaseEnv();
  const name = authCookieName(scope);

  return createServerClient(url, key, {
    cookieOptions: name ? { name } : undefined,
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot always write cookies. The proxy refreshes the session.
        }
      },
    },
  });
}

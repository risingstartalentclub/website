import { cookies } from "next/headers";
import { Suspense } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSiteImages } from "@/lib/get-site-images";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { hasAuthSessionCookie } from "@/lib/supabase/session-cookie";

async function LiveHeader() {
  const cookieStore = await cookies();
  const signedIn =
    isSupabaseConfigured() && hasAuthSessionCookie(cookieStore.getAll(), "public");
  const images = await getSiteImages();
  return <SiteHeader logo={images.logo} signedIn={signedIn} />;
}

export function SiteFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Suspense fallback={<SiteHeader logo="" signedIn={false} pending />}>
        <LiveHeader />
      </Suspense>
      <main className="w-full flex-1 bg-surface pt-16">{children}</main>
      <SiteFooter />
    </div>
  );
}

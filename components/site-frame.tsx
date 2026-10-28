import { Suspense } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSiteImages } from "@/lib/get-site-images";
import { getViewer } from "@/lib/viewer";

async function LiveHeader() {
  const [viewer, images] = await Promise.all([getViewer("public"), getSiteImages()]);
  return (
    <SiteHeader logo={images.logo} signedIn={viewer.signedIn} />
  );
}

export function SiteFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Suspense
        fallback={<SiteHeader logo="" signedIn={false} />}
      >
        <LiveHeader />
      </Suspense>
      <main className="w-full flex-1 bg-surface pt-16">{children}</main>
      <SiteFooter />
    </div>
  );
}

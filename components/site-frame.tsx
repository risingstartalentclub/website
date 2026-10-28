import { Suspense } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSiteImages } from "@/lib/get-site-images";
import { getViewer } from "@/lib/viewer";

async function LiveHeader() {
  const [viewer, images] = await Promise.all([getViewer(), getSiteImages()]);
  return (
    <SiteHeader
      logo={images.logo}
      signedIn={viewer.signedIn}
      isAdmin={viewer.isAdmin}
    />
  );
}

export function SiteFrame({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense
        fallback={<SiteHeader logo="" signedIn={false} isAdmin={false} />}
      >
        <LiveHeader />
      </Suspense>
      <main className="w-full bg-surface pt-16">{children}</main>
      <SiteFooter />
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdminImages } from "@/components/admin-images";
import { SiteFrame } from "@/components/site-frame";
import { getSiteImages } from "@/lib/get-site-images";
import { isSupabaseConfigured, supabaseSetupMessage } from "@/lib/supabase/env";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Admin" };

function AdminMessage({
  title,
  body,
  href,
  action,
}: {
  title: string;
  body: string;
  href?: string;
  action?: string;
}) {
  return (
    <section className="w-full bg-surface py-space-xl">
      <div className="mx-auto flex max-w-[720px] flex-col gap-space-md px-margin-mobile md:px-margin">
        <h1 className="font-headline-xl text-headline-xl-mobile text-primary md:text-headline-xl">
          {title}
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">{body}</p>
        {href && action ? (
          <Link
            href={href}
            className="font-label-lg text-label-lg self-start rounded-lg bg-primary-container px-space-md py-space-sm text-on-primary"
          >
            {action}
          </Link>
        ) : null}
      </div>
    </section>
  );
}

async function AdminGate() {
  if (!isSupabaseConfigured()) {
    return <AdminMessage title="Admin" body={supabaseSetupMessage} />;
  }

  const viewer = await getViewer();
  if (!viewer.signedIn) {
    return (
      <AdminMessage
        title="Admin"
        body="Log in with an admin account to change the club images."
        href="/login?next=/admin"
        action="Log In"
      />
    );
  }

  if (!viewer.isAdmin) {
    return (
      <AdminMessage
        title="Admin access"
        body={`This account cannot change images yet. In the Supabase SQL editor, run: update public.profiles set role = 'admin' where id = '${viewer.id}'; Then open this page again.`}
      />
    );
  }

  const images = await getSiteImages();
  return (
    <section className="w-full bg-surface py-space-md">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-space-md px-4 sm:px-6 lg:px-margin">
        <div className="max-w-3xl">
          <h1 className="font-headline-xl text-headline-xl-mobile text-primary md:text-headline-xl">
            Site images
          </h1>
          <p className="font-body-md text-body-md mt-space-sm text-on-surface-variant">
            Replace the logo, homepage photos, contest photos, and winner
            portraits. Use a JPG, PNG, or WebP under 5 MB. The public site
            shows the new image after you save.
          </p>
        </div>
        <AdminImages images={images} />
      </div>
    </section>
  );
}

export default function AdminPage() {
  return (
    <SiteFrame>
      <Suspense fallback={null}>
        <AdminGate />
      </Suspense>
    </SiteFrame>
  );
}

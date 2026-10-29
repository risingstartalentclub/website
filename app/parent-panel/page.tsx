import type { Metadata } from "next";
import { Suspense } from "react";
import { ParentPanel } from "@/components/parent-panel";
import { SiteFrame } from "@/components/site-frame";

export const metadata: Metadata = { title: "Parent Panel" };

export default function ParentPanelPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; enter?: string }>;
}) {
  return (
    <SiteFrame>
      <Suspense
        fallback={
          <section className="w-full bg-surface-container-low py-space-xl">
            <div className="mx-auto max-w-[1280px] px-margin-mobile md:px-margin">
              <p className="font-body-md text-body-md text-on-surface-variant">Loading your parent panel...</p>
            </div>
          </section>
        }
      >
        <ParentPanel searchParams={searchParams} />
      </Suspense>
    </SiteFrame>
  );
}

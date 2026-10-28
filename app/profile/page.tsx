import type { Metadata } from "next";
import { Suspense } from "react";
import { ProfilePanel } from "@/components/profile-panel";
import { SiteFrame } from "@/components/site-frame";

export const metadata: Metadata = { title: "Profile" };

export default function ProfilePage() {
  return (
    <SiteFrame>
      <Suspense
        fallback={
          <section className="w-full bg-surface-container-low py-space-xl">
            <div className="mx-auto max-w-[1280px] px-margin-mobile md:px-margin">
              <p className="font-body-md text-body-md text-on-surface-variant">
                Loading your profile...
              </p>
            </div>
          </section>
        }
      >
        <ProfilePanel />
      </Suspense>
    </SiteFrame>
  );
}

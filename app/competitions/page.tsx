import type { Metadata } from "next";
import { CompetitionsLive } from "@/components/competitions-live";
import { SiteFrame } from "@/components/site-frame";

export const metadata: Metadata = { title: "Competitions" };

export default function CompetitionsPage() {
  return (
    <SiteFrame>
      <CompetitionsLive />
    </SiteFrame>
  );
}

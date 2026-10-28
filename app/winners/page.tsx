import type { Metadata } from "next";
import { SiteFrame } from "@/components/site-frame";
import { WinnersSection } from "@/components/winners-section";

export const metadata: Metadata = { title: "Winners" };

export default function WinnersPage() {
  return (
    <SiteFrame>
      <WinnersSection />
    </SiteFrame>
  );
}

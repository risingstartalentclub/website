import type { Metadata } from "next";
import { SiteFrame } from "@/components/site-frame";
import { WhySection } from "@/components/why-section";

export const metadata: Metadata = { title: "Why Us" };

export default function WhyUsPage() {
  return (
    <SiteFrame>
      <WhySection />
    </SiteFrame>
  );
}

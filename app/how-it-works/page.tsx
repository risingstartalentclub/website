import type { Metadata } from "next";
import { HowItWorksSection } from "@/components/how-it-works-section";
import { SiteFrame } from "@/components/site-frame";

export const metadata: Metadata = { title: "How It Works" };

export default function HowItWorksPage() {
  return (
    <SiteFrame>
      <HowItWorksSection />
    </SiteFrame>
  );
}

import type { Metadata } from "next";
import { ContactSection } from "@/components/contact-section";
import { CtaSection } from "@/components/cta-section";
import { CompetitionsLive } from "@/components/competitions-live";
import { HeroSection } from "@/components/hero-section";
import { HowItWorksSection } from "@/components/how-it-works-section";
import { SiteFrame } from "@/components/site-frame";
import { WhySection } from "@/components/why-section";
import { WinnersSection } from "@/components/winners-section";

export const metadata: Metadata = {
  title: "Rising Star Talent Club",
};

export default function HomePage() {
  return (
    <SiteFrame>
      <div className="flex w-full flex-col">
        <HeroSection />
        <CompetitionsLive />
        <HowItWorksSection />
        <WhySection />
        <WinnersSection />
        <ContactSection />
        <CtaSection />
      </div>
    </SiteFrame>
  );
}

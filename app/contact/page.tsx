import type { Metadata } from "next";
import { ContactSection } from "@/components/contact-section";
import { SiteFrame } from "@/components/site-frame";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <SiteFrame>
      <ContactSection />
    </SiteFrame>
  );
}

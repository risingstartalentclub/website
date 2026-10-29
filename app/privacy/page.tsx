import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { privacyDocument } from "@/lib/legal";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return <LegalPage document={privacyDocument} currentPath="/privacy" />;
}

import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { termsDocument } from "@/lib/legal";

export const metadata: Metadata = { title: "Terms and Conditions" };

export default function TermsPage() {
  return <LegalPage document={termsDocument} currentPath="/terms" />;
}

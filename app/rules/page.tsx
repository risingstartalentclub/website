import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { rulesDocument } from "@/lib/legal";

export const metadata: Metadata = { title: "Competition Rules" };

export default function RulesPage() {
  return <LegalPage document={rulesDocument} currentPath="/rules" />;
}

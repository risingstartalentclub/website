import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { refundDocument } from "@/lib/legal";

export const metadata: Metadata = { title: "Refund & Cancellation" };

export default function RefundPage() {
  return <LegalPage document={refundDocument} currentPath="/refund" />;
}

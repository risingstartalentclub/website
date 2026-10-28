import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";
import { SiteFrame } from "@/components/site-frame";

export const metadata: Metadata = { title: "Terms and Conditions" };

export default function TermsPage() {
  return (
    <SiteFrame>
      <InfoPage eyebrow="Legal & Compliance" title="Terms and Conditions">
        <p>
          Rising Star Talent Club provides family-friendly contests for
          participants aged 1–20. Using the site means you agree to these terms
          and the competition rules.
        </p>
        <p>
          Accounts must use a real name and a working email. A parent or
          guardian must manage participation for anyone under 18. You are
          responsible for keeping the account password private.
        </p>
        <p>
          Contest descriptions, prizes, and deadlines on each contest card are
          the terms of that contest. Free entry means no registration fee is
          charged through this website.
        </p>
        <p>
          We may refuse or remove an entry that breaks the competition rules,
          misstates a participant&apos;s age, or is unsafe for a family audience.
        </p>
      </InfoPage>
    </SiteFrame>
  );
}

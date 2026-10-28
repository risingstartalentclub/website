import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";
import { SiteFrame } from "@/components/site-frame";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <SiteFrame>
      <InfoPage eyebrow="Legal & Compliance" title="Privacy Policy">
        <p>
          We store the account name, optional guardian name, email, and the
          contest entries you submit. Contact messages store the name, email,
          and message you send.
        </p>
        <p>
          Entries are visible to the signed-in member who submitted them. They
          are not published as a public directory. Winner profiles shown on the
          site are the featured honors already presented by the club.
        </p>
        <p>
          We use this information to run contests, send submission guidelines,
          and reply to support requests. We do not sell personal information.
        </p>
        <p>
          Parents or guardians can ask us to correct or delete a child&apos;s
          account and entries through the contact form.
        </p>
      </InfoPage>
    </SiteFrame>
  );
}

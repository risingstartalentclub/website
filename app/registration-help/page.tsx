import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";
import { SiteFrame } from "@/components/site-frame";

export const metadata: Metadata = { title: "Registration Help" };

export default function RegistrationHelpPage() {
  return (
    <SiteFrame>
      <InfoPage eyebrow="Participant Support" title="Registration Help">
        <p>
          Open a contest and choose Participate Now, then confirm the
          participant name and email. A parent or guardian registers and stays
          responsible for anyone under 18. If you are logged in, the entry is
          saved on your profile. Submission instructions for photos, videos, or
          artwork are sent by email.
        </p>
      </InfoPage>
    </SiteFrame>
  );
}

import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";
import { SiteFrame } from "@/components/site-frame";

export const metadata: Metadata = { title: "Registration Help" };

export default function RegistrationHelpPage() {
  return (
    <SiteFrame>
      <InfoPage eyebrow="Participant Support" title="Registration Help">
        <p>
          Open a contest and choose Participate Now, then add the child&apos;s
          certificate name, age, boy or girl, and Instagram profile. A parent
          or guardian can enter more than one child. If you are logged in, the
          entry is saved in your parent panel. Submission instructions for photos, videos, or
          artwork are sent by email.
        </p>
      </InfoPage>
    </SiteFrame>
  );
}

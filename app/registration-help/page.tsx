import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";
import { SiteFrame } from "@/components/site-frame";

export const metadata: Metadata = { title: "Registration Help" };

export default function RegistrationHelpPage() {
  return (
    <SiteFrame>
      <InfoPage eyebrow="Age Guidelines" title="Registration Help">
        <p>
          Choose the contest that matches the participant&apos;s age on the
          submission deadline.
        </p>
        <p>
          <strong className="text-primary">Ages 1–3:</strong> Baby & Toddler
          Festive Look. A parent or guardian registers and stays responsible for
          the entry.
        </p>
        <p>
          <strong className="text-primary">Ages 4–12:</strong> Kids & Juniors,
          including the Diwali & Cultural Showcase. A parent or guardian should
          complete the account.
        </p>
        <p>
          <strong className="text-primary">Ages 13–20:</strong> Teens & Youth.
          Participants under 18 still need a parent or guardian named on the
          account.
        </p>
        <p>
          Open a contest, choose Participate Now, and confirm the participant
          name and email. If you are logged in, the entry is saved on your
          profile. Submission instructions for photos, videos, or artwork are
          sent by email.
        </p>
      </InfoPage>
    </SiteFrame>
  );
}

import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";
import { SiteFrame } from "@/components/site-frame";

export const metadata: Metadata = { title: "Competition Rules" };

export default function RulesPage() {
  return (
    <SiteFrame>
      <InfoPage eyebrow="Fair Play Guidelines" title="Competition Rules">
        <p>
          One free confirmation is enough to hold a place. Follow the emailed
          guidelines for the actual photo, video, or artwork.
        </p>
        <p>
          Work must be the participant&apos;s own, suitable for a family audience,
          and submitted before the deadline printed on the contest.
        </p>
        <p>
          A panel of 3 certified adjudicators reviews eligible entries. Prizes,
          trophies, medals, and verified titles are awarded as described on the
          contest card.
        </p>
        <p>
          The club may disqualify an entry for copied work or content that is
          unsafe for other young participants.
        </p>
      </InfoPage>
    </SiteFrame>
  );
}

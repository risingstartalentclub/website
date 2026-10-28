import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";
import { SiteFrame } from "@/components/site-frame";

export const metadata: Metadata = { title: "Refund & Cancellation" };

export default function RefundPage() {
  return (
    <SiteFrame>
      <InfoPage eyebrow="Legal & Compliance" title="Refund & Cancellation Policy">
        <p>
          Contest registration on this website is free. There is no registration
          fee to refund.
        </p>
        <p>
          You can stop participating by contacting support before the contest
          deadline. We will mark the entry as withdrawn and it will not go to
          the jury.
        </p>
        <p>
          If a future paid program is introduced, its price and refund window
          will be shown before you pay. That does not apply to the free
          contests currently listed.
        </p>
      </InfoPage>
    </SiteFrame>
  );
}

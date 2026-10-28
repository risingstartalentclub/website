import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";
import { SiteFrame } from "@/components/site-frame";

export const metadata: Metadata = { title: "FAQs" };

const faqs = [
  {
    q: "Who can take part?",
    a: "Young talents and their families can take part. A parent or guardian creates the account for anyone under 18.",
  },
  {
    q: "Is entry free?",
    a: "Yes. The contests shown on the club have free entry and no hidden registration fees.",
  },
  {
    q: "Do younger children need a parent?",
    a: "Yes. Create the account with a parent or guardian, and use the guardian name on sign up for anyone under 18.",
  },
  {
    q: "How are winners chosen?",
    a: "Each open contest is reviewed by a panel of 3 certified adjudicators. Results, certificates, and titles are published in the Hall of Honors.",
  },
  {
    q: "What do I submit?",
    a: "After you confirm participation, we email the guidelines for photos, videos, or artwork for that contest.",
  },
];

export default function FaqsPage() {
  return (
    <SiteFrame>
      <InfoPage eyebrow="Participant Support" title="FAQs">
        {faqs.map((item) => (
          <div key={item.q}>
            <h2 className="font-headline-sm text-headline-sm text-primary">{item.q}</h2>
            <p className="mt-1">{item.a}</p>
          </div>
        ))}
      </InfoPage>
    </SiteFrame>
  );
}

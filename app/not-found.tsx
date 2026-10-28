import Link from "next/link";
import { SiteFrame } from "@/components/site-frame";

export default function NotFound() {
  return (
    <SiteFrame>
      <section className="w-full bg-surface-container-low py-24">
        <div className="mx-auto max-w-xl px-margin-mobile text-center md:px-margin">
          <p className="font-label-sm text-label-sm font-bold tracking-widest text-secondary uppercase">
            Missing page
          </p>
          <h1 className="font-headline-xl text-headline-xl mt-space-xs text-primary">
            This page is not on the stage.
          </h1>
          <Link
            href="/"
            className="font-label-lg text-label-lg mt-space-lg inline-flex rounded-lg bg-primary-container px-space-lg py-3 text-on-primary"
          >
            Back to Home
          </Link>
        </div>
      </section>
    </SiteFrame>
  );
}

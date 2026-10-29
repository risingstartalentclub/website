import Link from "next/link";
import { SiteFrame } from "@/components/site-frame";
import { clubContact, legalLinks, type LegalDocument } from "@/lib/legal";

function RichText({ text }: { text: string }) {
  const pattern =
    /(\[[^\]]+\]\([^)]+\)|support@risingstartalentclub\.com|https:\/\/www\.risingstartalentclub\.com\/?)/g;
  const parts = text.split(pattern);

  return (
    <>
      {parts.map((part, index) => {
        const labeled = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (labeled) {
          return (
            <Link key={index} href={labeled[2]} className="font-semibold text-secondary underline-offset-2 hover:underline">
              {labeled[1]}
            </Link>
          );
        }
        if (part === clubContact.email) {
          return (
            <a key={index} href={`mailto:${clubContact.email}`} className="font-semibold text-secondary underline-offset-2 hover:underline">
              {part}
            </a>
          );
        }
        if (part.startsWith("https://www.risingstartalentclub.com")) {
          return (
            <a
              key={index}
              href={clubContact.website}
              className="font-semibold text-secondary underline-offset-2 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              risingstartalentclub.com
            </a>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

export function LegalPage({ document, currentPath }: { document: LegalDocument; currentPath: string }) {
  return (
    <SiteFrame>
      <section className="border-b border-surface-variant bg-surface-container-low">
        <div className="mx-auto max-w-[1280px] px-margin-mobile py-space-xl md:px-margin">
          <span className="font-label-sm text-label-sm mb-space-xs block font-bold tracking-widest text-secondary uppercase">
            {document.eyebrow}
          </span>
          <h1 className="font-headline-xl text-headline-xl-mobile md:text-headline-xl max-w-3xl text-primary">
            {document.title}
          </h1>
          <p className="font-body-lg text-body-lg mt-space-md max-w-3xl text-on-surface-variant">
            {document.intro}
          </p>
        </div>
      </section>

      <section className="bg-surface py-space-xl">
        <div className="mx-auto grid max-w-[1280px] items-start gap-gutter px-margin-mobile md:px-margin lg:grid-cols-12">
          <aside className="lg:sticky lg:top-24 lg:col-span-4">
            <nav aria-label="On this page" className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
              <p className="font-label-sm text-label-sm mb-space-sm tracking-wider text-secondary uppercase">
                On this page
              </p>
              <ol className="flex flex-col gap-1">
                {document.sections.map((section, index) => (
                  <li key={section.title}>
                    <a
                      href={`#section-${index + 1}`}
                      className="font-body-sm text-body-sm flex gap-2 rounded-lg px-2 py-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary"
                    >
                      <span className="w-5 shrink-0 font-semibold text-secondary">{index + 1}</span>
                      <span>{section.title}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <div className="flex flex-col gap-space-md lg:col-span-8">
            {document.sections.map((section, index) => (
              <article
                key={section.title}
                id={`section-${index + 1}`}
                className="scroll-mt-24 rounded-xl bg-surface-container-lowest p-space-lg shadow-sm"
              >
                <h2 className="font-headline-sm text-headline-sm flex items-start gap-space-sm text-primary">
                  <span className="font-label-sm text-label-sm mt-1 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-secondary-fixed px-1.5 text-on-secondary-fixed">
                    {index + 1}
                  </span>
                  <span>{section.title}</span>
                </h2>
                <div className="font-body-md text-body-md mt-space-sm flex flex-col gap-space-sm pl-0 text-on-surface-variant sm:pl-9">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{<RichText text={paragraph} />}</p>
                  ))}
                </div>
              </article>
            ))}

            {document.closing ? (
              <p className="font-body-md text-body-md rounded-xl bg-tertiary-fixed px-space-lg py-space-md text-on-tertiary-fixed">
                {document.closing}
              </p>
            ) : null}

            <div className="rounded-xl bg-primary-container p-space-lg text-on-primary">
              <p className="font-label-sm text-label-sm tracking-wider text-tertiary-fixed uppercase">Contact</p>
              <h2 className="font-headline-sm text-headline-sm mt-1">{clubContact.name}</h2>
              <p className="font-body-md text-body-md mt-space-sm text-surface-container-highest">
                Email{" "}
                <a href={`mailto:${clubContact.email}`} className="font-semibold text-tertiary-fixed hover:underline">
                  {clubContact.email}
                </a>
              </p>
              <p className="font-body-sm text-body-sm mt-1 text-surface-container-highest">
                <a href={clubContact.website} className="hover:text-on-primary" target="_blank" rel="noopener noreferrer">
                  risingstartalentclub.com
                </a>
              </p>
            </div>

            <nav aria-label="Other policies" className="flex flex-col gap-space-sm">
              <p className="font-label-sm text-label-sm tracking-wider text-secondary uppercase">Also read</p>
              <div className="flex flex-col gap-space-sm sm:flex-row sm:flex-wrap">
                {legalLinks
                  .filter((link) => link.href !== currentPath)
                  .map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="font-label-md text-label-md rounded-lg bg-surface-container-low px-space-md py-2 text-primary transition-colors hover:bg-secondary-fixed"
                    >
                      {link.label}
                    </Link>
                  ))}
              </div>
            </nav>
          </div>
        </div>
      </section>
    </SiteFrame>
  );
}

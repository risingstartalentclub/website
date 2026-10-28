export function InfoPage({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="w-full bg-surface py-space-xl">
      <div className="mx-auto max-w-[1280px] px-margin-mobile md:px-margin">
        <div className="max-w-3xl">
          <span className="font-label-sm text-label-sm mb-space-xs block font-bold tracking-widest text-secondary uppercase">
            {eyebrow}
          </span>
          <h1 className="font-headline-xl text-headline-xl-mobile md:text-headline-xl text-primary">
            {title}
          </h1>
          <div className="font-body-md text-body-md mt-space-lg flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-lg text-on-surface-variant shadow-sm">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

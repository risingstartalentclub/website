export const socialProfiles = [
  {
    name: "Instagram",
    handle: "@risingstartalentclub",
    href: "https://www.instagram.com/risingstartalentclub",
  },
  {
    name: "Facebook",
    handle: "Rising Star Talent Club",
    href: "https://www.facebook.com/people/Rising-Star-Talent-Club/61595490270682/",
  },
] as const;

function InstagramMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm10 1.8H7A2.2 2.2 0 0 0 4.8 7v10A2.2 2.2 0 0 0 7 19.2h10a2.2 2.2 0 0 0 2.2-2.2V7A2.2 2.2 0 0 0 17 4.8zM12 8.2A3.8 3.8 0 1 1 8.2 12 3.8 3.8 0 0 1 12 8.2zm0 1.6A2.2 2.2 0 1 0 14.2 12 2.2 2.2 0 0 0 12 9.8zm4.35-2.55a.9.9 0 1 1-.9.9.9.9 0 0 1 .9-.9z" />
    </svg>
  );
}

function FacebookMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M14.2 20v-6.2h2.1l.3-2.4h-2.4V9.9c0-.7.2-1.2 1.2-1.2H16.7V6.6A16 16 0 0 0 14.9 6c-1.8 0-3 1.1-3 3.1v1.3H9.6v2.4h2.3V20z" />
    </svg>
  );
}

function Mark({ name }: { name: "Instagram" | "Facebook" }) {
  return name === "Instagram" ? <InstagramMark /> : <FacebookMark />;
}

export function SocialButtons() {
  return (
    <div className="flex gap-space-sm">
      {socialProfiles.map((profile) => (
        <a
          key={profile.name}
          href={profile.href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-label-lg text-label-lg inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-surface-container-lowest px-4 py-4 text-primary shadow-sm transition-colors hover:bg-surface-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary sm:flex-none sm:px-space-lg"
        >
          <Mark name={profile.name} />
          <span>{profile.name}</span>
        </a>
      ))}
    </div>
  );
}

export function SocialIcons() {
  return (
    <div className="flex flex-col gap-space-sm">
      <p className="font-label-sm text-label-sm tracking-wider text-tertiary-fixed-dim uppercase">
        Follow us
      </p>
      <div className="flex flex-wrap gap-space-sm">
        {socialProfiles.map((profile) => (
          <a
            key={profile.name}
            href={profile.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${profile.name}, ${profile.handle}`}
            className="inline-flex items-center gap-2 rounded-full bg-primary/50 px-3 py-2 text-on-primary transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tertiary-fixed"
          >
            <Mark name={profile.name} />
            <span className="font-label-sm text-label-sm normal-case tracking-normal">{profile.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

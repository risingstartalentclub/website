"use client";

import { useEffect, useRef, useState } from "react";
import type { PlayableReel } from "@/lib/reels";

export function ReelFrame({
  kind,
  src,
  title,
  compact = false,
}: {
  kind: PlayableReel["kind"];
  src: string;
  title: string;
  compact?: boolean;
}) {
  const frame = compact ? "h-36" : "h-[22rem]";
  const box = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const node = box.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setReady(true);
        observer.disconnect();
      },
      { rootMargin: "160px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  if (kind === "instagram") {
    return (
      <div ref={box} className={`relative overflow-hidden bg-black ${frame}`}>
        {ready ? (
          <iframe
            title={title}
            src={`https://www.instagram.com/reel/${src}/embed`}
            scrolling="no"
            className={`pointer-events-auto absolute left-0 w-[calc(100%+20px)] border-0 ${compact ? "-top-12 h-[24rem]" : "-top-[4.25rem] h-[46rem]"}`}
            loading="lazy"
          />
        ) : null}
      </div>
    );
  }

  if (kind === "youtube") {
    return (
      <div ref={box} className={`relative overflow-hidden bg-black ${frame}`}>
        {ready ? (
          <iframe
            title={title}
            src={`https://www.youtube-nocookie.com/embed/${src}?autoplay=1&mute=1&controls=0&loop=1&playlist=${src}&rel=0&modestbranding=1`}
            className="h-full w-full border-0"
            allow="autoplay"
            loading="lazy"
          />
        ) : null}
      </div>
    );
  }

  return (
    <div ref={box} className={`relative overflow-hidden bg-black ${frame}`}>
      {ready ? (
        <video className="h-full w-full object-cover" src={src} autoPlay muted loop playsInline aria-label={title} />
      ) : null}
    </div>
  );
}

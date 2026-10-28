export function isWinnerReelSlot(value: number) {
  return Number.isInteger(value) && value >= 1 && value <= 32767;
}

export type PlayableReel = {
  id: string;
  title: string;
  kind: "file" | "youtube" | "instagram";
  src: string;
};

const youtubeId = /^[\w-]{6,}$/;
const instagramCode = /^[A-Za-z0-9_-]{5,}$/;

export function playableReel(url: string): { kind: "file" | "youtube" | "instagram"; src: string } | null {
  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:") return null;

  const host = parsed.hostname.replace(/^www\./, "");
  if (host === "instagram.com" || host === "m.instagram.com") {
    const code = parsed.pathname.match(/^\/reels?\/([A-Za-z0-9_-]+)\/?$/)?.[1] ?? "";
    if (instagramCode.test(code)) return { kind: "instagram", src: code };
    return null;
  }
  if (host === "youtu.be") {
    const id = parsed.pathname.split("/").filter(Boolean)[0] ?? "";
    if (youtubeId.test(id)) return { kind: "youtube", src: id };
  }
  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
    const fromPath = parsed.pathname.match(/^\/(?:shorts|embed)\/([\w-]{6,})/);
    const id = parsed.searchParams.get("v") || fromPath?.[1] || "";
    if (youtubeId.test(id)) return { kind: "youtube", src: id };
  }
  if (/\.(mp4|webm|ogg|mov)$/i.test(parsed.pathname)) {
    return { kind: "file", src: parsed.toString() };
  }
  return null;
}

export const parentPanelPath = "/parent-panel";

export function parentEntryPath(slug: string) {
  return `${parentPanelPath}?enter=${encodeURIComponent(slug)}`;
}

export function participateHref(slug: string, signedIn: boolean) {
  const next = parentEntryPath(slug);
  return signedIn ? next : `/login?next=${encodeURIComponent(next)}`;
}

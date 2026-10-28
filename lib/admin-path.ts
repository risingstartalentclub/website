export const adminPath = "/admin";

export function isAdminDestination(path: string) {
  return path === adminPath || path.startsWith(`${adminPath}?`) || path.startsWith(`${adminPath}/`);
}

export const adminSections = [
  { id: "home", label: "Home" },
  { id: "competitions", label: "Competitions" },
  { id: "winners", label: "Winners" },
] as const;

export type AdminSectionId = (typeof adminSections)[number]["id"];

export function adminSection(value: string | undefined): AdminSectionId {
  return adminSections.some((section) => section.id === value) ? (value as AdminSectionId) : "home";
}

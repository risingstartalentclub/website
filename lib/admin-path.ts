export const adminPath = "/admin";

export function isAdminDestination(path: string) {
  return path === adminPath || path.startsWith(`${adminPath}?`) || path.startsWith(`${adminPath}/`);
}

export const adminPeopleSql = "supabase/1-schema.sql";

export const adminSections = [
  { id: "dashboard", label: "Dashboard" },
  { id: "contests", label: "Contests" },
  { id: "admins", label: "Admin List" },
  { id: "users", label: "Parent List" },
  { id: "enquiries", label: "Enquiry List" },
] as const;

export type AdminSectionId = (typeof adminSections)[number]["id"];

const sectionAliases: Record<string, AdminSectionId> = {
  home: "dashboard",
  competitions: "contests",
  winners: "dashboard",
};

export function adminSection(value: string | undefined): AdminSectionId {
  if (!value) return "dashboard";
  if (adminSections.some((section) => section.id === value)) return value as AdminSectionId;
  return sectionAliases[value] ?? "dashboard";
}

export type AdminCounts = {
  admins: number;
  participants: number;
  contests: number;
  openContests: number;
  heroTitle: string | null;
};

export type AdminEnquiry = {
  id: string;
  name: string;
  email: string;
  message: string;
  received: string;
};

export type AdminPerson = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  joined: string;
};

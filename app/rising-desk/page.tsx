import { redirect } from "next/navigation";
import { Suspense } from "react";
import { adminPath, adminSection } from "@/lib/admin-path";

async function RedirectToAdmin({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>;
}) {
  const { section } = await searchParams;
  redirect(section ? `${adminPath}?section=${adminSection(section)}` : adminPath);
  return null;
}

export default function OldDeskPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <RedirectToAdmin searchParams={searchParams} />
    </Suspense>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { ParticipateModal, type ModalContest, type SavedChild } from "@/components/participate-modal";
import { parentPanelPath } from "@/lib/parent-panel";

export function OpenEntryForm({
  contest,
  savedChildren,
}: {
  contest: ModalContest;
  savedChildren: SavedChild[];
}) {
  const router = useRouter();

  return (
    <ParticipateModal
      contest={contest}
      children={savedChildren}
      onClose={() => router.replace(parentPanelPath, { scroll: false })}
    />
  );
}

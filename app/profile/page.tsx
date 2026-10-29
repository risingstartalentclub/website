import { redirect } from "next/navigation";
import { parentPanelPath } from "@/lib/parent-panel";

export default function ProfilePage() {
  redirect(parentPanelPath);
}

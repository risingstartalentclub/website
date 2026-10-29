"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, supabaseSetupMessage } from "@/lib/supabase/env";
import { pincodeError } from "@/lib/validation";
import { stateError } from "@/lib/states";

export type ResultState = {
  error?: string;
  message?: string;
} | null;

const schemaMessage =
  "Run supabase/4-participants.sql in the Supabase SQL editor, then try again.";

const entryIdPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function publicDatabaseError(error: { code?: string; message?: string } | null, fallback: string) {
  if (!error) return fallback;
  if (error.code === "42P01" || error.code === "42703" || error.code === "42883") return schemaMessage;
  const message = error.message ?? "";
  if (
    message.startsWith("Only an admin") ||
    message.startsWith("Select ") ||
    message.startsWith("Choose ") ||
    message.startsWith("That contest") ||
    message.startsWith("This prize") ||
    message.startsWith("Enter ") ||
    message.startsWith("Log in ")
  ) {
    return message;
  }
  return fallback;
}

export async function announceWinners(
  _previous: ResultState,
  formData: FormData,
): Promise<ResultState> {
  const contestSlug = String(formData.get("contestSlug") ?? "").trim();
  const winnerIds = formData
    .getAll("winnerId")
    .map((value) => String(value))
    .filter((value) => entryIdPattern.test(value));

  if (contestSlug.length < 2) return { error: "Choose a contest." };
  if (winnerIds.length < 1) return { error: "Select at least one winner." };
  if (!isSupabaseConfigured()) return { error: supabaseSetupMessage };

  const supabase = await createClient("admin");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Log in with an admin account." };
  const { data: adminRow } = await supabase.from("admins").select("id").eq("id", user.id).maybeSingle();
  if (!adminRow) return { error: "Only an admin can choose a winner." };

  const { error } = await supabase.rpc("admin_announce_winners", {
    target_slug: contestSlug,
    winner_ids: winnerIds,
  });
  if (error) {
    return { error: publicDatabaseError(error, "We could not save the winners. Please try again in a moment.") };
  }

  revalidatePath("/admin");
  revalidatePath("/parent-panel");
  return { message: "Winners saved. Parents can see the result now." };
}

export async function claimPrize(
  _previous: ResultState,
  formData: FormData,
): Promise<ResultState> {
  const entryId = String(formData.get("entryId") ?? "");
  const address = String(formData.get("address") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const pincode = String(formData.get("pincode") ?? "").trim();
  const state = String(formData.get("state") ?? "").trim();

  if (!entryIdPattern.test(entryId)) return { error: "Choose the winning entry before claiming." };
  if (address.length < 5 || address.length > 240) return { error: "Enter the full address." };
  if (city.length < 2 || city.length > 80) return { error: "Enter the city." };
  const invalidPin = pincodeError(pincode);
  if (invalidPin) return { error: invalidPin };
  const invalidState = stateError(state);
  if (invalidState) return { error: invalidState };
  if (!isSupabaseConfigured()) return { error: supabaseSetupMessage };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Log in before claiming a prize." };

  const { error } = await supabase.rpc("claim_prize", {
    entry_id: entryId,
    claim_address: address,
    claim_city: city,
    claim_pincode: pincode,
    claim_state: state,
  });
  if (error) {
    return { error: publicDatabaseError(error, "We could not save the prize details. Please try again in a moment.") };
  }

  revalidatePath("/parent-panel");
  return { message: "Prize details saved. We will use this address for delivery." };
}

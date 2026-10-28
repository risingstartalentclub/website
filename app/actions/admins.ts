"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, supabaseSetupMessage } from "@/lib/supabase/env";
import { emailError, normalizeEmail, passwordError } from "@/lib/validation";

export type AdminCreateState = {
  error?: string;
  message?: string;
} | null;

const schemaMessage =
  "Run supabase/1-schema.sql again in the Supabase SQL editor, then add the admin again.";

function knownError(message: string) {
  const text = message.replace(/^ERROR:\s*/i, "").trim();
  if (text.includes("already exists")) return "An account with this email already exists.";
  if (text.includes("Only an admin")) return "Only an admin can add another admin.";
  if (text.startsWith("Enter the admin name")) return "Enter the admin name.";
  if (text.startsWith("Enter a valid email")) return "Enter a valid email address.";
  if (text.startsWith("Use at least 8 characters")) {
    return "Use at least 8 characters, including one letter and one number.";
  }
  if (/admin_create_admin|schema cache|could not find the function/i.test(text)) return schemaMessage;
  return null;
}

export async function createAdmin(
  _previous: AdminCreateState,
  formData: FormData,
): Promise<AdminCreateState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (name.length < 2 || name.length > 120) return { error: "Enter the admin name." };
  const invalidEmail = emailError(email);
  if (invalidEmail) return { error: invalidEmail };
  const invalidPassword = passwordError(password, "signup");
  if (invalidPassword) return { error: invalidPassword };
  if (password !== confirmPassword) return { error: "Those passwords do not match." };
  if (!isSupabaseConfigured()) return { error: supabaseSetupMessage };

  const supabase = await createClient("admin");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Log in with an admin account." };

  const { data: adminRow } = await supabase.from("admins").select("id").eq("id", user.id).maybeSingle();
  if (!adminRow) return { error: "Only an admin can add another admin." };

  const { error } = await supabase.rpc("admin_create_admin", {
    admin_name: name,
    admin_email: email,
    admin_password: password,
  });

  if (error) {
    return { error: knownError(error.message) ?? schemaMessage };
  }

  revalidatePath("/admin");
  return { message: "Admin added. They can log in with this email and password." };
}

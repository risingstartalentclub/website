"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/safe-next";
import { isSupabaseConfigured, supabaseSetupMessage } from "@/lib/supabase/env";
import { emailError, normalizeEmail, passwordError } from "@/lib/validation";

export type AuthState = {
  error?: string;
  message?: string;
} | null;

export async function signUp(
  _previous: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const guardianName = String(formData.get("guardianName") ?? "").trim();
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");

  if (fullName.length < 2 || fullName.length > 120) {
    return { error: "Enter the participant's full name." };
  }
  if (guardianName.length > 120) {
    return { error: "Guardian name is too long." };
  }
  const invalidEmail = emailError(email);
  if (invalidEmail) return { error: invalidEmail };
  const invalidPassword = passwordError(password, "signup");
  if (invalidPassword) return { error: invalidPassword };
  if (!isSupabaseConfigured()) {
    return { error: supabaseSetupMessage };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        guardian_name: guardianName,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.session) {
    return {
      message:
        "Account created. Check your email to confirm it, then log in.",
    };
  }

  redirect("/profile");
}

export async function signIn(
  _previous: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");

  const invalidEmail = emailError(email);
  if (invalidEmail) return { error: invalidEmail };
  const invalidPassword = passwordError(password, "login");
  if (invalidPassword) return { error: invalidPassword };
  if (!isSupabaseConfigured()) {
    return { error: supabaseSetupMessage };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (error.code === "invalid_credentials") {
      return { error: "Those login details did not match an account." };
    }
    return { error: "We could not log you in. Please try again in a moment." };
  }

  const nextPath = safeNextPath(String(formData.get("next") ?? ""));
  if (nextPath) redirect(nextPath);

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user?.id ?? "")
    .maybeSingle();
  redirect(profile?.role === "admin" ? "/admin" : "/profile");
}

export async function signOut() {
  if (!isSupabaseConfigured()) {
    redirect("/");
  }
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

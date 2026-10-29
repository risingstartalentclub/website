"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { adminPath, isAdminDestination } from "@/lib/admin-path";
import { safeNextPath } from "@/lib/safe-next";
import { isSupabaseConfigured, supabaseSetupMessage } from "@/lib/supabase/env";
import { limitLogin, limitSignup } from "@/lib/public-limits";
import { emailError, mobileError, normalizeEmail, normalizeMobile, passwordError } from "@/lib/validation";

export type AuthState = {
  error?: string;
  message?: string;
} | null;

export async function signUp(
  _previous: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const guardianName = String(formData.get("guardianName") ?? "").trim();
  const mobile = String(formData.get("mobile") ?? "");
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");

  if (guardianName.length < 2 || guardianName.length > 120) {
    return { error: "Enter the parent or guardian name." };
  }
  const invalidMobile = mobileError(mobile);
  if (invalidMobile) return { error: invalidMobile };
  const invalidEmail = emailError(email);
  if (invalidEmail) return { error: invalidEmail };
  const invalidPassword = passwordError(password, "signup");
  if (invalidPassword) return { error: invalidPassword };
  if (!isSupabaseConfigured()) {
    return { error: supabaseSetupMessage };
  }

  const limited = await limitSignup(email, normalizeMobile(mobile));
  if (!limited.allowed) return { error: limited.message };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        account_type: "parent",
        full_name: guardianName,
        phone: `+91${normalizeMobile(mobile)}`,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.session) {
    const signedIn = await supabase.auth.signInWithPassword({ email, password });
    if (signedIn.error || !signedIn.data.session) {
      return { error: "Account created, but we could not log you in. Please try again in a moment." };
    }
  }

  redirect("/profile");
}

async function authenticate(formData: FormData, scope: "public" | "admin" = "public") {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");

  const invalidEmail = emailError(email);
  if (invalidEmail) return { error: invalidEmail };
  const invalidPassword = passwordError(password, "login");
  if (invalidPassword) return { error: invalidPassword };
  if (!isSupabaseConfigured()) {
    return { error: supabaseSetupMessage };
  }

  const limited = await limitLogin(email, scope);
  if (!limited.allowed) return { error: limited.message };

  const supabase = await createClient(scope);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    if (error?.code === "invalid_credentials") {
      return { error: "Those login details did not match an account." };
    }
    if (error?.code === "over_request_rate_limit" || error?.status === 429) {
      return { error: "Too many attempts. Please wait a few minutes and try again." };
    }
    return { error: "We could not log you in. Please try again in a moment." };
  }

  const table = scope === "admin" ? "admins" : "parents";
  const { data: account } = await supabase.from(table).select("id").eq("id", data.user.id).maybeSingle();

  return {
    supabase,
    isAdmin: scope === "admin" && Boolean(account),
    isParent: scope === "public" && Boolean(account),
    nextPath: safeNextPath(String(formData.get("next") ?? "")),
  };
}

export async function signIn(
  _previous: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const result = await authenticate(formData);
  if ("error" in result) return { error: result.error };

  if (!result.isParent) {
    await result.supabase.auth.signOut();
    return { error: "Those login details did not match a parent account." };
  }
  if (result.nextPath && isAdminDestination(result.nextPath)) {
    await result.supabase.auth.signOut();
    return { error: "This account cannot open that page." };
  }
  if (result.nextPath) redirect(result.nextPath);
  redirect("/profile");
}

export async function signInAdmin(
  _previous: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const result = await authenticate(formData, "admin");
  if ("error" in result) return { error: result.error };

  if (!result.isAdmin) {
    await result.supabase.auth.signOut();
    return { error: "This account cannot open that page." };
  }
  redirect(adminPath);
}

export async function signOut(formData?: FormData) {
  const requested =
    formData instanceof FormData ? safeNextPath(String(formData.get("next") ?? "")) : null;
  const scope = formData instanceof FormData && formData.get("scope") === "admin" ? "admin" : "public";
  if (isSupabaseConfigured()) {
    const supabase = await createClient(scope);
    await supabase.auth.signOut();
  }
  if (scope === "admin") redirect("/admin/login");
  redirect(requested && isAdminDestination(requested) ? adminPath : "/");
}

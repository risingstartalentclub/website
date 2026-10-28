"use client";

import { useSyncExternalStore } from "react";
import { AuthCard } from "@/components/auth-card";
import { safeNextPath } from "@/lib/safe-next";

function subscribe() {
  return () => {};
}

function nextFromLocation() {
  return safeNextPath(new URLSearchParams(window.location.search).get("next")) ?? "";
}

export function LoginForm() {
  const nextPath = useSyncExternalStore(subscribe, nextFromLocation, () => "");
  return <AuthCard mode="login" nextPath={nextPath || undefined} />;
}

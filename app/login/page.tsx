import type { Metadata } from "next";
import { LoginForm } from "@/components/login-form";
import { SiteFrame } from "@/components/site-frame";

export const metadata: Metadata = { title: "Log In" };

export default function LoginPage() {
  return (
    <SiteFrame>
      <LoginForm />
    </SiteFrame>
  );
}

"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { AuthCard } from "@/auth/components/AuthCard";
import { Field } from "@/auth/components/Field";
import { SubmitButton } from "@/auth/components/SubmitButton";
import { useLoginMutation } from "@/lib/api/authApi";
import { getErrorMessage } from "@/lib/api/baseApi";

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "";
  const [login, { isLoading }] = useLoginMutation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const identifier = String(form.get("login") || "").trim();
    const password = String(form.get("password") || "");

    if (!identifier || !password) {
      toast.error("Please enter your email/phone and password.");
      return;
    }

    try {
      const result = await login({ identifier, password }).unwrap();

      const token = result.token;
      if (token) {
        localStorage.setItem("token", token);
      }

      toast.success("Logged in successfully!");

      const safeNext =
        next && next.startsWith("/") && !next.startsWith("//") ? next : null;
      const userRole = result.user?.role;

      // Full page navigation clears the in-memory API cache so the dashboard
      // boots fresh and `getMe` re-runs with the freshly stored token. SPA
      // `router.replace` here can hand a stale 401 / old-user cache to the
      // dashboard, causing the "login again" bounce and wrong role routing.
      if (userRole === "admin") {
        if (safeNext?.startsWith("/game") || safeNext?.startsWith("/dashboard")) {
          toast.error("Admins cannot join games. Redirecting to admin dashboard.");
        }
        window.location.replace("/admin");
        return;
      }
      window.location.replace(safeNext ?? "/dashboard/active-games");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <AuthCard
      badge="Welcome back"
      title="Log in to your account"
      subtitle="Log in for verified raffles & secure checkout."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-3.5">
          <Field
            label="Email or phone"
            type="text"
            name="login"
            icon={Mail}
            placeholder="you@example.com"
            autoComplete="username"
            required
          />
          <Field
            label="Password"
            type="password"
            name="password"
            icon={Lock}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
        </div>

        <div className="flex items-center justify-between gap-2.5 text-xs text-text-secondary font-plus leading-tight pt-1">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              name="remember"
              className="w-3.5 h-3.5 rounded accent-brass bg-bg-raised border-border-strong cursor-pointer shrink-0"
            />
            Remember me
          </label>
          <Link
            href="/forgot-password"
            prefetch={false}
            className="text-brass-light hover:underline font-medium"
          >
            Forgot password?
          </Link>
        </div>

        <SubmitButton loading={isLoading}>Log in</SubmitButton>
      </form>

      <p className="text-center text-xs text-text-muted font-plus mt-4">
        Don&apos;t have an account?{" "}
        <Link
          href={`/register${next ? `?next=${encodeURIComponent(next)}` : ""}`}
          prefetch={false}
          className="text-brass-light hover:underline font-semibold"
        >
          Register
        </Link>
      </p>
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <AuthCard badge="Loading" title="Please wait..." subtitle="Loading login form.">
          <p className="text-center text-xs text-text-muted">Loading...</p>
        </AuthCard>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
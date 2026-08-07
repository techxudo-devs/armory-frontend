"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Phone, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { AuthCard } from "@/auth/components/AuthCard";
import { Field } from "@/auth/components/Field";
import { SubmitButton } from "@/auth/components/SubmitButton";
import { useRegisterMutation } from "@/lib/api/authApi";
import { getErrorMessage } from "@/lib/api/baseApi";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "";
  const [register, { isLoading }] = useRegisterMutation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const fullName = String(form.get("fullName") || "").trim();
    const phone = String(form.get("phone") || "").trim();
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");

    if (!fullName || !phone || !email || !password) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      const result = await register({ fullName, email, phone, password }).unwrap();
      toast.success("Account created successfully!");
      const safeNext =
        next && next.startsWith("/") && !next.startsWith("//") ? next : null;
      router.replace(
        safeNext ??
          (result.user.role === "admin" ? "/admin" : "/dashboard")
      );
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <AuthCard
      badge="Join the armory"
      title="Create your account"
      subtitle="Register in under a minute for verified raffles & secure checkout."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Field
            label="Full name"
            type="text"
            name="fullName"
            icon={User}
            placeholder="John Doe"
            autoComplete="name"
            required
          />
          <Field
            label="Phone"
            type="tel"
            name="phone"
            icon={Phone}
            placeholder="+1 (555) 000-0000"
            autoComplete="tel"
            required
          />
          <Field
            label="Email"
            type="email"
            name="email"
            icon={Mail}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
          <Field
            label="Password"
            type="password"
            name="password"
            icon={Lock}
            placeholder="At least 6 characters"
            autoComplete="new-password"
            minLength={6}
            required
          />
        </div>

        <label className="flex items-center gap-2.5 text-xs text-text-secondary font-plus leading-tight cursor-pointer pt-1">
          <input
            type="checkbox"
            name="terms"
            required
            className="w-3.5 h-3.5 rounded accent-brass bg-bg-raised border-border-strong cursor-pointer shrink-0"
          />
          <span>
            I am 18+ and agree to the{" "}
            <a
              href="#"
              className="text-brass-light hover:underline font-medium"
            >
              Terms of service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="text-brass-light hover:underline font-medium"
            >
              Sweepstakes rules
            </a>
            .
          </span>
        </label>

        <SubmitButton loading={isLoading}>Create account</SubmitButton>
      </form>

      <p className="text-center text-xs text-text-muted font-plus mt-4">
        Already have an account?{" "}
        <Link
          href="/login"
          prefetch={false}
          className="text-brass-light hover:underline font-semibold"
        >
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <AuthCard badge="Loading" title="Please wait..." subtitle="Loading registration form.">
          <p className="text-center text-xs text-text-muted">Loading...</p>
        </AuthCard>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}

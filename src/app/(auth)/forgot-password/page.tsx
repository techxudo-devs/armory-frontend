"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { AuthCard } from "@/auth/components/AuthCard";
import { Field } from "@/auth/components/Field";
import { SubmitButton } from "@/auth/components/SubmitButton";
import { useForgotPasswordMutation } from "@/lib/api/authApi";
import { getErrorMessage } from "@/lib/api/baseApi";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "").trim();

    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    try {
      await forgotPassword({ email }).unwrap();
      toast.success("Password reset link sent to your email.");
      router.replace("/login");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <AuthCard
      badge="Reset password"
      title="Forgot your password?"
      subtitle="Enter your account email and we'll send you a secure link to reset your password."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Field
          label="Email"
          type="email"
          name="email"
          icon={Mail}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />

        <SubmitButton loading={isLoading}>Send reset link</SubmitButton>
      </form>

      <p className="text-center text-xs text-text-muted font-plus mt-4">
        Remembered your password?{" "}
        <Link
          href="/login"
          prefetch={false}
          className="text-brass-light hover:underline font-semibold"
        >
          Log in
        </Link>
      </p>
      <Link
        href="/login"
        prefetch={false}
        className="mt-4 flex items-center justify-center gap-1.5 text-xs text-text-secondary font-plus hover:text-text-primary transition-colors"
      >
        <ArrowLeft size={13} />
        Back to login
      </Link>
    </AuthCard>
  );
}

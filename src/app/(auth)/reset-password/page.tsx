"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, ArrowLeft, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { AuthCard } from "@/auth/components/AuthCard";
import { Field } from "@/auth/components/Field";
import { SubmitButton } from "@/auth/components/SubmitButton";
import { useResetPasswordMutation } from "@/lib/api/authApi";
import { getErrorMessage } from "@/lib/api/baseApi";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const newPassword = String(form.get("newPassword") || "");
    const confirmPassword = String(form.get("confirmPassword") || "");

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      await resetPassword({ token, newPassword }).unwrap();
      toast.success("Password reset successfully. You can now log in.");
      router.replace("/login");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (!token) {
    return (
      <AuthCard
        badge="Reset password"
        title="Invalid reset link"
        subtitle="This link is missing a reset token. Request a new password reset link."
      >
        <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3.5 text-sm text-red-300">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <p>Your reset link is invalid or incomplete. Please request a new one.</p>
        </div>
        <div className="mt-4">
          <Link
            href="/forgot-password"
            prefetch={false}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-brass via-brass-light to-brass px-6 py-3 text-xs font-medium uppercase tracking-wide text-white shadow-md shadow-brass/10 transition-all hover:brightness-110 active:scale-[0.99]"
          >
            Request a new link
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      badge="Reset password"
      title="Set a new password"
      subtitle="Choose a strong password to secure your account."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Field
          label="New password"
          type="password"
          name="newPassword"
          icon={Lock}
          placeholder="At least 6 characters"
          autoComplete="new-password"
          minLength={6}
          required
        />
        <Field
          label="Confirm new password"
          type="password"
          name="confirmPassword"
          icon={Lock}
          placeholder="Re-enter your new password"
          autoComplete="new-password"
          minLength={6}
          required
        />

        <SubmitButton loading={isLoading}>Reset password</SubmitButton>
      </form>

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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center text-sm text-text-muted">
          Loading...
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}

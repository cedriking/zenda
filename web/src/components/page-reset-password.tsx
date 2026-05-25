"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { apiFetch } from "@/lib/api-client";

export function ResetPasswordClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="flex min-h-screen flex-col pt-16">
        <Nav variant="simple" />
        <main className="flex flex-1 items-center justify-center px-6">
          <div className="w-full max-w-md text-center">
            <h1 className="mt-6 mb-2 font-bold text-2xl">Invalid Link</h1>
            <p className="mb-6 text-muted-foreground">
              This password reset link is invalid or has expired.
            </p>
            <Link
              className="text-primary hover:underline"
              href="/forgot-password"
            >
              Request a new reset link
            </Link>
          </div>
        </main>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await apiFetch("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, newPassword }),
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Password reset failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col pt-16">
      <Nav variant="simple" />

      <main className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="mt-6 mb-2 font-bold text-2xl">
              {success ? "Password Reset" : "Set New Password"}
            </h1>
            <p className="text-muted-foreground">
              {success
                ? "Your password has been reset successfully."
                : "Enter your new password below."}
            </p>
          </div>

          {success ? (
            <div className="text-center">
              <Link
                className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-6 py-2.5 font-medium text-sm text-white hover:bg-slate-800"
                href="/login"
              >
                Continue to Login
              </Link>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-destructive text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="mb-1.5 block font-medium text-sm">
                  New Password
                </label>
                <input
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
                  minLength={8}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  type="password"
                  value={newPassword}
                />
              </div>

              <div>
                <label className="mb-1.5 block font-medium text-sm">
                  Confirm Password
                </label>
                <input
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
                  minLength={8}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  required
                  type="password"
                  value={confirmPassword}
                />
              </div>

              <Button
                className="h-11 w-full text-sm"
                disabled={loading}
                type="submit"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

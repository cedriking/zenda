"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { apiFetch } from "@/lib/api-client";

export function ResetPasswordClient() {
  const t = useTranslations("resetPassword");
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
            <h1 className="mt-6 mb-2 font-bold text-2xl">
              {t("invalidTitle")}
            </h1>
            <p className="mb-6 text-muted-foreground">{t("invalidDesc")}</p>
            <Link
              className="text-primary hover:underline"
              href="/forgot-password"
            >
              {t("requestNewLink")}
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
      setError(t("errorTooShort"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t("errorMismatch"));
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
      setError(err instanceof Error ? err.message : t("errorResetFailed"));
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
              {success ? t("successTitle") : t("title")}
            </h1>
            <p className="text-muted-foreground">
              {success ? t("successDesc") : t("desc")}
            </p>
          </div>

          {success ? (
            <div className="text-center">
              <Link
                className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-6 py-2.5 font-medium text-sm text-white hover:bg-slate-800"
                href="/login"
              >
                {t("continueToLogin")}
              </Link>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div
                  className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-destructive text-sm"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <div>
                <label
                  className="mb-1.5 block font-medium text-sm"
                  htmlFor="new-password"
                >
                  {t("newPasswordLabel")}
                </label>
                <input
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
                  id="new-password"
                  minLength={8}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t("newPasswordPlaceholder")}
                  required
                  type="password"
                  value={newPassword}
                />
              </div>

              <div>
                <label
                  className="mb-1.5 block font-medium text-sm"
                  htmlFor="confirm-password"
                >
                  {t("confirmPasswordLabel")}
                </label>
                <input
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
                  id="confirm-password"
                  minLength={8}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t("confirmPasswordPlaceholder")}
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
                {loading ? t("resetting") : t("submit")}
              </Button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { apiFetch } from "@/lib/api-client";

export function ForgotPasswordClient() {
  const t = useTranslations("forgotPassword");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await apiFetch("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      // Always show success to prevent email enumeration
      setSent(true);
    } catch {
      // Still show success — the API also returns success regardless
      setSent(true);
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
              {sent ? t("checkEmail") : t("title")}
            </h1>
            <p className="text-muted-foreground">
              {sent ? t("sentDesc") : t("desc")}
            </p>
          </div>

          {sent ? (
            <div className="rounded-lg border bg-muted/50 p-6 text-center">
              <p className="mb-4 text-muted-foreground text-sm">
                {t("notReceived")}
              </p>
              <button
                className="text-primary text-sm hover:underline"
                onClick={() => setSent(false)}
                type="button"
              >
                {t("tryAgain")}
              </button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-destructive text-sm">
                  {error}
                </div>
              )}

              <div>
                <label
                  className="mb-1.5 block font-medium text-sm"
                  htmlFor="email"
                >
                  {t("emailLabel")}
                </label>
                <input
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
                  id="email"
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("emailPlaceholder")}
                  required
                  type="email"
                  value={email}
                />
              </div>

              <Button
                className="h-11 w-full text-sm"
                disabled={loading}
                type="submit"
              >
                {loading ? t("sending") : t("submit")}
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-muted-foreground text-sm">
            {t("rememberPassword")}{" "}
            <Link className="text-primary hover:underline" href="/login">
              {t("backToLogin")}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

import { ArrowLeft, Mail } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import LangToggle from "@/components/lang-toggle";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/services/api-client";
import { getPostAuthRoute, useAuthStore } from "@/stores/auth";
import { Link, useNavigate } from "@/utils/router";

export default function LoginPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const setAuth = useAuthStore((s) => s.setAuth);
  const setLoading = useAuthStore((s) => s.setLoading);
  const isLoading = useAuthStore((s) => s.isLoading);
  const navigate = useNavigate();

  // Password reset state
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: { email, password },
      });
      setAuth(data as Parameters<typeof setAuth>[0]);
      navigate(getPostAuthRoute());
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.loginFailed"));
      setLoading(false);
    }
  }

  async function handleResetSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResetError(null);
    setResetLoading(true);

    try {
      await apiFetch("/auth/reset-password", {
        method: "POST",
        body: { email: resetEmail },
      });
      setResetSent(true);
    } catch (err) {
      setResetError(err instanceof Error ? err.message : t("auth.sending"));
    } finally {
      setResetLoading(false);
    }
  }

  // Password reset view
  if (showReset) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-full max-w-sm space-y-6 p-8">
          <div className="flex items-center justify-between">
            <button
              aria-label={t("auth.backToLogin")}
              className="flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground"
              onClick={() => {
                setShowReset(false);
                setResetSent(false);
                setResetError(null);
              }}
            >
              <ArrowLeft size={16} />
              {t("auth.backToLogin")}
            </button>
            <LangToggle />
          </div>

          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Mail className="text-primary" size={24} />
            </div>
            <h1 className="font-bold text-2xl">{t("auth.resetPassword")}</h1>
            <p className="mt-1 text-muted-foreground">
              {resetSent ? t("auth.resetLinkSent") : t("auth.enterEmail")}
            </p>
          </div>

          {resetSent ? (
            <div className="rounded-md border border-border bg-emerald-500/10 p-4 text-emerald-600 text-sm">
              {t("auth.resetLinkSentDetail", { email: resetEmail })}
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleResetSubmit}>
              {resetError && (
                <div className="rounded-md bg-destructive/10 p-3 text-destructive text-sm">
                  {resetError}
                </div>
              )}

              <div className="space-y-2">
                <label className="font-medium text-sm" htmlFor="reset-email">
                  {t("auth.email")}
                </label>
                <input
                  autoFocus
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  id="reset-email"
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="you@business.com"
                  required
                  type="email"
                  value={resetEmail}
                />
              </div>

              <Button className="w-full" disabled={resetLoading} type="submit">
                {resetLoading ? t("auth.sending") : t("auth.sendResetLink")}
              </Button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Login view
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 p-8">
        <div className="text-center">
          <h1 className="font-bold text-2xl">{t("auth.loginHeading")}</h1>
          <p className="text-muted-foreground">{t("auth.aiReceptionist")}</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="font-medium text-sm" htmlFor="email">
              {t("auth.email")}
            </label>
            <input
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              id="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@business.com"
              required
              type="email"
              value={email}
            />
          </div>

          <div className="space-y-2">
            <label className="font-medium text-sm" htmlFor="password">
              {t("auth.password")}
            </label>
            <input
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              id="password"
              onChange={(e) => setPassword(e.target.value)}
              required
              type="password"
              value={password}
            />
          </div>

          <Button className="w-full" disabled={isLoading} type="submit">
            {isLoading ? t("auth.loggingIn") : t("auth.login")}
          </Button>
        </form>

        <p className="text-center text-muted-foreground text-sm">
          <button
            className="text-primary underline hover:no-underline"
            onClick={() => setShowReset(true)}
          >
            {t("auth.forgotPassword")}
          </button>
        </p>
        <p className="text-center text-muted-foreground text-sm">
          {t("auth.noAccount")}{" "}
          <Link className="text-primary underline" to="/auth/signup">
            {t("auth.createOne")}
          </Link>
        </p>

        <div className="flex justify-center">
          <LangToggle />
        </div>
      </div>
    </div>
  );
}

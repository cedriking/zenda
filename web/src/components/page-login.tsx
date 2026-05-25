"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@/i18n/navigation";
import { login } from "@/lib/api-client";

export function LoginPageClient() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(email, password);
      router.push("/download");
    } catch (err) {
      setError((err as Error).message);
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
            <h1 className="mt-6 mb-2 font-bold text-2xl">{t("loginTitle")}</h1>
            <p className="text-muted-foreground">{t("loginDesc")}</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-destructive text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="mb-1.5 block font-medium text-sm">
                {t("emailLabel")}
              </label>
              <input
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("emailPlaceholder")}
                required
                type="email"
                value={email}
              />
            </div>

            <div>
              <label className="mb-1.5 block font-medium text-sm">
                {t("passwordLabel")}
              </label>
              <input
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
                minLength={8}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("passwordPlaceholder")}
                required
                type="password"
                value={password}
              />
              <div className="mt-1.5 text-right">
                <Link
                  className="text-primary text-sm hover:underline"
                  href="/forgot-password"
                >
                  {t("forgotPassword")}
                </Link>
              </div>
            </div>

            <Button
              className="h-11 w-full text-sm"
              disabled={loading}
              type="submit"
            >
              {loading ? t("loginLoading") : t("loginButton")}
            </Button>
          </form>

          <p className="mt-6 text-center text-muted-foreground text-sm">
            {t("noAccount")}{" "}
            <Link className="text-primary underline" href="/signup">
              {t("signupLink")}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

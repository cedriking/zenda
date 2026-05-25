"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@/i18n/navigation";
import { signup } from "@/lib/api-client";

export function SignupPageClient() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordStrength = (() => {
    let score = 0;
    if (password.length >= 8) {
      score++;
    }
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) {
      score++;
    }
    if (/\d/.test(password)) {
      score++;
    }
    if (/[^A-Za-z0-9]/.test(password)) {
      score++;
    }
    return score;
  })();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError(t("passwordMinError"));
      return;
    }

    setLoading(true);

    try {
      await signup({ email, password, name, businessName });
      router.push("/download");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full border border-input rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent";

  return (
    <div className="flex min-h-screen flex-col pt-16">
      <Nav variant="simple" />

      <main className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="mt-6 mb-2 font-bold text-2xl">{t("signupTitle")}</h1>
            <p className="text-muted-foreground">{t("signupDesc")}</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-destructive text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="mb-1.5 block font-medium text-sm">
                {t("nameLabel")}
              </label>
              <input
                className={inputClass}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("namePlaceholder")}
                required
                type="text"
                value={name}
              />
            </div>

            <div>
              <label className="mb-1.5 block font-medium text-sm">
                {t("businessNameLabel")}
              </label>
              <input
                className={inputClass}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder={t("businessNamePlaceholder")}
                required
                type="text"
                value={businessName}
              />
            </div>

            <div>
              <label className="mb-1.5 block font-medium text-sm">
                {t("emailLabel")}
              </label>
              <input
                className={inputClass}
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
                className={inputClass}
                minLength={8}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("passwordSignupPlaceholder")}
                required
                type="password"
                value={password}
              />
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="mb-1 flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        className={`h-1 flex-1 rounded-full ${
                          passwordStrength >= i
                            ? passwordStrength <= 1
                              ? "bg-red-400"
                              : passwordStrength <= 2
                                ? "bg-yellow-400"
                                : passwordStrength <= 3
                                  ? "bg-primary"
                                  : "bg-green-500"
                            : "bg-muted"
                        }`}
                        key={i}
                      />
                    ))}
                  </div>
                  <p
                    className={`text-xs ${
                      passwordStrength <= 1
                        ? "text-red-500"
                        : passwordStrength <= 2
                          ? "text-yellow-600"
                          : passwordStrength <= 3
                            ? "text-primary"
                            : "text-green-600"
                    }`}
                  >
                    {passwordStrength <= 1
                      ? t("passwordWeak")
                      : passwordStrength <= 2
                        ? t("passwordFair")
                        : passwordStrength <= 3
                          ? t("passwordGood")
                          : t("passwordStrong")}
                  </p>
                </div>
              )}
            </div>

            <Button
              className="h-11 w-full text-sm"
              disabled={loading}
              type="submit"
            >
              {loading ? t("signupLoading") : t("signupButton")}
            </Button>

            <p className="text-center text-muted-foreground text-xs">
              {t("agreeToTerms", {
                terms: t("termsLink"),
                privacy: t("privacyLink"),
              })}
            </p>
          </form>

          <p className="mt-6 text-center text-muted-foreground text-sm">
            {t("haveAccount")}{" "}
            <Link className="text-primary underline" href="/login">
              {t("loginLink")}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

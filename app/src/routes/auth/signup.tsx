import { supportedLanguages, type UILanguage } from "@zenda/shared/i18n";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { detectSystemLanguage, setAppLanguage } from "@/actions/language";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/services/api-client";
import { getPostAuthRoute, useAuthStore } from "@/stores/auth";
import { Link, useNavigate } from "@/utils/router";

export default function SignupPage() {
  const { t, i18n } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [language, setLanguage] = useState<UILanguage>(detectSystemLanguage());
  const [error, setError] = useState<string | null>(null);
  const setAuth = useAuthStore((s) => s.setAuth);
  const setLoading = useAuthStore((s) => s.setLoading);
  const isLoading = useAuthStore((s) => s.isLoading);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(t("auth.passwordMismatch"));
      return;
    }

    setLoading(true);

    try {
      const data = await apiFetch("/auth/signup", {
        method: "POST",
        body: { name, email, password, businessName, language },
      });
      setAuth(data as Parameters<typeof setAuth>[0]);
      navigate(getPostAuthRoute());
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.signupFailed"));
      setLoading(false);
    }
  }

  function handleLanguageChange(lang: string) {
    const uiLang = lang as UILanguage;
    setLanguage(uiLang);
    setAppLanguage(uiLang, i18n);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 p-8">
        <div className="text-center">
          <h1 className="font-bold text-2xl">{t("auth.createAccount")}</h1>
          <p className="text-muted-foreground">{t("auth.setupReceptionist")}</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="font-medium text-sm" htmlFor="name">
              {t("auth.name")}
            </label>
            <input
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              id="name"
              onChange={(e) => setName(e.target.value)}
              required
              type="text"
              value={name}
            />
          </div>

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
              minLength={8}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("auth.minChars")}
              required
              type="password"
              value={password}
            />
          </div>

          <div className="space-y-2">
            <label className="font-medium text-sm" htmlFor="confirmPassword">
              {t("auth.confirmPassword")}
            </label>
            <input
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              id="confirmPassword"
              minLength={8}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t("auth.reEnterPassword")}
              required
              type="password"
              value={confirmPassword}
            />
          </div>

          <div className="space-y-2">
            <label className="font-medium text-sm" htmlFor="businessName">
              {t("auth.businessName")}
            </label>
            <input
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              id="businessName"
              onChange={(e) => setBusinessName(e.target.value)}
              required
              type="text"
              value={businessName}
            />
          </div>

          <div className="space-y-2">
            <label className="font-medium text-sm" htmlFor="language">
              {t("auth.language")}
            </label>
            <select
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              id="language"
              onChange={(e) => handleLanguageChange(e.target.value)}
              value={language}
            >
              {supportedLanguages.map((lang) => (
                <option key={lang.key} value={lang.key}>
                  {lang.nativeName}
                </option>
              ))}
            </select>
          </div>

          <Button className="w-full" disabled={isLoading} type="submit">
            {isLoading ? t("auth.creatingAccount") : t("auth.signup")}
          </Button>
        </form>

        <p className="text-center text-muted-foreground text-sm">
          {t("auth.hasAccount")}{" "}
          <Link className="text-primary underline" to="/auth/login">
            {t("auth.login")}
          </Link>
        </p>
      </div>
    </div>
  );
}

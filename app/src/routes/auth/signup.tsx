import { supportedLanguages, type UILanguage } from "@zenda/shared/i18n";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { detectSystemLanguage, setAppLanguage } from "@/actions/language";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/services/api-client";
import { getPostAuthRoute, useAuthStore } from "@/stores/auth";
import { Link, useNavigate } from "@/utils/router";

const REGEX_UPPERCASE = /[A-Z]/;
const REGEX_DIGIT = /[0-9]/;
const REGEX_SPECIAL = /[^A-Za-z0-9]/;

function getStrengthLabel(
  strength: number,
  t: (key: string) => string
): string {
  if (strength === 0) {
    return "";
  }
  if (strength <= 1) {
    return t("auth.strengthWeak");
  }
  if (strength <= 2) {
    return t("auth.strengthFair");
  }
  if (strength <= 3) {
    return t("auth.strengthGood");
  }
  return t("auth.strengthStrong");
}

function getStrengthColor(strength: number): string {
  if (strength <= 1) {
    return "bg-red-500";
  }
  if (strength <= 2) {
    return "bg-amber-500";
  }
  if (strength <= 3) {
    return "bg-emerald-400";
  }
  return "bg-emerald-600";
}

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

  function getPasswordStrength(pwd: string): number {
    if (!pwd) {
      return 0;
    }
    let score = 0;
    if (pwd.length >= 8) {
      score++;
    }
    if (REGEX_UPPERCASE.test(pwd)) {
      score++;
    }
    if (REGEX_DIGIT.test(pwd)) {
      score++;
    }
    if (REGEX_SPECIAL.test(pwd)) {
      score++;
    }
    return score;
  }

  const strength = getPasswordStrength(password);
  const strengthLabel = getStrengthLabel(strength, t);
  const strengthColor = getStrengthColor(strength);

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
            <div
              className="rounded-md bg-destructive/10 p-3 text-destructive text-sm"
              role="alert"
            >
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
            {password && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        level <= strength ? strengthColor : "bg-border"
                      }`}
                      key={level}
                    />
                  ))}
                </div>
                <p className="text-muted-foreground text-xs">{strengthLabel}</p>
              </div>
            )}
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

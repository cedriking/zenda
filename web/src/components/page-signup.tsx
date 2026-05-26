"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { trackAdsConversion, trackSignup } from "@/components/google-analytics";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@/i18n/navigation";
import { signup } from "@/lib/api-client";
import { captureUtmParams } from "@/lib/tracking";

const HAS_UPPER = /[A-Z]/;
const HAS_LOWER = /[a-z]/;
const HAS_DIGIT = /\d/;
const HAS_SPECIAL = /[^A-Za-z0-9]/;

function getStrengthColor(strength: number, active: boolean): string {
  if (!active) {
    return "bg-muted";
  }
  if (strength <= 1) {
    return "bg-red-400";
  }
  if (strength <= 2) {
    return "bg-yellow-400";
  }
  if (strength <= 3) {
    return "bg-primary";
  }
  return "bg-green-500";
}

function getStrengthTextColor(strength: number): string {
  if (strength <= 1) {
    return "text-red-500";
  }
  if (strength <= 2) {
    return "text-yellow-600";
  }
  if (strength <= 3) {
    return "text-primary";
  }
  return "text-green-600";
}

export function SignupPageClient() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkoutTier = searchParams.get("checkout");
  const isFounding = searchParams.get("founding") === "true";

  // Capture UTM params on mount
  useEffect(() => {
    captureUtmParams(searchParams);
  }, [searchParams]);

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
    if (HAS_UPPER.test(password) && HAS_LOWER.test(password)) {
      score++;
    }
    if (HAS_DIGIT.test(password)) {
      score++;
    }
    if (HAS_SPECIAL.test(password)) {
      score++;
    }
    return score;
  })();

  const strengthLabel = (() => {
    if (passwordStrength <= 1) {
      return t("passwordWeak");
    }
    if (passwordStrength <= 2) {
      return t("passwordFair");
    }
    if (passwordStrength <= 3) {
      return t("passwordGood");
    }
    return t("passwordStrong");
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

      // Fire conversion tracking
      trackSignup("email");
      trackAdsConversion();

      if (checkoutTier) {
        const params = new URLSearchParams({ tier: checkoutTier });
        if (isFounding) {
          params.set("founding", "true");
        }
        router.push(`/checkout?${params.toString()}`);
      } else {
        router.push("/download");
      }
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
            {isFounding && (
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 font-medium text-primary text-sm">
                <span>&#127881;</span>
                <span>{t("foundingBadge")}</span>
              </div>
            )}
            <h1 className="mt-6 mb-2 font-bold text-2xl">{t("signupTitle")}</h1>
            <p className="text-muted-foreground">{t("signupDesc")}</p>
          </div>

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
                htmlFor="name"
              >
                {t("nameLabel")}
              </label>
              <input
                className={inputClass}
                id="name"
                onChange={(e) => setName(e.target.value)}
                placeholder={t("namePlaceholder")}
                required
                type="text"
                value={name}
              />
            </div>

            <div>
              <label
                className="mb-1.5 block font-medium text-sm"
                htmlFor="businessName"
              >
                {t("businessNameLabel")}
              </label>
              <input
                className={inputClass}
                id="businessName"
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder={t("businessNamePlaceholder")}
                required
                type="text"
                value={businessName}
              />
            </div>

            <div>
              <label
                className="mb-1.5 block font-medium text-sm"
                htmlFor="email"
              >
                {t("emailLabel")}
              </label>
              <input
                className={inputClass}
                id="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("emailPlaceholder")}
                required
                type="email"
                value={email}
              />
            </div>

            <div>
              <label
                className="mb-1.5 block font-medium text-sm"
                htmlFor="password"
              >
                {t("passwordLabel")}
              </label>
              <input
                className={inputClass}
                id="password"
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
                        className={`h-1 flex-1 rounded-full ${getStrengthColor(passwordStrength, passwordStrength >= i)}`}
                        key={i}
                      />
                    ))}
                  </div>
                  <p
                    className={`text-xs ${getStrengthTextColor(passwordStrength)}`}
                  >
                    {strengthLabel}
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

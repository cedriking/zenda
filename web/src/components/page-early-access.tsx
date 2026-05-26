"use client";

import { PartyPopper } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { apiFetch } from "@/lib/api-client";

export function EarlyAccessPageClient() {
  const t = useTranslations("earlyAccess");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await apiFetch("/support/waitlist", {
        method: "POST",
        body: JSON.stringify({ email, name, businessType }),
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("submitError"));
    }
    setLoading(false);
  }

  const inputClass =
    "w-full border border-input rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="flex min-h-screen flex-col pt-16">
      <Nav variant="simple" />

      <main className="mx-auto max-w-lg flex-1 px-6 py-20 text-center">
        {submitted ? (
          <>
            <PartyPopper className="mx-auto mb-6 size-12 text-primary" />
            <h1 className="mb-4 font-bold text-3xl">{t("successTitle")}</h1>
            <p className="mb-8 text-lg text-muted-foreground">
              {t("successDesc", { email })}
            </p>
            <Link className="text-primary underline" href="/">
              {t("backHome")}
            </Link>
          </>
        ) : (
          <>
            <div className="mb-6 inline-block rounded-full bg-amber-100 px-4 py-1.5 font-semibold text-amber-800 text-sm">
              {t("badge")}
            </div>
            <h1 className="mb-4 font-bold text-4xl">{t("title")}</h1>
            <p className="mb-8 text-lg text-muted-foreground">{t("desc")}</p>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-red-600 text-sm">
                {error}
              </div>
            )}

            <form className="space-y-4 text-left" onSubmit={handleSubmit}>
              <div>
                <label className="mb-1.5 block font-medium text-sm">
                  {t("nameLabel")}
                </label>
                <input
                  className={inputClass}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("namePlaceholder")}
                  type="text"
                  value={name}
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
                  {t("businessTypeLabel")}
                </label>
                <select
                  className={inputClass}
                  onChange={(e) => setBusinessType(e.target.value)}
                  value={businessType}
                >
                  <option value="">{t("selectIndustry")}</option>
                  <option value="beauty">{t("beauty")}</option>
                  <option value="wellness">{t("wellness")}</option>
                  <option value="health">{t("health")}</option>
                  <option value="fitness">{t("fitness")}</option>
                  <option value="coaching">{t("coaching")}</option>
                  <option value="other">{t("other")}</option>
                </select>
              </div>
              <Button
                className="h-11 w-full text-sm"
                disabled={loading}
                type="submit"
              >
                {loading ? t("joining") : t("joinButton")}
              </Button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}

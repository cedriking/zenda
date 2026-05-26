"use client";

import { CheckCircle, Copy, ExternalLink, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function PartnerSignupForm() {
  const t = useTranslations("Partners");
  const [step, setStep] = useState<"form" | "success">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [howRefer, setHowRefer] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [referralLink, setReferralLink] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!(name && email)) {
      setError(t("formErrorRequired"));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/partners/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, website, howRefer }),
      });

      const data = (await res.json()) as {
        error?: string;
        referralCode?: string;
        referralLink?: string;
      };

      if (!res.ok) {
        setError(data.error || t("formErrorGeneric"));
        return;
      }

      setReferralCode(data.referralCode || "");
      setReferralLink(data.referralLink || "");
      setStep("success");
    } catch {
      setError(t("formErrorGeneric"));
    } finally {
      setLoading(false);
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (step === "success") {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-green-200 bg-green-50 p-8 text-center dark:border-green-800 dark:bg-green-950">
        <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-600" />
        <h3 className="mb-2 font-semibold text-green-800 text-xl dark:text-green-200">
          {t("signupSuccessTitle")}
        </h3>
        <p className="mb-6 text-green-700 dark:text-green-300">
          {t("signupSuccessDescription")}
        </p>

        <div className="mb-4 rounded-lg bg-white p-4 dark:bg-gray-900">
          <p className="mb-1 text-gray-500 text-sm">{t("yourReferralCode")}</p>
          <p className="mb-3 font-bold font-mono text-2xl text-zenda-600">
            {referralCode}
          </p>
          <p className="mb-2 text-gray-500 text-sm">{t("yourReferralLink")}</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded bg-gray-100 px-3 py-2 text-xs dark:bg-gray-800">
              {referralLink}
            </code>
            <Button onClick={copyLink} size="sm" variant="outline">
              <Copy className="mr-1 h-3 w-3" />
              {copied ? t("copied") : t("copy")}
            </Button>
          </div>
        </div>

        <Button asChild className="mt-2" variant="outline">
          <a href={referralLink} rel="noopener noreferrer" target="_blank">
            <ExternalLink className="mr-2 h-4 w-4" />
            {t("testYourLink")}
          </a>
        </Button>
      </div>
    );
  }

  return (
    <form className="mx-auto max-w-lg space-y-4" onSubmit={handleSubmit}>
      <div>
        <label
          className="mb-1 block font-medium text-gray-700 text-sm dark:text-gray-300"
          htmlFor="partner-name"
        >
          {t("fieldName")} *
        </label>
        <input
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm dark:border-gray-600 dark:bg-gray-800"
          id="partner-name"
          onChange={(e) => setName(e.target.value)}
          placeholder={t("fieldNamePlaceholder")}
          required
          type="text"
          value={name}
        />
      </div>

      <div>
        <label
          className="mb-1 block font-medium text-gray-700 text-sm dark:text-gray-300"
          htmlFor="partner-email"
        >
          {t("fieldEmail")} *
        </label>
        <input
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm dark:border-gray-600 dark:bg-gray-800"
          id="partner-email"
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          required
          type="email"
          value={email}
        />
      </div>

      <div>
        <label
          className="mb-1 block font-medium text-gray-700 text-sm dark:text-gray-300"
          htmlFor="partner-website"
        >
          {t("fieldWebsite")}
        </label>
        <input
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm dark:border-gray-600 dark:bg-gray-800"
          id="partner-website"
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://tusitio.com o @tuhandle"
          type="text"
          value={website}
        />
      </div>

      <div>
        <label
          className="mb-1 block font-medium text-gray-700 text-sm dark:text-gray-300"
          htmlFor="partner-how-refer"
        >
          {t("fieldHowRefer")}
        </label>
        <textarea
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm dark:border-gray-600 dark:bg-gray-800"
          id="partner-how-refer"
          onChange={(e) => setHowRefer(e.target.value)}
          placeholder={t("fieldHowReferPlaceholder")}
          rows={3}
          value={howRefer}
        />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <Button
        className="w-full bg-zenda-600 hover:bg-zenda-700"
        disabled={loading}
        size="lg"
        type="submit"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t("submitting")}
          </>
        ) : (
          t("submitCta")
        )}
      </Button>
    </form>
  );
}

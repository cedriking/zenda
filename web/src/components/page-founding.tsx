"use client";

import { CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { trackAdsConversion, trackSignup } from "@/components/google-analytics";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { apiFetch } from "@/lib/api-client";
import {
  captureUtmParams,
  getStoredReferralCode,
  getStoredUtmParams,
} from "@/lib/tracking";

export function FoundingPageClient({ locale }: { locale: string }) {
  const t = useTranslations("founding");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"form" | "success">("form");

  // Capture UTM params on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      captureUtmParams(new URLSearchParams(window.location.search));
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError(t("errorPasswordMin"));
      return;
    }

    setLoading(true);

    try {
      const utm = getStoredUtmParams();
      const referralCode = getStoredReferralCode();

      await apiFetch("/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          name,
          businessName,
          language: locale,
          source: "founding",
          ...utm,
          ...(referralCode ? { referralCode } : {}),
        }),
      });

      // Fire conversion tracking
      trackSignup("email");
      trackAdsConversion();

      setStep("success");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (step === "success") {
    return (
      <main className="flex items-center justify-center px-6 py-20">
        <div className="max-w-lg text-center">
          <div className="mb-6">
            <CheckCircle
              aria-hidden="true"
              className="mx-auto size-16 text-emerald-500"
            />
            <span className="sr-only">{t("successTitle")}</span>
          </div>
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            {t("successTitle")}
          </h2>
          <p className="mb-8 text-slate-600">{t("successBody")}</p>
          <Button
            className="rounded-full bg-slate-900 px-8 py-3 text-white hover:bg-slate-800"
            onClick={() => router.push("/pricing?founding=true")}
          >
            {t("successCta")}
          </Button>
        </div>
      </main>
    );
  }

  const features = [1, 2, 3, 4, 5].map((i) => ({
    id: `feature-${i}`,
    title: t(`feature${i}Title`),
    desc: t(`feature${i}Desc`),
  }));

  const steps = [1, 2, 3].map((i) => ({
    id: `step-${i}`,
    num: i,
    title: t(`step${i}Title`),
    desc: t(`step${i}Desc`),
  }));

  return (
    <main className="px-6 py-20">
      <div className="mx-auto max-w-4xl">
        {/* Hero */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-block rounded-full bg-emerald-100 px-4 py-1.5 font-semibold text-emerald-700 text-sm">
            {t("badge")}
          </div>
          <h1 className="mb-4 font-black text-4xl text-slate-900 md:text-5xl">
            {t("heroTitle")}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            {t("heroSubtitle")}
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 font-bold text-emerald-700 text-sm">
              {t("trialBadge")}
            </span>
            <span className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 font-bold text-blue-700 text-sm">
              {t("discountBadge")}
            </span>
          </div>
        </div>

        {/* Features */}
        <div className="mb-16">
          <h2 className="mb-8 text-center font-bold text-2xl text-slate-900">
            {t("whatYouGet")}
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {features.slice(0, 3).map((f) => (
              <div
                className="rounded-2xl border border-slate-100 bg-white p-6 shadow-lg"
                key={f.id}
              >
                <h3 className="mb-2 font-bold text-slate-900">{f.title}</h3>
                <p className="text-slate-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
          <div className="mx-auto mt-6 grid max-w-2xl gap-6 md:grid-cols-2">
            {features.slice(3).map((f) => (
              <div
                className="rounded-2xl border border-slate-100 bg-white p-6 shadow-lg"
                key={f.id}
              >
                <h3 className="mb-2 font-bold text-slate-900">{f.title}</h3>
                <p className="text-slate-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="mb-16">
          <h2 className="mb-8 text-center font-bold text-2xl text-slate-900">
            {t("howItWorks")}
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <div className="text-center" key={s.id}>
                <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 font-bold text-lg text-white">
                  {s.num}
                </div>
                <h3 className="mb-2 font-bold text-slate-900">{s.title}</h3>
                <p className="text-slate-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* WhatsApp Chat Demo */}
        <div className="mb-16">
          <h2 className="mb-4 text-center font-bold text-2xl text-slate-900">
            {t("demoTitle")}
          </h2>
          <p className="mb-6 text-center text-slate-500 text-sm">
            {t("demoSubtitle")}
          </p>
          <div className="mx-auto max-w-sm overflow-hidden rounded-2xl border border-green-200 bg-green-50 shadow-lg">
            <div className="flex items-center gap-3 bg-green-600 px-4 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <svg
                  className="h-5 w-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-sm text-white">
                  {t("demoBusiness")}
                </p>
                <p className="text-green-100 text-xs">{t("demoOnline")}</p>
              </div>
            </div>
            <div className="space-y-2 bg-[#e5ddd5] px-3 py-4">
              {/* Client message */}
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-lg rounded-tr-none bg-green-100 px-3 py-2 shadow-sm">
                  <p className="text-slate-800 text-sm">{t("demoMsg1")}</p>
                  <p className="mt-1 text-right text-[10px] text-green-700">
                    10:32 ✓✓
                  </p>
                </div>
              </div>
              {/* Zenda response */}
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-lg rounded-tl-none bg-white px-3 py-2 shadow-sm">
                  <p className="whitespace-pre-line text-slate-800 text-sm">
                    {t("demoMsg2")}
                  </p>
                  <p className="mt-1 text-right text-[10px] text-slate-400">
                    10:32
                  </p>
                </div>
              </div>
              {/* Client reply */}
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-lg rounded-tr-none bg-green-100 px-3 py-2 shadow-sm">
                  <p className="text-slate-800 text-sm">{t("demoMsg3")}</p>
                  <p className="mt-1 text-right text-[10px] text-green-700">
                    10:33 ✓✓
                  </p>
                </div>
              </div>
              {/* Zenda confirmation */}
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-lg rounded-tl-none bg-white px-3 py-2 shadow-sm">
                  <p className="whitespace-pre-line text-slate-800 text-sm">
                    {t("demoMsg4")}
                  </p>
                  <p className="mt-1 text-right text-[10px] text-slate-400">
                    10:33
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-green-50 px-3 py-2">
              <div className="flex-1 rounded-full bg-white px-4 py-2 text-slate-400 text-sm">
                {t("demoPlaceholder")}
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-600">
                <svg
                  className="h-4 w-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonial */}
        <div className="mb-16 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
          <blockquote className="mb-4 text-lg text-slate-700 italic">
            {t("testimonial1")}
          </blockquote>
          <p className="text-slate-500 text-sm">{t("testimonial1Author")}</p>
        </div>

        {/* FAQ */}
        <div className="mx-auto mb-16 max-w-2xl">
          <h2 className="mb-8 text-center font-bold text-2xl text-slate-900">
            {t("faqTitle")}
          </h2>
          {[1, 2, 3, 4].map((i) => (
            <div className="mb-4" key={`faq-${i}`}>
              <h3 className="font-semibold text-slate-900">{t(`faq${i}Q`)}</h3>
              <p className="mt-1 text-slate-600 text-sm">{t(`faq${i}A`)}</p>
            </div>
          ))}
        </div>

        {/* Signup Form */}
        <div className="mx-auto max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-xl">
          <h2 className="mb-6 text-center font-bold text-slate-900 text-xl">
            {t("formTitle")}
          </h2>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-red-600 text-sm">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                className="mb-1 block font-medium text-slate-700 text-sm"
                htmlFor="founding-name"
              >
                {t("labelName")}
              </label>
              <input
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                id="founding-name"
                onChange={(e) => setName(e.target.value)}
                required
                type="text"
                value={name}
              />
            </div>
            <div>
              <label
                className="mb-1 block font-medium text-slate-700 text-sm"
                htmlFor="founding-business"
              >
                {t("labelBusiness")}
              </label>
              <input
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                id="founding-business"
                onChange={(e) => setBusinessName(e.target.value)}
                required
                type="text"
                value={businessName}
              />
            </div>
            <div>
              <label
                className="mb-1 block font-medium text-slate-700 text-sm"
                htmlFor="founding-email"
              >
                {t("labelEmail")}
              </label>
              <input
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                id="founding-email"
                onChange={(e) => setEmail(e.target.value)}
                required
                type="email"
                value={email}
              />
            </div>
            <div>
              <label
                className="mb-1 block font-medium text-slate-700 text-sm"
                htmlFor="founding-password"
              >
                {t("labelPassword")}
              </label>
              <input
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                id="founding-password"
                onChange={(e) => setPassword(e.target.value)}
                required
                type="password"
                value={password}
              />
            </div>
            <Button
              className="w-full rounded-full bg-emerald-600 py-3 font-semibold text-sm text-white hover:bg-emerald-700 disabled:opacity-50"
              disabled={loading}
              type="submit"
            >
              {loading ? t("submitting") : t("submit")}
            </Button>
          </form>

          <p className="mt-4 text-center text-slate-400 text-xs">
            {t("formDisclaimer")}
          </p>
        </div>

        {/* Spots remaining */}
        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">{t("spotsRemaining")}</p>
        </div>
      </div>
    </main>
  );
}

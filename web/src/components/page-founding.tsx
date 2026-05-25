"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { apiFetch } from "@/lib/api-client";

interface FoundingPageClientProps {
  locale: string;
  strings: Record<string, string>;
}

export function FoundingPageClient({ strings, locale }: FoundingPageClientProps) {
  const t = (key: string) => strings[key] ?? key;
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"form" | "success">("form");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError(t("errorPasswordMin"));
      return;
    }

    setLoading(true);

    try {
      await apiFetch("/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          name,
          businessName,
          language: locale,
          source: "founding",
        }),
      });
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
          <div className="mb-6 text-6xl">&#10003;</div>
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            {t("successTitle")}
          </h2>
          <p className="mb-8 text-slate-600">{t("successBody")}</p>
          <Button
            className="rounded-full bg-slate-900 px-8 py-3 text-white hover:bg-slate-800"
            onClick={() => router.push("/download")}
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
            FAQ
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

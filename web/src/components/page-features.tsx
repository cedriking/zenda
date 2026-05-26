import {
  Bell,
  Bot,
  Brain,
  Calendar,
  MessageSquare,
  Settings,
  Shield,
  UserCheck,
} from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";

import { Footer } from "@/components/footer";
import { JsonLdScript } from "@/components/json-ld";
import { Nav } from "@/components/nav";
import { Link } from "@/i18n/navigation";

const CORE_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  "💬": MessageSquare,
  "🤖": Bot,
  "📅": Calendar,
  "🔔": Bell,
  "🧠": Brain,
  "👤": UserCheck,
};

const DETAIL_ICONS = [MessageSquare, Calendar, Settings, Shield];

export async function FeaturesPage() {
  const t = await getTranslations("features");
  const tHome = await getTranslations("home");
  const locale = await getLocale();

  const softwareLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    applicationCategory: "BusinessApplication",
    description: t("metaDesc"),
    name: "Zenda",
    offers: {
      "@type": "Offer",
      category: "SaaS",
      price: "29",
      priceCurrency: "USD",
    },
    operatingSystem: "WhatsApp",
    url: `https://zenda.bot/${locale}/features`,
  };

  const coreFeatures = [
    {
      desc: tHome("capWhatsappDesc"),
      emoji: "💬",
      title: tHome("capWhatsappTitle"),
    },
    {
      desc: tHome("capAiDesc"),
      emoji: "🤖",
      title: tHome("capAiTitle"),
    },
    {
      desc: tHome("capSchedulingDesc"),
      emoji: "📅",
      title: tHome("capSchedulingTitle"),
    },
    {
      desc: tHome("capRemindersDesc"),
      emoji: "🔔",
      title: tHome("capRemindersTitle"),
    },
    {
      desc: tHome("capLearningDesc"),
      emoji: "🧠",
      title: tHome("capLearningTitle"),
    },
    {
      desc: tHome("capTakeoverDesc"),
      emoji: "👤",
      title: tHome("capTakeoverTitle"),
    },
  ];

  const detailedFeatures = [
    {
      desc: tHome("featureChatDesc"),
      title: tHome("featureChatTitle"),
    },
    {
      desc: tHome("featureCalendarDesc"),
      title: tHome("featureCalendarTitle"),
    },
    {
      desc: tHome("featureSettingsDesc"),
      title: tHome("featureSettingsTitle"),
    },
    {
      desc: tHome("featureSafetyDesc"),
      title: tHome("featureSafetyTitle"),
    },
  ];

  const safetyFeatures = [
    {
      desc: tHome("safetyConsentDesc"),
      title: tHome("safetyConsentTitle"),
    },
    {
      desc: tHome("safetyLimitsDesc"),
      title: tHome("safetyLimitsTitle"),
    },
    {
      desc: tHome("safetyAuditDesc"),
      title: tHome("safetyAuditTitle"),
    },
    {
      desc: tHome("safetyGuardrailsDesc"),
      title: tHome("safetyGuardrailsTitle"),
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-neutral-200 pt-16">
      <JsonLdScript data={softwareLd} />
      <Nav variant="simple" />

      <main className="relative flex-1 overflow-hidden">
        {/* Hero */}
        <div className="rounded-b-[2rem] bg-white shadow-2xl">
          <section className="relative overflow-hidden px-6 py-20">
            <div className="absolute top-0 right-0 h-[400px] w-[400px] translate-x-1/4 -translate-y-1/2 rounded-full bg-emerald-500/5" />
            <div className="mx-auto max-w-4xl text-center">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-1.5 font-semibold text-emerald-700 text-xs uppercase tracking-wider">
                {t("badge")}
              </span>
              <h1 className="mb-6 font-black text-4xl text-slate-900 md:text-5xl">
                {t("heroTitle")}
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-slate-500">
                {t("heroDesc")}
              </p>
            </div>
          </section>

          {/* Core features grid */}
          <section className="px-6 py-16">
            <div className="mx-auto max-w-5xl">
              <h2 className="mb-12 text-center font-black text-3xl text-slate-900">
                {t("coreTitle")}
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {coreFeatures.map((f) => {
                  const Icon = CORE_ICONS[f.emoji];
                  return (
                    <div
                      className="rounded-2xl border border-neutral-100 bg-neutral-50 p-6 transition-shadow hover:shadow-lg"
                      key={f.title}
                    >
                      {Icon ? (
                        <Icon
                          aria-hidden="true"
                          className="mb-3 size-8 text-emerald-600"
                        />
                      ) : (
                        <span className="mb-3 block text-3xl">{f.emoji}</span>
                      )}
                      <h3 className="mb-2 font-bold text-lg text-slate-900">
                        {f.title}
                      </h3>
                      <p className="text-slate-500 text-sm">{f.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>

        {/* Detailed features */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-12 text-center font-black text-3xl text-slate-900">
              {t("detailsTitle")}
            </h2>
            <div className="space-y-8">
              {detailedFeatures.map((f, i) => {
                const Icon = DETAIL_ICONS[i];
                return (
                  <div
                    className={`flex flex-col items-center gap-6 rounded-[2rem] bg-white p-8 shadow-lg md:flex-row ${i % 2 === 1 ? "md:flex-row-reverse" : ""}`}
                    key={f.title}
                  >
                    <div className="flex-1">
                      <h3 className="mb-3 font-bold text-slate-900 text-xl">
                        {f.title}
                      </h3>
                      <p className="text-slate-500">{f.desc}</p>
                    </div>
                    <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-2xl bg-emerald-50">
                      {Icon && (
                        <Icon
                          aria-hidden="true"
                          className="size-12 text-emerald-600"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Safety & compliance */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-[2rem] bg-slate-950 p-8 md:p-12">
              <div className="mb-10 text-center">
                <h2 className="mb-4 font-black text-2xl text-white md:text-3xl">
                  {tHome("safetyTitle")}
                </h2>
                <p className="text-slate-400">{tHome("safetyDesc")}</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {safetyFeatures.map((f) => (
                  <div className="rounded-xl bg-slate-900 p-6" key={f.title}>
                    <h3 className="mb-2 font-semibold text-emerald-400">
                      {f.title}
                    </h3>
                    <p className="text-slate-400 text-sm">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-4 font-black text-3xl text-slate-900">
              {t("ctaTitle")}
            </h2>
            <p className="mb-8 text-slate-500">{t("ctaDesc")}</p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-8 py-3.5 font-semibold text-base text-white shadow-emerald-500/25 shadow-xl transition-colors hover:bg-emerald-600"
                href="/signup"
              >
                {t("ctaButton")}
              </Link>
              <Link
                className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white px-8 py-3.5 font-semibold text-base text-neutral-700 transition-colors hover:border-emerald-500 hover:text-emerald-600"
                href="/pricing"
              >
                {t("ctaSecondary")}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

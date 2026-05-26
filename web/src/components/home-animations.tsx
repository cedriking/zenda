"use client";

import {
  ArrowRight,
  Bell,
  Bot,
  Brain,
  CalendarClock,
  Heart,
  MessageSquare,
  Scissors,
  Shield,
  Smartphone,
  Sparkles,
  Star,
  Stethoscope,
  UserCheck,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import {
  AccordionItem,
  FadeUp,
  StaggerChild,
  StaggerContainer,
} from "@/components/motion";
import { Link } from "@/i18n/navigation";

/* ── Section label ── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-1.5 font-semibold text-emerald-700 text-xs uppercase tracking-wider">
      {children}
    </span>
  );
}

/* ── Static data builders (called once per render, but keep outside for clarity) ── */

/* ── Main component ── */
export function HomeAnimations({
  variant,
}: {
  variant:
    | "hero"
    | "audiences"
    | "capabilities"
    | "features"
    | "safety"
    | "how-it-works"
    | "dashboard"
    | "industries"
    | "pricing-teaser"
    | "faq"
    | "cta";
  children?: React.ReactNode;
}) {
  const t = useTranslations("home");
  const locale = useLocale();

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);

  /* ── Memoized data arrays ── */
  const HERO_VALUES = useMemo(
    () => [
      { value: t("heroValue247"), label: t("heroValue247Label") },
      { value: t("heroValueBilingual"), label: t("heroValueBilingualLabel") },
      { value: t("heroValueSetup"), label: t("heroValueSetupLabel") },
    ],
    [t]
  );

  const AUDIENCES = useMemo(
    () => [
      {
        icon: Scissors,
        title: t("audienceBeautyTitle"),
        desc: t("audienceBeautyDesc"),
      },
      {
        icon: Heart,
        title: t("audienceWellnessTitle"),
        desc: t("audienceWellnessDesc"),
      },
      {
        icon: Stethoscope,
        title: t("audienceHealthTitle"),
        desc: t("audienceHealthDesc"),
      },
      {
        icon: Star,
        title: t("audienceOtherTitle"),
        desc: t("audienceOtherDesc"),
      },
    ],
    [t]
  );

  const CAPABILITIES = useMemo(
    () => [
      { icon: Bot, title: t("capAiTitle"), desc: t("capAiDesc") },
      {
        icon: CalendarClock,
        title: t("capSchedulingTitle"),
        desc: t("capSchedulingDesc"),
      },
      {
        icon: Bell,
        title: t("capRemindersTitle"),
        desc: t("capRemindersDesc"),
      },
      { icon: Brain, title: t("capLearningTitle"), desc: t("capLearningDesc") },
      {
        icon: UserCheck,
        title: t("capTakeoverTitle"),
        desc: t("capTakeoverDesc"),
      },
      {
        icon: Smartphone,
        title: t("capWhatsappTitle"),
        desc: t("capWhatsappDesc"),
      },
    ],
    [t]
  );

  const FEATURE_SECTIONS = useMemo(
    () => [
      {
        title: t("featureChatTitle"),
        desc: t("featureChatDesc"),
        visual: "chat" as const,
      },
      {
        title: t("featureCalendarTitle"),
        desc: t("featureCalendarDesc"),
        visual: "calendar" as const,
      },
      {
        title: t("featureSettingsTitle"),
        desc: t("featureSettingsDesc"),
        visual: "settings" as const,
      },
      {
        title: t("featureSafetyTitle"),
        desc: t("featureSafetyDesc"),
        visual: "safety" as const,
      },
    ],
    [t]
  );

  const SAFETY_PILLARS = useMemo(
    () => [
      { title: t("safetyConsentTitle"), desc: t("safetyConsentDesc") },
      { title: t("safetyLimitsTitle"), desc: t("safetyLimitsDesc") },
      { title: t("safetyAuditTitle"), desc: t("safetyAuditDesc") },
      { title: t("safetyGuardrailsTitle"), desc: t("safetyGuardrailsDesc") },
    ],
    [t]
  );

  const DASHBOARD_CARDS = useMemo(
    () => [
      {
        title: t("dashAppointmentsTitle"),
        value: "8",
        change: t("dashAppointmentsChange"),
      },
      {
        title: t("dashConversationsTitle"),
        value: "23",
        change: t("dashConversationsChange"),
      },
      {
        title: t("dashBookingsTitle"),
        value: "34",
        change: t("dashBookingsChange"),
      },
    ],
    [t]
  );

  const INDUSTRIES = useMemo(
    () => [
      t("indBeauty"),
      t("indDental"),
      t("indHealth"),
      t("indBarber"),
      t("indGym"),
      t("indPet"),
      t("indConsulting"),
      t("indPhoto"),
      t("indMassage"),
      t("indNail"),
    ],
    [t]
  );

  const HOW_IT_WORKS = useMemo(
    () => [
      { step: "01", title: t("step1Title"), desc: t("step1Desc") },
      { step: "02", title: t("step2Title"), desc: t("step2Desc") },
      { step: "03", title: t("step3Title"), desc: t("step3Desc") },
    ],
    [t]
  );

  const FAQS = useMemo(
    () => [
      { q: t("faq1Q"), a: t("faq1A") },
      { q: t("faq2Q"), a: t("faq2A") },
      { q: t("faq3Q"), a: t("faq3A") },
      { q: t("faq4Q"), a: t("faq4A") },
      { q: t("faq5Q"), a: t("faq5A") },
      { q: t("faq6Q"), a: t("faq6A") },
    ],
    [t]
  );

  /* ── Visual Card sub-component ── */
  function VisualCard({
    type,
  }: {
    type: "chat" | "calendar" | "settings" | "safety";
  }) {
    if (type === "chat") {
      return (
        <div className="space-y-3 rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
              <Bot className="size-4 text-emerald-600" />
            </div>
            <span className="font-semibold text-slate-900 text-sm">
              {t("vcBotName")}
            </span>
            <span className="ml-auto text-slate-400 text-xs">
              {t("vcOnline")}
            </span>
          </div>
          <div className="max-w-[85%] rounded-xl rounded-tl-sm bg-emerald-50 p-3 text-slate-700 text-sm">
            {t("vcChat1")}
          </div>
          <div className="ml-auto max-w-[85%] rounded-xl rounded-tr-sm bg-slate-100 p-3 text-slate-700 text-sm">
            {t("vcChat2")}
          </div>
          <div className="max-w-[85%] rounded-xl rounded-tl-sm bg-emerald-50 p-3 text-slate-700 text-sm">
            {t("vcChat3")}
          </div>
        </div>
      );
    }

    if (type === "calendar") {
      return (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-semibold text-slate-900 text-sm">
              {t("vcCalToday")}
            </span>
            <span className="font-medium text-emerald-600 text-xs">
              {t("vcCalBookings", { count: 3 })}
            </span>
          </div>
          <div className="space-y-2">
            {[
              {
                time: "10:00",
                name: t("vcApt1Name"),
                service: t("vcApt1Service"),
                status: t("vcApt1Status"),
                confirmed: true,
              },
              {
                time: "14:00",
                name: t("vcApt2Name"),
                service: t("vcApt2Service"),
                status: t("vcApt2Status"),
                confirmed: false,
              },
              {
                time: "16:30",
                name: t("vcApt3Name"),
                service: t("vcApt3Service"),
                status: t("vcApt3Status"),
                confirmed: true,
              },
            ].map((apt) => (
              <div
                className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 transition hover:bg-emerald-50"
                key={apt.time}
              >
                <span className="w-12 font-mono text-slate-500 text-xs">
                  {apt.time}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-900 text-sm">
                    {apt.name}
                  </p>
                  <p className="text-slate-500 text-xs">{apt.service}</p>
                </div>
                <span
                  className={`rounded-full px-2 py-1 font-medium text-xs ${
                    apt.confirmed
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {apt.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (type === "settings") {
      return (
        <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl">
          <h4 className="font-semibold text-slate-900 text-sm">
            {t("vcKbTitle")}
          </h4>
          {[
            { q: t("vcKb1Q"), a: t("vcKb1A") },
            { q: t("vcKb2Q"), a: t("vcKb2A") },
            { q: t("vcKb3Q"), a: t("vcKb3A") },
          ].map((item) => (
            <div
              className="rounded-xl border border-slate-100 bg-slate-50 p-3"
              key={item.q}
            >
              <p className="font-medium text-slate-700 text-sm">{item.q}</p>
              <p className="mt-1 text-slate-500 text-xs">{item.a}</p>
            </div>
          ))}
        </div>
      );
    }

    // safety
    return (
      <div className="space-y-3 rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl">
        <div className="mb-2 flex items-center gap-2">
          <Shield className="size-5 text-emerald-500" />
          <span className="font-semibold text-slate-900 text-sm">
            {t("vcSafetyTitle")}
          </span>
        </div>
        {[
          {
            label: t("vcSafety1Label"),
            value: t("vcSafety1Value"),
            good: true,
          },
          {
            label: t("vcSafety2Label"),
            value: t("vcSafety2Value"),
            good: true,
          },
          {
            label: t("vcSafety3Label"),
            value: t("vcSafety3Value"),
            good: true,
          },
          {
            label: t("vcSafety4Label"),
            value: t("vcSafety4Value"),
            good: true,
          },
        ].map((item) => (
          <div
            className="flex items-center justify-between rounded-lg bg-slate-50 p-2"
            key={item.label}
          >
            <span className="text-slate-600 text-xs">{item.label}</span>
            <span
              className={`font-semibold text-xs ${item.good ? "text-emerald-600" : "text-amber-600"}`}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
    );
  }

  /* ── FAQ Item ── */
  function FAQItem({ question, answer }: { question: string; answer: string }) {
    const [open, setOpen] = useState(false);
    return (
      <AccordionItem
        answer={answer}
        isOpen={open}
        onToggle={() => setOpen(!open)}
        question={question}
      />
    );
  }

  /* ── Hero ── */
  if (variant === "hero") {
    return (
      <>
        <FadeUp>
          <SectionLabel>
            <Sparkles className="size-3" />
            {t("heroBadge")}
          </SectionLabel>
        </FadeUp>
        <FadeUp delay={0.1}>
          <h1 className="font-black text-4xl text-slate-900 leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            {t("heroTitle1")}
            <br />
            <span className="text-emerald-500">{t("heroTitle2")}</span>
          </h1>
        </FadeUp>
        <FadeUp delay={0.2}>
          <p className="mx-auto max-w-2xl text-lg text-slate-600 leading-relaxed md:text-xl">
            {t("heroDesc")}
          </p>
        </FadeUp>
        <FadeUp delay={0.3}>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-8 py-3.5 font-semibold text-base text-white shadow-emerald-500/25 shadow-xl transition-colors hover:bg-emerald-600"
              href="/signup"
            >
              {t("startFreeTrial")}
              <ArrowRight className="ml-2 size-4" />
            </Link>
            <Link
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-8 py-3.5 font-semibold text-base text-white shadow-xl transition-colors hover:bg-slate-800"
              href="#how-it-works"
            >
              {t("seeHowItWorks")}
            </Link>
          </div>
        </FadeUp>
        <FadeUp delay={0.4}>
          <div className="flex flex-wrap justify-center gap-8 pt-4">
            {HERO_VALUES.map((s) => (
              <div className="text-center" key={s.label}>
                <p className="font-black text-2xl text-slate-900 md:text-3xl">
                  {s.value}
                </p>
                <p className="mt-1 text-slate-500 text-xs">{s.label}</p>
              </div>
            ))}
          </div>
        </FadeUp>
      </>
    );
  }

  /* ── Audiences ── */
  if (variant === "audiences") {
    return (
      <StaggerContainer
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        stagger={0.1}
      >
        {AUDIENCES.map((a) => {
          const Icon = a.icon;
          return (
            <StaggerChild key={a.title}>
              <div className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 transition-colors group-hover:bg-emerald-100">
                  <Icon className="size-6 text-emerald-600" strokeWidth={1.5} />
                </div>
                <h3 className="mb-2 font-bold text-lg text-slate-900">
                  {a.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {a.desc}
                </p>
              </div>
            </StaggerChild>
          );
        })}
      </StaggerContainer>
    );
  }

  /* ── Capabilities ── */
  if (variant === "capabilities") {
    return (
      <StaggerContainer className="grid gap-6 md:grid-cols-3" stagger={0.08}>
        {CAPABILITIES.map((c) => {
          const Icon = c.icon;
          return (
            <StaggerChild key={c.title}>
              <div className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 transition-colors group-hover:bg-emerald-100">
                  <Icon className="size-6 text-emerald-600" strokeWidth={1.5} />
                </div>
                <h3 className="mb-2 font-bold text-lg text-slate-900">
                  {c.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {c.desc}
                </p>
              </div>
            </StaggerChild>
          );
        })}
      </StaggerContainer>
    );
  }

  /* ── Feature sections with visuals ── */
  if (variant === "features") {
    return (
      <div className="space-y-24">
        {FEATURE_SECTIONS.map((f, i) => (
          <FadeUp key={f.title}>
            <div className="grid items-center gap-12 md:grid-cols-2">
              <div className={i % 2 === 1 ? "md:order-2" : ""}>
                <h3 className="mb-4 font-black text-2xl text-slate-900 md:text-3xl">
                  {f.title}
                </h3>
                <p className="mb-6 text-lg text-slate-600 leading-relaxed">
                  {f.desc}
                </p>
                <Link
                  className="inline-flex items-center font-semibold text-emerald-600 text-sm transition-colors hover:text-emerald-700"
                  href="/signup"
                >
                  {t("learnMore")} <ArrowRight className="ml-1 size-4" />
                </Link>
              </div>
              <div className={i % 2 === 1 ? "md:order-1" : ""}>
                <VisualCard type={f.visual} />
              </div>
            </div>
          </FadeUp>
        ))}
      </div>
    );
  }

  /* ── Safety (dark section) ── */
  if (variant === "safety") {
    return (
      <StaggerContainer className="grid gap-6 sm:grid-cols-2" stagger={0.1}>
        {SAFETY_PILLARS.map((p) => (
          <StaggerChild key={p.title}>
            <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6">
              <h3 className="mb-2 font-bold text-lg text-white">{p.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{p.desc}</p>
            </div>
          </StaggerChild>
        ))}
      </StaggerContainer>
    );
  }

  /* ── How It Works ── */
  if (variant === "how-it-works") {
    return (
      <div className="relative">
        <div className="absolute top-8 right-[calc(16.67%+24px)] left-[calc(16.67%+24px)] hidden h-px bg-gradient-to-r from-emerald-300 via-emerald-200 to-emerald-300 md:block" />
        <StaggerContainer className="grid gap-8 md:grid-cols-3" stagger={0.2}>
          {HOW_IT_WORKS.map((s) => (
            <StaggerChild key={s.step}>
              <div className="relative text-center">
                <div className="relative mx-auto mb-6">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 font-black text-lg text-white shadow-emerald-500/30 shadow-lg">
                    {s.step}
                  </div>
                </div>
                <h3 className="mb-2 font-bold text-lg text-slate-900">
                  {s.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </StaggerChild>
          ))}
        </StaggerContainer>
      </div>
    );
  }

  /* ── Dashboard mockup ── */
  if (variant === "dashboard") {
    return (
      <FadeUp>
        <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl">
          {/* Top bar */}
          <div className="flex items-center gap-2 border-slate-100 border-b px-6 py-4">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-amber-400" />
            <div className="h-3 w-3 rounded-full bg-emerald-400" />
            <span className="ml-4 text-slate-400 text-xs">
              {t("vcDashLabel")}
            </span>
          </div>
          <div className="p-6 md:p-8">
            <div className="mb-6 grid gap-4 md:grid-cols-3">
              {DASHBOARD_CARDS.map((c) => (
                <div
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                  key={c.title}
                >
                  <p className="font-medium text-slate-500 text-xs">
                    {c.title}
                  </p>
                  <p className="mt-1 font-black text-3xl text-slate-900">
                    {c.value}
                  </p>
                  <p className="mt-1 text-emerald-600 text-xs">{c.change}</p>
                </div>
              ))}
            </div>
            {/* Conversation preview */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-semibold text-slate-700 text-xs">
                    {t("dashActiveTitle")}
                  </span>
                  <span className="font-medium text-emerald-600 text-xs">
                    {t("dashActiveCount")}
                  </span>
                </div>
                {[t("dashMsg1"), t("dashMsg2"), t("dashMsg3")].map((msg) => (
                  <div
                    className="flex items-center gap-3 border-slate-200 border-t py-2 first:border-0"
                    key={msg}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                      <MessageSquare className="size-4 text-emerald-600" />
                    </div>
                    <span className="truncate text-slate-600 text-xs">
                      {msg}
                    </span>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-semibold text-slate-700 text-xs">
                    {t("dashUpcomingTitle")}
                  </span>
                  <span className="font-medium text-emerald-600 text-xs">
                    {t("dashUpcomingCount")}
                  </span>
                </div>
                {[
                  {
                    time: "10:00",
                    name: t("vcApt1Name"),
                    service: t("vcApt1Service"),
                  },
                  {
                    time: "14:00",
                    name: t("vcApt2Name"),
                    service: t("vcApt2Service"),
                  },
                  {
                    time: "16:30",
                    name: t("vcApt3Name"),
                    service: t("vcApt3Service"),
                  },
                ].map((apt) => (
                  <div
                    className="flex items-center gap-3 border-slate-200 border-t py-2 first:border-0"
                    key={apt.time}
                  >
                    <span className="w-12 font-mono text-slate-400 text-xs">
                      {apt.time}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-slate-700 text-xs">
                        {apt.name}
                      </p>
                      <p className="text-slate-400 text-xs">{apt.service}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </FadeUp>
    );
  }

  /* ── Industries ── */
  if (variant === "industries") {
    return (
      <div className="flex flex-wrap justify-center gap-3">
        {INDUSTRIES.map((ind) => (
          <span
            className="cursor-default rounded-full border border-slate-200 bg-white px-4 py-2 font-medium text-slate-600 text-sm transition-colors hover:border-emerald-300 hover:text-emerald-600"
            key={ind}
          >
            {ind}
          </span>
        ))}
      </div>
    );
  }

  /* ── Pricing teaser ── */
  if (variant === "pricing-teaser") {
    return (
      <div className="text-center">
        <p className="mb-6 text-lg text-slate-600">
          {t("pricingTeaser", { price: formatPrice(29) })}
        </p>
        <Link
          className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-8 py-3.5 font-semibold text-base text-white shadow-emerald-500/25 shadow-xl transition-colors hover:bg-emerald-600"
          href="/pricing"
        >
          {t("viewPlans")}
          <ArrowRight className="ml-2 size-4" />
        </Link>
      </div>
    );
  }

  /* ── CTA ── */
  if (variant === "cta") {
    return (
      <FadeUp>
        <div className="rounded-[2rem] bg-slate-950 p-8 text-center md:p-16">
          <h2 className="mb-4 font-black text-3xl text-white md:text-4xl">
            {t("ctaTitle")}
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-lg text-slate-400">
            {t("ctaDesc")}
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-8 py-3.5 font-semibold text-base text-white shadow-emerald-500/25 shadow-xl transition-colors hover:bg-emerald-600"
              href="/signup"
            >
              {t("startFreeTrial")}
              <ArrowRight className="ml-2 size-4" />
            </Link>
            <Link
              className="inline-flex items-center justify-center rounded-full bg-white/10 px-8 py-3.5 font-semibold text-base text-white transition-colors hover:bg-white/20"
              href="/docs"
            >
              {t("ctaSecondary")}
            </Link>
          </div>
        </div>
      </FadeUp>
    );
  }

  /* ── FAQ ── */
  if (variant === "faq") {
    return (
      <StaggerContainer className="space-y-3" stagger={0.08}>
        {FAQS.map((f) => (
          <StaggerChild key={f.q}>
            <FAQItem answer={f.a} question={f.q} />
          </StaggerChild>
        ))}
      </StaggerContainer>
    );
  }

  return null;
}

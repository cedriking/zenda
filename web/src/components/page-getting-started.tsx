"use client";

import {
  ArrowRight,
  Clock,
  Download,
  Lightbulb,
  MessageSquare,
  Settings,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const STEPS = [
  {
    icon: Download,
    titleKey: "step1Title",
    descKey: "step1Desc",
    ctaKey: "step1Cta",
    ctaHref: "/download",
  },
  { icon: Smartphone, titleKey: "step2Title", descKey: "step2Desc" },
  { icon: Settings, titleKey: "step3Title", descKey: "step3Desc" },
  { icon: Sparkles, titleKey: "step4Title", descKey: "step4Desc" },
  { icon: MessageSquare, titleKey: "step5Title", descKey: "step5Desc" },
] as const;

const TIPS = ["tip1", "tip2", "tip3"] as const;

export function GettingStartedPageClient() {
  const t = useTranslations("gettingStarted");

  return (
    <div className="relative">
      {/* Decorative circle */}
      <div className="absolute -top-20 right-0 h-[300px] w-[300px] rounded-full bg-emerald-500/5" />

      {/* Header */}
      <div className="relative mb-12 text-center">
        <h1 className="mb-3 font-bold text-3xl tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("desc")}</p>
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 text-sm">
          <Clock size={14} />
          <span className="font-medium">{t("timeLabel")}</span>
        </div>
      </div>

      {/* Steps */}
      <div className="relative mx-auto max-w-2xl">
        {/* Timeline line */}
        <div className="absolute top-6 bottom-6 left-6 w-px bg-border" />

        <div className="space-y-0">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isLast = idx === STEPS.length - 1;
            const ctaHref = "ctaHref" in step ? step.ctaHref : undefined;
            const ctaKey = "ctaKey" in step ? step.ctaKey : undefined;

            return (
              <div
                className={`flex items-start gap-4 ${isLast ? "" : "pb-8"}`}
                key={step.titleKey}
              >
                <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-emerald-500 bg-white">
                  <Icon className="text-emerald-500" size={20} />
                </div>
                <div className="pt-1.5">
                  <span className="font-semibold text-emerald-600 text-xs uppercase tracking-wide">
                    {t("stepLabel", { number: idx + 1 })}
                  </span>
                  <h3 className="font-semibold text-foreground">
                    {t(step.titleKey)}
                  </h3>
                  <p className="mt-0.5 text-muted-foreground text-sm">
                    {t(step.descKey)}
                  </p>
                  {ctaHref && ctaKey && (
                    <Link
                      className="mt-2 inline-flex items-center gap-1 font-medium text-primary text-sm hover:underline"
                      href={ctaHref}
                    >
                      {t(ctaKey)}{" "}
                      <ArrowRight aria-hidden="true" className="size-3" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pro Tips */}
      <div className="mx-auto mt-16 max-w-2xl rounded-xl border border-border bg-emerald-50/50 p-6">
        <div className="mb-4 flex items-center gap-2">
          <Lightbulb className="text-emerald-500" size={20} />
          <h2 className="font-semibold">{t("tipTitle")}</h2>
        </div>
        <ul className="space-y-2">
          {TIPS.map((tip) => (
            <li
              className="flex items-start gap-2 text-muted-foreground text-sm"
              key={tip}
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
              {t(tip)}
            </li>
          ))}
        </ul>
      </div>

      {/* Help CTA */}
      <div className="mx-auto mt-12 max-w-2xl text-center">
        <h2 className="mb-2 font-semibold">{t("helpTitle")}</h2>
        <p className="mb-4 text-muted-foreground text-sm">{t("helpDesc")}</p>
        <Link
          className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-2.5 font-semibold text-sm text-white shadow-emerald-500/20 shadow-lg transition-colors hover:bg-emerald-600"
          href="/docs"
        >
          {t("helpCta")}
        </Link>
      </div>
    </div>
  );
}

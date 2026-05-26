"use client";

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { FadeUp, StaggerChild, StaggerContainer } from "@/components/motion";
import { Link } from "@/i18n/navigation";

interface VerticalAnimationsProps {
  description?: string;
  features?: { title: string; desc: string }[];
  headline?: string;
  title?: string;
  variant: "hero" | "features";
}

export function VerticalAnimations({
  variant,
  headline,
  description,
  title,
  features,
}: VerticalAnimationsProps) {
  const t = useTranslations("verticals");

  if (variant === "hero") {
    return (
      <>
        <FadeUp>
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-1.5 font-semibold text-emerald-700 text-xs uppercase tracking-wider">
            {t("badge")}
          </span>
        </FadeUp>
        <FadeUp delay={0.1}>
          <h1 className="mb-4 font-black text-4xl text-slate-900 md:text-5xl">
            {headline}
          </h1>
        </FadeUp>
        <FadeUp delay={0.2}>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-500">
            {description}
          </p>
        </FadeUp>
        <FadeUp delay={0.3}>
          <Link
            className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-8 py-3.5 font-semibold text-base text-white shadow-emerald-500/25 shadow-xl transition-colors hover:bg-emerald-600"
            href="/signup"
          >
            {t("ctaButton")}
            <ArrowRight className="ml-2 size-4" />
          </Link>
        </FadeUp>
      </>
    );
  }

  if (variant === "features" && title && features) {
    return (
      <>
        <FadeUp>
          <h2 className="mb-10 text-center font-black text-2xl text-slate-900">
            {title}
          </h2>
        </FadeUp>
        <StaggerContainer className="grid gap-6 md:grid-cols-3" stagger={0.1}>
          {features.map((f) => (
            <StaggerChild key={f.title}>
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <h3 className="mb-2 font-bold text-slate-900">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {f.desc}
                </p>
              </div>
            </StaggerChild>
          ))}
        </StaggerContainer>
      </>
    );
  }

  return null;
}

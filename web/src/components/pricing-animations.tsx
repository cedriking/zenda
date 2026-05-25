"use client";

import { ArrowRight, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback } from "react";
import { FadeUp, StaggerChild, StaggerContainer } from "@/components/motion";
import { useRouter } from "@/i18n/navigation";

interface Plan {
  cta: string;
  desc: string;
  features: string[];
  highlight: boolean;
  name: string;
  originalPrice?: number;
  price: number;
  tier: string;
}

export function PricingAnimations({ plans }: { plans: Plan[] }) {
  const t = useTranslations("pricing");
  const router = useRouter();

  const handleCheckout = useCallback(
    (tier: string) => {
      router.push(`/checkout?tier=${encodeURIComponent(tier)}`);
    },
    [router]
  );

  return (
    <>
      <FadeUp>
        <div className="mb-14 text-center">
          <div className="mb-4 inline-block rounded-full bg-amber-100 px-4 py-2 font-semibold text-amber-800 text-sm">
            {t("badge")}
          </div>
          <h1 className="mb-4 font-black text-4xl text-slate-900 md:text-5xl">
            {t("title")}
          </h1>
          <p className="text-lg text-slate-500">{t("desc")}</p>
        </div>
      </FadeUp>

      <StaggerContainer
        className="mx-auto grid max-w-6xl gap-6 md:grid-cols-4"
        stagger={0.15}
      >
        {plans.map((plan) => (
          <StaggerChild key={plan.name}>
            <div
              className={`relative flex h-full flex-col rounded-[1.5rem] p-6 transition-all duration-300 hover:-translate-y-1 ${
                plan.highlight
                  ? "bg-slate-950 text-white shadow-2xl ring-2 ring-emerald-500/30"
                  : "border border-slate-100 bg-white shadow-lg hover:shadow-xl"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-4 py-1 font-bold text-white text-xs">
                  {t("mostPopular")}
                </div>
              )}

              <div className="mb-6">
                <h3
                  className={`font-black text-xl ${plan.highlight ? "text-white" : "text-slate-900"}`}
                >
                  {plan.name}
                </h3>
                <p
                  className={`mt-1 text-sm ${plan.highlight ? "text-slate-400" : "text-slate-500"}`}
                >
                  {plan.desc}
                </p>
              </div>

              <div className="mb-6">
                {plan.originalPrice != null &&
                  plan.originalPrice > plan.price && (
                    <span
                      className={`mr-2 text-sm line-through ${plan.highlight ? "text-slate-600" : "text-slate-300"}`}
                    >
                      ${plan.originalPrice}
                    </span>
                  )}
                <span
                  className={`font-black text-4xl ${plan.highlight ? "text-white" : "text-slate-900"}`}
                >
                  ${plan.price}
                </span>
                <span
                  className={`text-sm ${plan.highlight ? "text-slate-400" : "text-slate-500"}`}
                >
                  {t("perMonth")}
                </span>
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li className="flex items-start gap-3" key={f}>
                    <Check
                      className={`mt-0.5 size-4 shrink-0 ${plan.highlight ? "text-emerald-400" : "text-emerald-500"}`}
                    />
                    <span
                      className={`text-sm ${plan.highlight ? "text-slate-300" : "text-slate-600"}`}
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                className={`inline-flex w-full items-center justify-center rounded-full py-3 font-semibold text-sm transition-colors ${
                  plan.highlight
                    ? "bg-emerald-500 text-white shadow-emerald-500/25 shadow-lg hover:bg-emerald-600"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
                onClick={() => handleCheckout(plan.tier)}
                type="button"
              >
                {plan.cta}
                <ArrowRight className="ml-2 size-4" />
              </button>
            </div>
          </StaggerChild>
        ))}
      </StaggerContainer>
    </>
  );
}

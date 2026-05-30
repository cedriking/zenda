import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Footer } from "@/components/footer";
import { HomeAnimations } from "@/components/home-animations";
import { Nav } from "@/components/nav";
import { routing } from "@/i18n/routing";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: t("title.default"),
    description: t("description"),
    alternates: {
      canonical: `https://zenda.bot/${locale}`,
      languages: {
        ...Object.fromEntries(
          routing.locales.map((l) => [l, `https://zenda.bot/${l}`])
        ),
        "x-default": "https://zenda.bot/en",
      },
    },
    openGraph: {
      url: `https://zenda.bot/${locale}`,
    },
  };
}

export default async function Home() {
  const t = await getTranslations("home");

  return (
    <div className="min-h-screen bg-neutral-200">
      <Nav variant="home" />

      {/* White container with rounded corners for hero + audiences */}
      <div className="overflow-hidden rounded-b-[2rem] bg-white shadow-2xl">
        <main id="main-content">
          {/* Hero */}
          <section className="relative overflow-hidden px-6 pt-32 pb-24">
            <div className="absolute top-0 right-0 h-[600px] w-[600px] translate-x-1/4 -translate-y-1/2 rounded-full bg-emerald-500/5" />
            <div className="absolute bottom-0 left-0 h-[400px] w-[400px] -translate-x-1/4 translate-y-1/2 rounded-full bg-emerald-500/5" />

            <div className="relative mx-auto max-w-4xl text-center">
              <HomeAnimations variant="hero" />
            </div>
          </section>

          {/* Audiences — Who it's for */}
          <section aria-labelledby="section-audiences" className="px-6 py-20">
            <div className="mx-auto max-w-6xl">
              <div className="mb-12 text-center">
                <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-1.5 font-semibold text-emerald-700 text-xs uppercase tracking-wider">
                  {t("audiencesBadge")}
                </span>
                <h2
                  className="mb-4 font-black text-3xl text-slate-900 md:text-4xl"
                  id="section-audiences"
                >
                  {t("audiencesTitle")}
                </h2>
                <p className="mx-auto mb-12 max-w-2xl text-center text-lg text-slate-500">
                  {t("audiencesDesc")}
                </p>
              </div>
              <HomeAnimations variant="audiences" />
            </div>
          </section>
        </main>
      </div>

      {/* Capabilities */}
      <section
        aria-labelledby="section-capabilities"
        className="bg-neutral-200 px-6 py-20"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-1.5 font-semibold text-emerald-700 text-xs uppercase tracking-wider">
              {t("capabilitiesBadge")}
            </span>
            <h2
              className="mb-4 font-black text-3xl text-slate-900 md:text-4xl"
              id="section-capabilities"
            >
              {t("capabilitiesTitle")}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-500">
              {t("capabilitiesDesc")}
            </p>
          </div>
          <div className="mt-12">
            <HomeAnimations variant="capabilities" />
          </div>
        </div>
      </section>

      {/* Features with visuals */}
      <section className="bg-neutral-200 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <HomeAnimations variant="features" />
        </div>
      </section>

      {/* Safety (dark section) */}
      <section
        aria-labelledby="section-safety"
        className="bg-neutral-200 px-6 py-20"
      >
        <div className="mx-auto max-w-6xl">
          <div className="overflow-hidden rounded-[2rem] bg-slate-950 p-8 md:p-16">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 font-semibold text-emerald-400 text-xs uppercase tracking-wider">
                {t("safetyBadge")}
              </span>
              <h2
                className="mb-4 font-black text-3xl text-white md:text-4xl"
                id="section-safety"
              >
                {t("safetyTitle")}
              </h2>
              <p className="text-lg text-slate-400">{t("safetyDesc")}</p>
            </div>
            <HomeAnimations variant="safety" />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        aria-labelledby="section-how-it-works"
        className="bg-neutral-200 px-6 py-20"
        id="how-it-works"
      >
        <div className="mx-auto max-w-4xl">
          <div className="mb-16 text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-1.5 font-semibold text-emerald-700 text-xs uppercase tracking-wider">
              {t("howBadge")}
            </span>
            <h2
              className="font-black text-3xl text-slate-900 md:text-4xl"
              id="section-how-it-works"
            >
              {t("howTitle")}
            </h2>
          </div>
          <HomeAnimations variant="how-it-works" />
        </div>
      </section>

      {/* Dashboard mockup */}
      <section
        aria-labelledby="section-dashboard"
        className="bg-neutral-200 px-6 py-20"
      >
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-1.5 font-semibold text-emerald-700 text-xs uppercase tracking-wider">
              {t("dashboardBadge")}
            </span>
            <h2
              className="mb-4 font-black text-3xl text-slate-900 md:text-4xl"
              id="section-dashboard"
            >
              {t("dashboardTitle")}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-500">
              {t("dashboardDesc")}
            </p>
          </div>
          <HomeAnimations variant="dashboard" />
        </div>
      </section>

      {/* Industries */}
      <section
        aria-labelledby="section-industries"
        className="bg-neutral-200 px-6 py-20"
      >
        <div className="mx-auto max-w-4xl text-center">
          <h2
            className="mb-8 font-black text-2xl text-slate-900 md:text-3xl"
            id="section-industries"
          >
            {t("industriesTitle")}
          </h2>
          <HomeAnimations variant="industries" />
        </div>
      </section>

      {/* FAQ */}
      <section
        aria-labelledby="section-faq"
        className="bg-white px-6 py-20"
        id="faq"
      >
        <div className="mx-auto max-w-3xl">
          <h2
            className="mb-12 text-center font-black text-2xl text-slate-900 md:text-3xl"
            id="section-faq"
          >
            {t("faqTitle")}
          </h2>
          <div className="space-y-6">
            {[
              { q: t("faq1Q"), a: t("faq1A") },
              { q: t("faq2Q"), a: t("faq2A") },
              { q: t("faq3Q"), a: t("faq3A") },
              { q: t("faq4Q"), a: t("faq4A") },
            ].map((faq) => (
              <details
                className="group rounded-2xl border border-slate-200 bg-slate-50 p-6 open:bg-white"
                key={faq.q}
              >
                <summary className="cursor-pointer list-none font-semibold text-lg text-slate-900 [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between">
                    {faq.q}
                    <svg
                      aria-hidden="true"
                      className="size-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M19 9l-7 7-7-7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </summary>
                <p className="mt-3 text-slate-600 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-neutral-200 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <HomeAnimations variant="cta" />
        </div>
      </section>

      <Footer />
    </div>
  );
}

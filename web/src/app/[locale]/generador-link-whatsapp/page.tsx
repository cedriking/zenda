import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Footer } from "@/components/footer";
import { JsonLdScript } from "@/components/json-ld";
import { Nav } from "@/components/nav";
import { WhatsAppLinkGenerator } from "@/components/whatsapp-link-generator";
import { Link } from "@/i18n/navigation";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "waLinkPage" });

  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    alternates: {
      canonical: `https://zenda.bot/${locale}/generador-link-whatsapp`,
    },
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDesc"),
      url: `https://zenda.bot/${locale}/generador-link-whatsapp`,
      type: "website",
    },
  };
}

export default async function GeneradorLinkWhatsAppPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "waLinkPage" });

  const faqItems = [
    { q: t("faq1Q"), a: t("faq1A") },
    { q: t("faq2Q"), a: t("faq2A") },
    { q: t("faq3Q"), a: t("faq3A") },
    { q: t("faq4Q"), a: t("faq4A") },
    { q: t("faq5Q"), a: t("faq5A") },
    { q: t("faq6Q"), a: t("faq6A") },
  ];

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  const toolStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: t("heroTitle"),
    description: t("metaDesc"),
    url: `https://zenda.bot/${locale}/generador-link-whatsapp`,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    creator: {
      "@type": "Organization",
      name: "Zenda",
      url: "https://zenda.bot",
    },
  };

  const steps = [
    { step: "1", title: t("step1Title"), desc: t("step1Desc") },
    { step: "2", title: t("step2Title"), desc: t("step2Desc") },
    { step: "3", title: t("step3Title"), desc: t("step3Desc") },
  ];

  const useCases = [
    { platform: t("ucInstagramTitle"), desc: t("ucInstagramDesc") },
    { platform: t("ucFacebookTitle"), desc: t("ucFacebookDesc") },
    { platform: t("ucGoogleTitle"), desc: t("ucGoogleDesc") },
    { platform: t("ucWebsiteTitle"), desc: t("ucWebsiteDesc") },
    { platform: t("ucEmailTitle"), desc: t("ucEmailDesc") },
    { platform: t("ucPrintTitle"), desc: t("ucPrintDesc") },
  ];

  return (
    <div className="min-h-screen bg-white">
      <JsonLdScript data={faqStructuredData} />
      <JsonLdScript data={toolStructuredData} />
      <Nav variant="simple" />

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pt-16 pb-10 text-center">
        <p className="mb-4 font-semibold text-emerald-600 text-sm uppercase tracking-wide">
          {t("badge")}
        </p>
        <h1 className="mb-4 font-bold text-3xl text-slate-900 leading-tight md:text-4xl">
          {t("heroTitle")}
        </h1>
        <p className="mx-auto mb-6 max-w-2xl text-lg text-slate-600">
          {t("heroDesc")}
        </p>
      </section>

      {/* Tool */}
      <WhatsAppLinkGenerator />

      {/* How to use */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-8 text-center font-bold text-2xl text-slate-900">
            {t("stepsTitle")}
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((item) => (
              <div
                className="rounded-xl border border-slate-200 bg-white p-6 text-center"
                key={item.step}
              >
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 font-bold text-white">
                  {item.step}
                </div>
                <h3 className="mb-2 font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="text-slate-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-8 text-center font-bold text-2xl text-slate-900">
            {t("useCasesTitle")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {useCases.map((item) => (
              <div
                className="rounded-lg border border-slate-200 p-4"
                key={item.platform}
              >
                <h3 className="mb-1 font-semibold text-emerald-700">
                  {item.platform}
                </h3>
                <p className="text-slate-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-8 text-center font-bold text-2xl text-slate-900">
            {t("faqTitle")}
          </h2>
          <div className="space-y-4">
            {faqItems.map((item) => (
              <div
                className="rounded-lg border border-slate-200 bg-white p-5"
                key={item.q}
              >
                <h3 className="mb-2 font-semibold text-slate-900">{item.q}</h3>
                <p className="text-slate-600 text-sm">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-emerald-600 py-16 text-center">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-3 font-bold text-2xl text-white md:text-3xl">
            {t("ctaTitle")}
          </h2>
          <p className="mb-6 text-emerald-100">{t("ctaDesc")}</p>
          <Link href="/founding">
            <button
              className="rounded-full bg-white px-8 py-3 font-semibold text-base text-emerald-700 hover:bg-emerald-50"
              type="button"
            >
              {t("ctaButton")}
            </button>
          </Link>
          <p className="mt-4 text-emerald-200 text-xs">{t("ctaSubtext")}</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}

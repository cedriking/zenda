import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Footer } from "@/components/footer";
import { JsonLdScript } from "@/components/json-ld";
import { Nav } from "@/components/nav";
import { PricingAnimations } from "@/components/pricing-animations";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pricing");
  return {
    title: t("title"),
    description: t("desc"),
    alternates: {
      canonical: "https://zenda.bot/pricing",
    },
    openGraph: {
      title: t("title"),
      description: t("desc"),
      url: "https://zenda.bot/pricing",
      type: "website",
    },
  };
}

export default async function PricingPage() {
  const t = await getTranslations("pricing");

  const PLANS = [
    {
      name: t("soloName"),
      price: 29,
      desc: t("soloDesc"),
      features: [
        t("soloFeature1"),
        t("soloFeature2"),
        t("soloFeature3"),
        t("soloFeature4"),
        t("soloFeature5"),
      ],
      cta: t("ctaTrial"),
      highlight: false,
    },
    {
      name: t("starterName"),
      price: 49,
      desc: t("starterDesc"),
      features: [
        t("starterFeature1"),
        t("starterFeature2"),
        t("starterFeature3"),
        t("starterFeature4"),
        t("starterFeature5"),
        t("starterFeature6"),
      ],
      cta: t("ctaTrial"),
      highlight: true,
    },
    {
      name: t("proName"),
      price: 89,
      desc: t("proDesc"),
      features: [
        t("proFeature1"),
        t("proFeature2"),
        t("proFeature3"),
        t("proFeature4"),
        t("proFeature5"),
        t("proFeature6"),
      ],
      cta: t("ctaTrial"),
      highlight: false,
    },
    {
      name: t("businessName"),
      price: 149,
      desc: t("businessDesc"),
      features: [
        t("businessFeature1"),
        t("businessFeature2"),
        t("businessFeature3"),
        t("businessFeature4"),
        t("businessFeature5"),
        t("businessFeature6"),
      ],
      cta: t("ctaSales"),
      highlight: false,
    },
  ];

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [1, 2, 3].map((i) => ({
      "@type": "Question",
      name: t(`faq${i}Q`),
      acceptedAnswer: {
        "@type": "Answer",
        text: t(`faq${i}A`),
      },
    })),
  };

  return (
    <div className="min-h-screen bg-neutral-200 pt-16">
      <JsonLdScript data={faqLd} />
      <Nav variant="simple" />

      <main className="relative overflow-hidden">
        <div className="rounded-b-[2rem] bg-white shadow-2xl">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <PricingAnimations plans={PLANS} />
          </div>
        </div>

        {/* Bottom section */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 font-black text-2xl text-slate-900">
              {t("faqTitle")}
            </h2>
            <div className="mt-8 space-y-4">
              {[
                { q: t("faq1Q"), a: t("faq1A") },
                { q: t("faq2Q"), a: t("faq2A") },
                { q: t("faq3Q"), a: t("faq3A") },
              ].map((item) => (
                <div
                  className="rounded-2xl border border-slate-100 bg-white p-5 text-left shadow-lg"
                  key={item.q}
                >
                  <h3 className="mb-1 font-bold text-slate-900">{item.q}</h3>
                  <p className="text-slate-500 text-sm">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

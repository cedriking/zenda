import { getTranslations } from "next-intl/server";
import { Footer } from "@/components/footer";
import { JsonLdScript } from "@/components/json-ld";
import { Nav } from "@/components/nav";
import { VerticalAnimations } from "@/components/vertical-animations";
import { Link } from "@/i18n/navigation";

export interface VerticalPageConfig {
  description: string;
  features: { title: string; desc: string }[];
  featuresSectionTitle: string;
  headline: string;
  slug: string;
  title: string;
}

export async function VerticalPage({
  config,
  locale,
}: {
  config: VerticalPageConfig;
  locale: string;
}) {
  const t = await getTranslations("verticals");

  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: config.headline,
    description: config.description,
    provider: {
      "@type": "Organization",
      name: "Zenda",
      url: "https://zenda.bot",
    },
    serviceType: "AI Receptionist",
    areaServed: {
      "@type": "GeoShape",
      name: "Latin America",
    },
    url: `https://zenda.bot/${locale}/${config.slug}`,
  };

  return (
    <div className="flex min-h-screen flex-col bg-neutral-200 pt-16">
      <JsonLdScript data={serviceLd} />
      <Nav variant="simple" />

      <main className="relative flex-1 overflow-hidden">
        <div className="rounded-b-[2rem] bg-white shadow-2xl">
          <section className="relative overflow-hidden px-6 py-20">
            <div className="absolute top-0 right-0 h-[400px] w-[400px] translate-x-1/4 -translate-y-1/2 rounded-full bg-emerald-500/5" />
            <div className="mx-auto max-w-4xl text-center">
              <VerticalAnimations
                description={config.description}
                headline={config.headline}
                variant="hero"
              />
            </div>
          </section>

          <section className="relative px-6 py-16">
            <div className="mx-auto max-w-4xl">
              <VerticalAnimations
                features={config.features}
                title={config.featuresSectionTitle}
                variant="features"
              />
            </div>
          </section>
        </div>

        {/* CTA section */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-[2rem] bg-slate-950 p-8 text-center md:p-12">
              <h2 className="mb-4 font-black text-2xl text-white md:text-3xl">
                {t("ctaTitle", { title: config.title.toLowerCase() })}
              </h2>
              <p className="mb-6 text-slate-400">{t("ctaDesc")}</p>
              <Link
                className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-8 py-3.5 font-semibold text-base text-white shadow-emerald-500/25 shadow-xl transition-colors hover:bg-emerald-600"
                href="/signup"
              >
                {t("ctaButton")}
              </Link>
            </div>
          </div>
        </section>

        {/* Cross-linking: other verticals */}
        {(() => {
          const allVerticals = [
            { slug: "beauty", label: t("beauty.title") },
            { slug: "clinics", label: t("clinics.title") },
            { slug: "wellness", label: t("wellness.title") },
            { slug: "fitness", label: t("fitness.title") },
            { slug: "dental", label: t("dental.title") },
          ];
          const others = allVerticals.filter((v) => v.slug !== config.slug);
          return (
            <section className="px-6 py-12">
              <div className="mx-auto max-w-4xl text-center">
                <h3 className="mb-6 font-semibold text-lg text-neutral-700">
                  {t("otherVerticals")}
                </h3>
                <div className="flex flex-wrap justify-center gap-3">
                  {others.map((v) => (
                    <Link
                      className="inline-flex items-center rounded-full border border-neutral-300 bg-white px-5 py-2 font-medium text-neutral-700 text-sm transition-colors hover:border-emerald-500 hover:text-emerald-600"
                      href={`/${v.slug}`}
                      key={v.slug}
                    >
                      {v.label}
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          );
        })()}
      </main>

      <Footer />
    </div>
  );
}

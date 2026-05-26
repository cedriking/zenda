import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Footer } from "@/components/footer";
import { JsonLdScript } from "@/components/json-ld";
import { Nav } from "@/components/nav";
import { FoundingPageClient } from "@/components/page-founding";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("founding");
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    alternates: {
      canonical: "https://zenda.bot/founding",
    },
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDesc"),
      url: "https://zenda.bot/founding",
      type: "website",
    },
  };
}

export default async function FoundingPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("founding");

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [1, 2, 3, 4].map((i) => ({
      "@type": "Question",
      name: t(`faq${i}Q`),
      acceptedAnswer: {
        "@type": "Answer",
        text: t(`faq${i}A`),
      },
    })),
  };

  return (
    <div className="min-h-screen bg-neutral-200">
      <JsonLdScript data={faqLd} />
      <Nav variant="simple" />
      <FoundingPageClient locale={locale} />
      <Footer />
    </div>
  );
}

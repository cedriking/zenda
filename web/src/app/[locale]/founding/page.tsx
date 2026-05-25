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
  };
}

// Keys used by FoundingPageClient — resolved to strings in server component
// so the function is never passed across the server/client boundary.
const T_KEYS = [
  "badge",
  "heroTitle",
  "heroSubtitle",
  "trialBadge",
  "discountBadge",
  "whatYouGet",
  "feature1Title",
  "feature1Desc",
  "feature2Title",
  "feature2Desc",
  "feature3Title",
  "feature3Desc",
  "feature4Title",
  "feature4Desc",
  "feature5Title",
  "feature5Desc",
  "howItWorks",
  "step1Title",
  "step1Desc",
  "step2Title",
  "step2Desc",
  "step3Title",
  "step3Desc",
  "testimonial1",
  "testimonial1Author",
  "faq1Q",
  "faq1A",
  "faq2Q",
  "faq2A",
  "faq3Q",
  "faq3A",
  "faq4Q",
  "faq4A",
  "formTitle",
  "labelName",
  "labelBusiness",
  "labelEmail",
  "labelPassword",
  "submit",
  "submitting",
  "formDisclaimer",
  "successTitle",
  "successBody",
  "successCta",
  "spotsRemaining",
  "errorPasswordMin",
] as const;

export default async function FoundingPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("founding");

  const strings: Record<string, string> = {};
  for (const key of T_KEYS) {
    strings[key] = t(key);
  }

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
      <FoundingPageClient locale={locale} strings={strings} />
      <Footer />
    </div>
  );
}

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  VerticalPage,
  type VerticalPageConfig,
} from "@/components/vertical-page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("verticals.wellness");

  const path = "wellness";
  const locales = ["es", "en", "ar", "fr", "de", "ru", "zh", "ja", "ko"];
  const languages: Record<string, string> = {};
  for (const loc of locales) {
    languages[loc] = `https://zenda.bot/${loc}/${path}`;
  }
  languages["x-default"] = "https://zenda.bot/en/wellness";

  return {
    alternates: {
      canonical: `https://zenda.bot/${locale}/${path}`,
      languages,
    },
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDesc"),
      url: `https://zenda.bot/${locale}/${path}`,
      type: "website",
    },
    title: t("metaTitle"),
    description: t("metaDesc"),
  };
}

export default async function WellnessPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("verticals.wellness");

  const config: VerticalPageConfig = {
    slug: "wellness",
    title: t("title"),
    headline: t("headline"),
    description: t("description"),
    featuresSectionTitle: t("featuresTitle"),
    features: [
      { title: t("feature1Title"), desc: t("feature1Desc") },
      { title: t("feature2Title"), desc: t("feature2Desc") },
      { title: t("feature3Title"), desc: t("feature3Desc") },
      { title: t("feature4Title"), desc: t("feature4Desc") },
      { title: t("feature5Title"), desc: t("feature5Desc") },
      { title: t("feature6Title"), desc: t("feature6Desc") },
    ],
  };

  return <VerticalPage config={config} locale={locale} />;
}

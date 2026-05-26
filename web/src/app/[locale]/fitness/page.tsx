import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  VerticalPage,
  type VerticalPageConfig,
} from "@/components/vertical-page";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("verticals.fitness");
  return {
    alternates: {
      canonical: "https://zenda.bot/fitness",
    },
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDesc"),
      url: "https://zenda.bot/fitness",
      type: "website",
    },
    title: t("metaTitle"),
    description: t("metaDesc"),
  };
}

export default async function FitnessPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations("verticals.fitness");

  const config: VerticalPageConfig = {
    slug: "fitness",
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

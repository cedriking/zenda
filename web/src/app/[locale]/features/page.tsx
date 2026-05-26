import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { FeaturesPage as FeaturesPageComponent } from "@/components/page-features";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("features");

  const path = "features";
  const locales = ["es", "en", "ar", "fr", "de", "ru", "zh", "ja", "ko"];
  const languages: Record<string, string> = {};
  for (const loc of locales) {
    languages[loc] = `https://zenda.bot/${loc}/${path}`;
  }
  languages["x-default"] = "https://zenda.bot/en/features";

  return {
    alternates: {
      canonical: `https://zenda.bot/${locale}/${path}`,
      languages,
    },
    openGraph: {
      description: t("metaDesc"),
      title: t("metaTitle"),
      type: "website",
      url: `https://zenda.bot/${locale}/${path}`,
    },
    description: t("metaDesc"),
    title: t("metaTitle"),
  };
}

export default function FeaturesPage() {
  return <FeaturesPageComponent />;
}

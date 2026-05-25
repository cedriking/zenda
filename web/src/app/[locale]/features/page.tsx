import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { FeaturesPage as FeaturesPageComponent } from "@/components/page-features";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("features");
  return {
    alternates: { canonical: "https://zenda.bot/features" },
    description: t("metaDesc"),
    openGraph: {
      description: t("metaDesc"),
      title: t("metaTitle"),
      type: "website",
      url: "https://zenda.bot/features",
    },
    title: t("metaTitle"),
  };
}

export default function FeaturesPage() {
  return <FeaturesPageComponent />;
}

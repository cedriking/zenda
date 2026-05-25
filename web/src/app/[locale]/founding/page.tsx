import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { FoundingPageClient } from "@/components/page-founding";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("founding");
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
  };
}

export default async function FoundingPage() {
  const t = await getTranslations("founding");

  return (
    <div className="min-h-screen bg-neutral-200">
      <Nav variant="simple" />
      <FoundingPageClient t={t} />
      <Footer />
    </div>
  );
}

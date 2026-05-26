import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { GettingStartedPageClient } from "@/components/page-getting-started";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("gettingStarted");

  const path = "getting-started";
  const locales = ["es", "en", "ar", "fr", "de", "ru", "zh", "ja", "ko"];
  const languages: Record<string, string> = {};
  for (const loc of locales) {
    languages[loc] = `https://zenda.bot/${loc}/${path}`;
  }
  languages["x-default"] = "https://zenda.bot/en/getting-started";

  return {
    alternates: {
      canonical: `https://zenda.bot/${locale}/${path}`,
      languages,
    },
    openGraph: {
      title: t("title"),
      description: t("desc"),
      url: `https://zenda.bot/${locale}/${path}`,
      type: "website",
    },
    title: t("title"),
    description: t("desc"),
  };
}

export default function GettingStartedPage() {
  return (
    <div className="min-h-screen bg-neutral-200 pt-16">
      <Nav variant="simple" />
      <main className="rounded-b-[2rem] bg-white shadow-2xl">
        <div className="relative mx-auto max-w-4xl px-6 py-16">
          <GettingStartedPageClient />
        </div>
      </main>
      <Footer />
    </div>
  );
}

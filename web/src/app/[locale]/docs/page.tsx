import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { DocsAnimations } from "@/components/docs-animations";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("docs");

  const path = "docs";
  const locales = ["es", "en", "ar", "fr", "de", "ru", "zh", "ja", "ko"];
  const languages: Record<string, string> = {};
  for (const loc of locales) {
    languages[loc] = `https://zenda.bot/${loc}/${path}`;
  }
  languages["x-default"] = "https://zenda.bot/en/docs";

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

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-neutral-200 pt-16">
      <Nav variant="simple" />

      <main className="rounded-b-[2rem] bg-white shadow-2xl">
        <div className="relative mx-auto max-w-4xl overflow-hidden px-6 py-16">
          <div className="absolute -top-20 top-0 right-0 h-[300px] w-[300px] rounded-full bg-emerald-500/5" />
          <DocsAnimations />
        </div>
      </main>

      <Footer />
    </div>
  );
}

import { getTranslations } from "next-intl/server";
import { Footer } from "@/components/footer";
import { DownloadPageClient } from "@/components/page-download";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("download");

  const path = "download";
  const locales = ["es", "en", "ar", "fr", "de", "ru", "zh", "ja", "ko"];
  const languages: Record<string, string> = {};
  for (const loc of locales) {
    languages[loc] = `https://zenda.bot/${loc}/${path}`;
  }
  languages["x-default"] = "https://zenda.bot/en/download";

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

// biome-ignore lint/suspicious/useAwait: Next.js server component renders async Footer
export default async function DownloadPage() {
  return (
    <>
      <DownloadPageClient />
      <Footer />
    </>
  );
}

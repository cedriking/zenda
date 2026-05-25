import { getTranslations } from "next-intl/server";
import { Footer } from "@/components/footer";
import { DownloadPageClient } from "@/components/page-download";

export async function generateMetadata() {
  const t = await getTranslations("download");
  return {
    alternates: {
      canonical: "https://zenda.bot/download",
    },
    openGraph: {
      title: t("title"),
      description: t("desc"),
      url: "https://zenda.bot/download",
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

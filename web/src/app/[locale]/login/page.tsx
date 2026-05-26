import { getTranslations } from "next-intl/server";
import { Footer } from "@/components/footer";
import { LoginPageClient } from "@/components/page-login";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("auth");

  const path = "login";
  const locales = ["es", "en", "ar", "fr", "de", "ru", "zh", "ja", "ko"];
  const languages: Record<string, string> = {};
  for (const loc of locales) {
    languages[loc] = `https://zenda.bot/${loc}/${path}`;
  }
  languages["x-default"] = "https://zenda.bot/en/login";

  return {
    title: t("loginTitle"),
    description: t("loginDesc"),
    alternates: {
      canonical: `https://zenda.bot/${locale}/${path}`,
      languages,
    },
    openGraph: {
      title: t("loginTitle"),
      description: t("loginDesc"),
      url: `https://zenda.bot/${locale}/${path}`,
      type: "website",
    },
  };
}

// biome-ignore lint/suspicious/useAwait: Next.js server component renders async Footer
export default async function LoginPage() {
  return (
    <>
      <LoginPageClient />
      <Footer />
    </>
  );
}

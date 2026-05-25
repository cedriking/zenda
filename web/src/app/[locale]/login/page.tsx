import { getTranslations } from "next-intl/server";
import { Footer } from "@/components/footer";
import { LoginPageClient } from "@/components/page-login";

export async function generateMetadata() {
  const t = await getTranslations("auth");
  return {
    title: t("loginTitle"),
    description: t("loginDesc"),
    alternates: {
      canonical: "https://zenda.bot/login",
    },
    openGraph: {
      title: t("loginTitle"),
      description: t("loginDesc"),
      url: "https://zenda.bot/login",
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

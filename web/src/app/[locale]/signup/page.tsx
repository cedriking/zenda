import { getTranslations } from "next-intl/server";
import { Footer } from "@/components/footer";
import { SignupPageClient } from "@/components/page-signup";

export async function generateMetadata() {
  const t = await getTranslations("auth");
  return {
    title: t("signupTitle"),
    description: t("signupDesc"),
    alternates: {
      canonical: "https://zenda.bot/signup",
    },
    openGraph: {
      title: t("signupTitle"),
      description: t("signupDesc"),
      url: "https://zenda.bot/signup",
      type: "website",
    },
  };
}

// biome-ignore lint/suspicious/useAwait: Next.js server component renders async Footer
export default async function SignupPage() {
  return (
    <>
      <SignupPageClient />
      <Footer />
    </>
  );
}

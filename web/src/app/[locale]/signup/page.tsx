import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { Footer } from "@/components/footer";
import { SignupPageClient } from "@/components/page-signup";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("auth");

  const path = "signup";
  const locales = ["es", "en", "ar", "fr", "de", "ru", "zh", "ja", "ko"];
  const languages: Record<string, string> = {};
  for (const loc of locales) {
    languages[loc] = `https://zenda.bot/${loc}/${path}`;
  }
  languages["x-default"] = "https://zenda.bot/en/signup";

  return {
    title: t("signupTitle"),
    description: t("signupDesc"),
    alternates: {
      canonical: `https://zenda.bot/${locale}/${path}`,
      languages,
    },
    openGraph: {
      title: t("signupTitle"),
      description: t("signupDesc"),
      url: `https://zenda.bot/${locale}/${path}`,
      type: "website",
    },
  };
}

// biome-ignore lint/suspicious/useAwait: Next.js server component renders async Footer
export default async function SignupPage() {
  return (
    <>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
          </div>
        }
      >
        <SignupPageClient />
      </Suspense>
      <Footer />
    </>
  );
}

import { notFound } from "next/navigation";
import { getMessages, getTranslations } from "next-intl/server";
import { GoogleAnalytics } from "@/components/google-analytics";
import { CookieConsent } from "@/components/cookie-consent";
import { LocaleProvider } from "@/components/locale-provider";
import { type Locale, routing, supportedLanguages } from "@/i18n/routing";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    metadataBase: new URL("https://zenda.bot"),
    title: {
      default: t("title.default"),
      template: t("title.template"),
    },
    description: t("description"),
    keywords: t.raw("keywords"),
    authors: [{ name: "Zenda" }],
    openGraph: {
      title: t("openGraph.title"),
      description: t("openGraph.description"),
      url: "https://zenda.bot",
      siteName: "Zenda",
      locale: ({ en: "en_US", es: "es_MX", ar: "ar_SA", fr: "fr_FR", de: "de_DE", ru: "ru_RU", zh: "zh_CN", ja: "ja_JP", ko: "ko_KR" } as Record<string, string>)[locale] ?? locale,
      type: "website",
      images: [
        {
          url: `https://zenda.bot/api/og?locale=${locale}`,
          width: 1200,
          height: 630,
          alt: "Zenda — AI Receptionist",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("twitter.title"),
      description: t("twitter.description"),
      images: [`https://zenda.bot/api/og?locale=${locale}`],
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `https://zenda.bot/${locale}`,
      languages: {
        ...Object.fromEntries(
          routing.locales.map((l) => [l, `https://zenda.bot/${l}`])
        ),
        "x-default": "https://zenda.bot/en",
      },
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();
  const lang = supportedLanguages.find((l) => l.key === locale);
  const dir = lang?.dir ?? "ltr";

  const tJsonLd = await getTranslations({ locale, namespace: "metadata" });
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Zenda",
    applicationCategory: "BusinessApplication",
    operatingSystem: "macOS, Windows",
    description: tJsonLd("description"),
    offers: {
      "@type": "AggregateOffer",
      lowPrice: "29",
      highPrice: "149",
      priceCurrency: "USD",
      offerCount: "4",
    },
  };

  return (
    <html dir={dir} lang={locale}>
      <head>
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          type="application/ld+json"
        />
      </head>
      <body>
        <GoogleAnalytics />
        <LocaleProvider locale={locale} messages={messages} now={new Date()}>
          {children}
          <CookieConsent />
        </LocaleProvider>
      </body>
    </html>
  );
}

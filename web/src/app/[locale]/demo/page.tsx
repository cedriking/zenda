import { Check, MessageCircle, Smartphone, Zap } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "demo" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: `https://zenda.bot/${locale}/demo`,
    },
    openGraph: {
      title: t("metaOgTitle"),
      description: t("metaOgDescription"),
      url: `https://zenda.bot/${locale}/demo`,
      type: "website",
    },
  };
}

export default async function DemoPage() {
  const t = await getTranslations("demo");

  const chatMessages = [
    { from: "client" as const, text: t("chat.msg1"), time: "10:32 AM" },
    { from: "zenda" as const, text: t("chat.msg2"), time: "10:32 AM" },
    { from: "client" as const, text: t("chat.msg3"), time: "10:33 AM" },
    { from: "zenda" as const, text: t("chat.msg4"), time: "10:33 AM" },
    { from: "client" as const, text: t("chat.msg5"), time: "10:33 AM" },
    { from: "zenda" as const, text: t("chat.msg6"), time: "10:34 AM" },
    { from: "client" as const, text: t("chat.msg7"), time: "10:34 AM" },
    { from: "zenda" as const, text: t("chat.msg8"), time: "10:34 AM" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Nav variant="simple" />

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pt-16 pb-10 text-center">
        <p className="mb-4 font-semibold text-primary text-sm uppercase tracking-wide">
          {t("badge")}
        </p>
        <h1 className="mb-4 font-bold text-3xl text-foreground leading-tight md:text-4xl">
          {t("heading")}
        </h1>
        <p className="mx-auto mb-6 max-w-xl text-muted-foreground">
          {t("subtitle")}
        </p>
      </section>

      {/* WhatsApp Chat Simulation */}
      <section className="mx-auto max-w-md px-4 pb-12">
        <div className="overflow-hidden rounded-2xl border border-green-200 bg-green-50 shadow-lg">
          {/* WhatsApp header */}
          <div className="flex items-center gap-3 bg-green-600 px-4 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm text-white">
                {t("businessName")}
              </p>
              <p className="text-green-100 text-xs">{t("onlineStatus")}</p>
            </div>
          </div>

          {/* Chat messages */}
          <div
            className="space-y-2 bg-[#e5ddd5] px-3 py-4"
            style={{
              backgroundImage:
                'url(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23e5ddd5" width="100" height="100"/></svg>\')',
            }}
          >
            {chatMessages.map((msg) => (
              <div
                className={`flex ${msg.from === "client" ? "justify-end" : "justify-start"}`}
                key={`${msg.from}-${msg.time}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 shadow-sm ${
                    msg.from === "client"
                      ? "rounded-tr-none bg-green-100"
                      : "rounded-tl-none bg-white"
                  }`}
                >
                  <p className="whitespace-pre-line text-slate-800 text-sm">
                    {msg.text}
                  </p>
                  <p
                    className={`mt-1 text-right text-[10px] ${msg.from === "client" ? "text-green-700" : "text-slate-400"}`}
                  >
                    {msg.time} {msg.from === "client" && "✓✓"}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* WhatsApp input bar */}
          <div className="flex items-center gap-2 bg-green-50 px-3 py-2">
            <div className="flex-1 rounded-full bg-white px-4 py-2 text-muted-foreground text-sm">
              {t("chatInput")}
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-600">
              <Zap className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>
        <p className="mt-3 text-center text-muted-foreground text-xs">
          {t("chatDisclaimer")}
        </p>
      </section>

      {/* What just happened */}
      <section className="bg-muted py-12">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-8 text-center font-bold text-foreground text-xl">
            {t("stepsHeading")}
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                icon: MessageCircle,
                title: t("step1Title"),
                desc: t("step1Desc"),
              },
              {
                icon: Smartphone,
                title: t("step2Title"),
                desc: t("step2Desc"),
              },
              {
                icon: Check,
                title: t("step3Title"),
                desc: t("step3Desc"),
              },
            ].map((step) => (
              <div
                className="rounded-xl border border-border bg-background p-4 text-center"
                key={step.title}
              >
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <step.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-1 font-semibold text-foreground text-sm">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-12 text-center">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-3 font-bold text-2xl text-white">
            {t("ctaHeading")}
          </h2>
          <p className="mb-6 text-primary-foreground/80">{t("ctaSubtitle")}</p>
          <Link href="/founding">
            <Button
              className="rounded-full px-8 py-3 font-semibold text-base"
              variant="secondary"
            >
              {t("ctaButton")}
            </Button>
          </Link>
          <p className="mt-4 text-primary-foreground/60 text-xs">
            {t("ctaDisclaimer")}
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}

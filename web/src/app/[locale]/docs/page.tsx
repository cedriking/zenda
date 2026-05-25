import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { DocsAnimations } from "@/components/docs-animations";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("docs");
  return {
    alternates: {
      canonical: "https://zenda.bot/docs",
    },
    openGraph: {
      title: t("title"),
      description: t("desc"),
      url: "https://zenda.bot/docs",
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

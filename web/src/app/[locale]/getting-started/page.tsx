import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { GettingStartedPageClient } from "@/components/page-getting-started";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("gettingStarted");
  return {
    title: t("title"),
    description: t("desc"),
  };
}

export default function GettingStartedPage() {
  return (
    <div className="min-h-screen bg-neutral-200 pt-16">
      <Nav variant="simple" />
      <main className="rounded-b-[2rem] bg-white shadow-2xl">
        <div className="relative mx-auto max-w-4xl px-6 py-16">
          <GettingStartedPageClient />
        </div>
      </main>
      <Footer />
    </div>
  );
}

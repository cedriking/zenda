import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal");
  return {
    title: t("termsTitle"),
    description: "Zenda terms of service.",
  };
}

export default async function TermsPage() {
  const t = await getTranslations("legal");

  return (
    <div className="flex min-h-screen flex-col pt-16">
      <Nav variant="simple" />
      <article className="prose prose-slate mx-auto max-w-3xl flex-1 px-6 py-12">
        <h1>{t("termsTitle")}</h1>
        <p>
          <em>{t("lastUpdated", { date: new Date().toLocaleDateString() })}</em>
        </p>
        <p className="not-prose mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-700 text-sm">
          {t("disclaimer")}
        </p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By using Zenda, you agree to these Terms of Service. If you do not
          agree, do not use the service.
        </p>

        <h2>2. Description of Service</h2>
        <p>
          Zenda provides an AI-powered receptionist service that handles
          customer conversations and appointment scheduling via WhatsApp
          integration.
        </p>

        <h2>3. Account Responsibilities</h2>
        <p>
          You are responsible for maintaining the security of your account
          credentials and for all activities under your account.
        </p>

        <h2>4. Acceptable Use</h2>
        <p>
          You agree not to use Zenda for any unlawful purpose, to spam
          customers, or to misrepresent your business.
        </p>

        <h2>5. Billing</h2>
        <p>
          Subscriptions are billed monthly or annually. You may cancel at any
          time. Refunds are handled on a case-by-case basis.
        </p>

        <h2>6. Limitation of Liability</h2>
        <p>
          Zenda is provided as-is. We are not liable for any missed
          appointments, lost conversations, or business losses resulting from
          service interruptions.
        </p>

        <h2>7. Modifications</h2>
        <p>
          We may update these terms with 30 days notice. Continued use after
          changes constitutes acceptance.
        </p>

        <h2>8. Contact</h2>
        <p>For questions about these terms, contact us at legal@zenda.bot.</p>
      </article>
      <Footer />
    </div>
  );
}

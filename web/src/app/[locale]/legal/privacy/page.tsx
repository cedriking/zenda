import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal");
  return {
    title: t("privacyTitle"),
    description: "Zenda privacy policy.",
  };
}

export default async function PrivacyPage() {
  const t = await getTranslations("legal");

  return (
    <div className="flex min-h-screen flex-col pt-16">
      <Nav variant="simple" />
      <article className="prose prose-slate mx-auto max-w-3xl flex-1 px-6 py-12">
        <h1>{t("privacyTitle")}</h1>
        <p>
          <em>{t("lastUpdated", { date: new Date().toLocaleDateString() })}</em>
        </p>
        <p className="not-prose mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-700 text-sm">
          {t("disclaimer")}
        </p>

        <h2>1. Information We Collect</h2>
        <p>
          We collect information you provide directly (account details, business
          profile) and information generated through use of the service
          (conversations, appointment data, usage metrics).
        </p>

        <h2>2. How We Use Information</h2>
        <p>
          We use your information to provide and improve the Zenda service,
          process billing, send notifications, and provide customer support.
        </p>

        <h2>3. Data Storage</h2>
        <p>
          Your data is stored securely with encryption at rest and in transit.
          Conversation data is associated with your workspace and is not shared
          with third parties.
        </p>

        <h2>4. Customer Messages</h2>
        <p>
          Messages sent by your customers via WhatsApp are processed by our AI
          to handle appointments and inquiries. These messages are stored in
          your workspace and can be deleted by you at any time.
        </p>

        <h2>5. Data Retention</h2>
        <p>
          We retain your data for as long as your account is active. Upon
          account deletion, data is removed within 30 days.
        </p>

        <h2>6. Your Rights</h2>
        <p>
          You can export or delete your data at any time from your dashboard
          settings. Contact us at privacy@zenda.bot for any data-related
          requests.
        </p>

        <h2>7. Contact</h2>
        <p>For privacy questions, contact us at privacy@zenda.bot.</p>
      </article>
      <Footer />
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";

export function generateMetadata(): Metadata {
  return {
    title: "WhatsApp Appointment Reminders: Reduce No-Shows by 40% | Zenda",
    description:
      "Learn how automated WhatsApp appointment reminders reduce no-shows by up to 40%. Complete guide for salons, clinics, and appointment-based businesses.",
    alternates: {
      canonical: "https://zenda.bot/blog/whatsapp-appointment-reminders",
    },
    openGraph: {
      title: "WhatsApp Appointment Reminders: Reduce No-Shows by 40%",
      description: "Automated WhatsApp reminders cut no-shows by 40%. See how.",
      url: "https://zenda.bot/blog/whatsapp-appointment-reminders",
      type: "article",
    },
  };
}

export default function WhatsAppRemindersBlogPage() {
  return (
    <div className="min-h-screen bg-white">
      <Nav variant="simple" />

      <article className="mx-auto max-w-3xl px-6 py-16">
        <header className="mb-12">
          <p className="mb-3 font-semibold text-emerald-600 text-sm uppercase tracking-wide">
            For Appointment Businesses
          </p>
          <h1 className="mb-4 font-bold text-3xl text-slate-900 leading-tight md:text-4xl">
            WhatsApp Appointment Reminders: Reduce No-Shows by 40%
          </h1>
          <p className="text-slate-500">
            The complete guide to automated appointment reminders via WhatsApp —
            with real numbers and actionable steps.
          </p>
        </header>

        <section className="mb-10">
          <p className="mb-4 text-lg text-slate-700 leading-relaxed">
            No-shows are the silent revenue killer for appointment-based
            businesses. The average salon, clinic, or spa loses 15-30% of booked
            appointments to no-shows. That&apos;s thousands of dollars in lost
            revenue every month.
          </p>
          <p className="mb-4 text-slate-700 leading-relaxed">
            The fix is surprisingly simple:{" "}
            <strong>automated WhatsApp reminders</strong>. Businesses that
            implement WhatsApp reminders see no-show rates drop to 5-10% — a
            40%+ reduction.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            Why WhatsApp (not SMS or email)
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center">
              <div className="mb-2 font-black text-3xl text-emerald-600">
                98%
              </div>
              <p className="text-emerald-800 text-sm">
                WhatsApp open rate (vs 82% SMS, 20% email)
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center">
              <div className="mb-2 font-black text-3xl text-emerald-600">
                &lt;5min
              </div>
              <p className="text-emerald-800 text-sm">
                Average time to read a WhatsApp message
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center">
              <div className="mb-2 font-black text-3xl text-emerald-600">
                $0
              </div>
              <p className="text-emerald-800 text-sm">
                Cost per reminder (no per-message fees)
              </p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            The no-show math
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-slate-200 border-b">
                  <th className="py-3 pr-4 text-left font-semibold text-slate-600">
                    Scenario
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">
                    No-Show Rate
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">
                    Lost Revenue/Mo
                  </th>
                  <th className="py-3 pl-4 text-left font-semibold text-emerald-600">
                    With Zenda
                  </th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                <tr className="border-slate-100 border-b">
                  <td className="py-3 pr-4 font-medium">
                    Small salon (20 appts/wk)
                  </td>
                  <td className="px-4 py-3 text-slate-500">20%</td>
                  <td className="px-4 py-3 text-slate-500">$480</td>
                  <td className="py-3 pl-4 font-medium text-emerald-600">
                    $120
                  </td>
                </tr>
                <tr className="border-slate-100 border-b">
                  <td className="py-3 pr-4 font-medium">
                    Dental clinic (50 appts/wk)
                  </td>
                  <td className="px-4 py-3 text-slate-500">15%</td>
                  <td className="px-4 py-3 text-slate-500">$1,875</td>
                  <td className="py-3 pl-4 font-medium text-emerald-600">
                    $468
                  </td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium">
                    Med spa (35 appts/wk)
                  </td>
                  <td className="px-4 py-3 text-slate-500">25%</td>
                  <td className="px-4 py-3 text-slate-500">$1,750</td>
                  <td className="py-3 pl-4 font-medium text-emerald-600">
                    $437
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-slate-500 text-xs">
            Based on average appointment values: salon $30, dental $100, med spa
            $50.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            Best practices for appointment reminders
          </h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 font-bold text-lg text-white">
                1
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  Send 24 hours before
                </h3>
                <p className="mt-1 text-slate-600 text-sm leading-relaxed">
                  The single most impactful reminder. Include date, time,
                  service, and a quick-reply button to confirm or reschedule.
                  This alone reduces no-shows by 25%.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 font-bold text-lg text-white">
                2
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  Send 2 hours before
                </h3>
                <p className="mt-1 text-slate-600 text-sm leading-relaxed">
                  A shorter follow-up the same day. Catches people who confirmed
                  yesterday but forgot this morning. Keep it brief: &quot;Your
                  appointment is in 2 hours — see you soon!&quot;
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 font-bold text-lg text-white">
                3
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  Ask for confirmation
                </h3>
                <p className="mt-1 text-slate-600 text-sm leading-relaxed">
                  Don&apos;t just remind — ask them to confirm. Patients who
                  actively confirm show up 95% of the time. If they don&apos;t
                  confirm, you can offer that slot to someone else.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 font-bold text-lg text-white">
                4
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  Auto-fill cancelled slots
                </h3>
                <p className="mt-1 text-slate-600 text-sm leading-relaxed">
                  When someone cancels, automatically message your waitlist. A
                  cancelled appointment becomes a filled one — zero lost
                  revenue.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            How to set it up with Zenda
          </h2>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <ol className="space-y-3 text-slate-700">
              <li>
                <strong>Download Zenda</strong> (Mac or Windows) — 14-day free
                trial, no credit card
              </li>
              <li>
                <strong>Connect your WhatsApp Business</strong> — scan QR code,
                30 seconds
              </li>
              <li>
                <strong>Add your services and hours</strong> — Zenda learns your
                schedule
              </li>
              <li>
                <strong>Reminders are automatic</strong> — Zenda sends 24h and
                2h reminders for every booked appointment
              </li>
            </ol>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-6 font-bold text-2xl text-slate-900">FAQ</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900">
                Does this work with my existing WhatsApp number?
              </h3>
              <p className="mt-1 text-slate-600 text-sm">
                Yes. Zenda connects to your current WhatsApp Business number. No
                new number needed.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">
                Can I still reply manually?
              </h3>
              <p className="mt-1 text-slate-600 text-sm">
                Always. Zenda only handles automated responses. You can step in
                and reply personally at any time.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">
                What languages does it support?
              </h3>
              <p className="mt-1 text-slate-600 text-sm">
                9 languages: Spanish, English, Portuguese, French, German,
                Arabic, Japanese, Korean, and Chinese.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-slate-900 p-8 text-center">
          <h2 className="mb-3 font-bold text-2xl text-white">
            Start reducing no-shows today
          </h2>
          <p className="mb-6 text-slate-400">
            14-day free trial. No credit card required. Works with your existing
            WhatsApp.
          </p>
          <Link
            className="inline-block rounded-full bg-emerald-500 px-8 py-3 font-semibold text-white transition-colors hover:bg-emerald-600"
            href="/founding"
          >
            Start free trial
          </Link>
        </section>
      </article>

      <Footer />
    </div>
  );
}

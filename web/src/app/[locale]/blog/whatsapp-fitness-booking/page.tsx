import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const slug = "whatsapp-fitness-booking";
  return {
    title:
      "WhatsApp for Fitness Studios: Reduce No-Shows & Book More Classes | Zenda",
    description:
      "How fitness studios and gyms use WhatsApp automation to reduce class no-shows by 40%, automate booking, and keep members engaged. Free guide with ROI calculator.",
    alternates: {
      canonical: `https://zenda.bot/${locale}/blog/${slug}`,
      languages: {
        ...Object.fromEntries(
          routing.locales.map((l) => [l, `https://zenda.bot/${l}/blog/${slug}`])
        ),
        "x-default": `https://zenda.bot/en/blog/${slug}`,
      },
    },
    openGraph: {
      title:
        "WhatsApp for Fitness Studios: Reduce No-Shows & Book More Classes",
      description:
        "Fitness studios using WhatsApp automation cut no-shows 40% and boost retention. See how.",
      url: `https://zenda.bot/${locale}/blog/${slug}`,
      type: "article",
    },
  };
}

export default function WhatsAppFitnessBookingBlogPage() {
  return (
    <div className="min-h-screen bg-white">
      <Nav variant="simple" />

      <article className="mx-auto max-w-3xl px-6 py-16">
        <header className="mb-12">
          <p className="mb-3 font-semibold text-emerald-600 text-sm uppercase tracking-wide">
            For Fitness Studios &amp; Gyms
          </p>
          <h1 className="mb-4 font-bold text-3xl text-slate-900 leading-tight md:text-4xl">
            WhatsApp for Fitness Studios: Reduce No-Shows &amp; Book More
            Classes
          </h1>
          <p className="text-slate-500">
            How studios use WhatsApp automation to fill classes, retain members,
            and automate the booking grind — with real numbers and a 5-minute
            setup.
          </p>
        </header>

        <section className="mb-10">
          <p className="mb-4 text-lg text-slate-700 leading-relaxed">
            Fitness studios live and die by class attendance. A yoga class with
            5 empty spots isn&apos;t just $75-150 in lost revenue — it&apos;s a
            signal that members are disengaging. And disengaged members cancel.
          </p>
          <p className="mb-4 text-slate-700 leading-relaxed">
            The average fitness studio has a{" "}
            <strong>20-35% no-show rate</strong> for booked classes and loses
            30-40% of members within the first year. WhatsApp automation tackles
            both: filling empty spots and keeping members engaged between
            visits.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            Why WhatsApp works for fitness
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
              <h3 className="mb-2 font-bold text-emerald-900">
                Members already DM you
              </h3>
              <p className="text-emerald-800 text-sm">
                &quot;Is the 6pm class full?&quot; &quot;Can I reschedule?&quot;
                &quot;What time is spin tomorrow?&quot; Your members already use
                WhatsApp. You&apos;re just automating the response.
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
              <h3 className="mb-2 font-bold text-emerald-900">
                Class-based revenue model
              </h3>
              <p className="text-emerald-800 text-sm">
                Empty spots in group classes are permanently lost revenue. A
                single filled spot saves $15-30. Fill 10 extra spots per week =
                $600-1,200/month recovered.
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
              <h3 className="mb-2 font-bold text-emerald-900">
                Member retention
              </h3>
              <p className="text-emerald-800 text-sm">
                Members who receive workout reminders, class updates, and
                encouragement via WhatsApp attend 2x more often. More attendance
                = longer retention.
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
              <h3 className="mb-2 font-bold text-emerald-900">
                Personal training bookings
              </h3>
              <p className="text-emerald-800 text-sm">
                PT sessions are $50-100+. A single no-show costs more than a
                month of Zenda. Automated confirmations virtually eliminate PT
                no-shows.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            Revenue impact by studio size
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-slate-200 border-b">
                  <th className="py-3 pr-4 text-left font-semibold text-slate-600">
                    Studio Type
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">
                    Classes/Week
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">
                    Avg Spot Value
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">
                    Lost/Mo Now
                  </th>
                  <th className="py-3 pl-4 text-left font-semibold text-emerald-600">
                    Saved w/ Zenda
                  </th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                <tr className="border-slate-100 border-b">
                  <td className="py-3 pr-4 font-medium">Boutique studio</td>
                  <td className="px-4 py-3 text-slate-500">15</td>
                  <td className="px-4 py-3 text-slate-500">$20</td>
                  <td className="px-4 py-3 text-slate-500">$2,160</td>
                  <td className="py-3 pl-4 font-medium text-emerald-600">
                    $1,296
                  </td>
                </tr>
                <tr className="border-slate-100 border-b">
                  <td className="py-3 pr-4 font-medium">
                    Mid-size gym (2 rooms)
                  </td>
                  <td className="px-4 py-3 text-slate-500">35</td>
                  <td className="px-4 py-3 text-slate-500">$18</td>
                  <td className="px-4 py-3 text-slate-500">$4,536</td>
                  <td className="py-3 pl-4 font-medium text-emerald-600">
                    $2,722
                  </td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium">
                    Large fitness center
                  </td>
                  <td className="px-4 py-3 text-slate-500">60</td>
                  <td className="px-4 py-3 text-slate-500">$15</td>
                  <td className="px-4 py-3 text-slate-500">$6,480</td>
                  <td className="py-3 pl-4 font-medium text-emerald-600">
                    $3,888
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-slate-500 text-xs">
            Based on 25% no-show rate, 40% reduction with WhatsApp. Assumes 10
            spots per class, monthly (4.3 weeks).
          </p>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            5 ways fitness studios use WhatsApp automation
          </h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 font-bold text-lg text-white">
                1
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  Class booking on autopilot
                </h3>
                <p className="mt-1 text-slate-600 text-sm leading-relaxed">
                  Member texts &quot;book spin tomorrow 6pm&quot;. Zenda checks
                  availability, confirms the booking, and sends a calendar
                  reminder. Zero admin work.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 font-bold text-lg text-white">
                2
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  Waitlist management
                </h3>
                <p className="mt-1 text-slate-600 text-sm leading-relaxed">
                  When a class is full, members join the waitlist via WhatsApp.
                  When someone cancels, Zenda automatically messages the next
                  person: &quot;A spot opened in 6pm HIIT. Want it?&quot; First
                  reply gets it.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 font-bold text-lg text-white">
                3
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  Workout reminders &amp; motivation
                </h3>
                <p className="mt-1 text-slate-600 text-sm leading-relaxed">
                  Members who haven&apos;t booked in 3 days get a nudge:
                  &quot;Hey! We miss you. Here are tomorrow&apos;s classes with
                  spots open.&quot; Simple, personal, and it works — members who
                  get reminders attend 2x more.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 font-bold text-lg text-white">
                4
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  Personal training scheduling
                </h3>
                <p className="mt-1 text-slate-600 text-sm leading-relaxed">
                  PT clients book, reschedule, and get 24h confirmations all via
                  WhatsApp. Trainers get their schedule automatically. No-shows
                  drop from 15% to under 5%.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 font-bold text-lg text-white">
                5
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  New member onboarding
                </h3>
                <p className="mt-1 text-slate-600 text-sm leading-relaxed">
                  Day 1: &quot;Welcome! Here&apos;s your class schedule.&quot;
                  Day 3: &quot;How was your first class?&quot; Day 7:
                  &quot;Ready to book week 2?&quot; Automated onboarding
                  sequences dramatically improve first-month retention.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            Fitness businesses that benefit most
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <h3 className="font-bold text-slate-900">
                Yoga &amp; Pilates studios
              </h3>
              <p className="text-slate-600 text-sm">
                Small class sizes mean every spot matters. Automated booking and
                waitlists maximize every session.
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <h3 className="font-bold text-slate-900">CrossFit boxes</h3>
              <p className="text-slate-600 text-sm">
                Community-driven — WhatsApp keeps members engaged with WOD
                announcements, event invites, and accountability check-ins.
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <h3 className="font-bold text-slate-900">
                Personal training studios
              </h3>
              <p className="text-slate-600 text-sm">
                High-value sessions ($50-100+). One prevented no-show pays for
                the entire service.
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <h3 className="font-bold text-slate-900">Martial arts schools</h3>
              <p className="text-slate-600 text-sm">
                Belt testing, sparring sessions, and regular classes — automated
                scheduling keeps students on track.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            Set up in 5 minutes
          </h2>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <ol className="space-y-3 text-slate-700">
              <li>
                <strong>Download Zenda</strong> — Mac or Windows, 14-day free
                trial
              </li>
              <li>
                <strong>Connect WhatsApp</strong> — scan QR code, 30 seconds
              </li>
              <li>
                <strong>Add your classes</strong> — class types, capacity,
                schedule, and pricing
              </li>
              <li>
                <strong>Configure trainers</strong> — set each trainer&apos;s
                hours and specialties
              </li>
              <li>
                <strong>Go live</strong> — Zenda starts booking classes,
                managing waitlists, and sending reminders
              </li>
            </ol>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-6 font-bold text-2xl text-slate-900">FAQ</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900">
                Does it replace my current booking system?
              </h3>
              <p className="mt-1 text-slate-600 text-sm">
                Zenda has built-in scheduling, but members can also book through
                your existing website. WhatsApp is the channel — members text to
                book, and Zenda handles the rest.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">
                Can members see the full class schedule?
              </h3>
              <p className="mt-1 text-slate-600 text-sm">
                Yes. When a member asks &quot;what classes are available
                tomorrow?&quot;, Zenda responds with available classes, times,
                and remaining spots.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">
                How does the waitlist work?
              </h3>
              <p className="mt-1 text-slate-600 text-sm">
                When a class is full, members automatically join the waitlist.
                When someone cancels, the next waitlisted member gets a WhatsApp
                message offering the spot. First to confirm gets it.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">
                What about membership renewals?
              </h3>
              <p className="mt-1 text-slate-600 text-sm">
                Zenda can send renewal reminders before membership expires:
                &quot;Your monthly plan renews in 3 days. Want to upgrade to
                unlimited?&quot; Reduce churn with timely nudges.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-slate-900 p-8 text-center">
          <h2 className="mb-3 font-bold text-2xl text-white">
            Fill every class, every time
          </h2>
          <p className="mb-6 text-slate-400">
            14-day free trial. No credit card. Works with your existing
            WhatsApp. One filled class pays for the month.
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

import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { routing } from "@/i18n/routing";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const slug = "whatsapp-dental-clinic";
  return {
    title:
      "WhatsApp for Dental Clinics: Reduce Cancellations & Fill Your Calendar | Zenda",
    description:
      "How dental clinics use WhatsApp automation to reduce cancellations by 40%, fill last-minute openings, and book more patients. Step-by-step guide with ROI calculator.",
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
        "WhatsApp for Dental Clinics: Reduce Cancellations & Fill Your Calendar",
      description:
        "Dental clinics using WhatsApp automation cut cancellations 40%. See the numbers and how to start.",
      url: `https://zenda.bot/${locale}/blog/${slug}`,
      type: "article",
    },
  };
}

export default function WhatsAppDentalClinicBlogPage() {
  return (
    <div className="min-h-screen bg-white">
      <Nav variant="simple" />

      <article className="mx-auto max-w-3xl px-6 py-16">
        <header className="mb-12">
          <p className="mb-3 font-semibold text-emerald-600 text-sm uppercase tracking-wide">
            For Dental Clinics
          </p>
          <h1 className="mb-4 font-bold text-3xl text-slate-900 leading-tight md:text-4xl">
            WhatsApp for Dental Clinics: Reduce Cancellations &amp; Fill Your
            Calendar
          </h1>
          <p className="text-slate-500">
            The complete guide to using WhatsApp automation in your dental
            practice — with real numbers, ROI calculations, and a 5-minute
            setup.
          </p>
        </header>

        <section className="mb-10">
          <p className="mb-4 text-lg text-slate-700 leading-relaxed">
            Dental clinics have a unique scheduling problem. Appointments are
            long (30-90 minutes), high-value ($100-$500+), and patients
            frequently cancel or no-show. One empty chair for an hour isn&apos;t
            just lost revenue — it&apos;s a wasted resource that could have
            helped another patient.
          </p>
          <p className="mb-4 text-slate-700 leading-relaxed">
            The average dental practice loses{" "}
            <strong>$150-300 per no-show</strong>. With 15-25% no-show rates,
            that&apos;s $2,000-5,000 in monthly lost revenue. WhatsApp
            automation cuts that in half.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            Why WhatsApp works specifically for dental
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
              <h3 className="mb-2 font-bold text-emerald-900">
                Patients already message you
              </h3>
              <p className="text-emerald-800 text-sm">
                Most dental patients already reach out via WhatsApp for
                appointments, questions about procedures, and post-treatment
                follow-ups. You&apos;re just automating what&apos;s already
                happening.
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
              <h3 className="mb-2 font-bold text-emerald-900">
                High-value appointments
              </h3>
              <p className="text-emerald-800 text-sm">
                A single saved appointment (implant consultation, root canal,
                orthodontic visit) can be worth $200-500. Even preventing one
                no-show per week pays for the entire service.
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
              <h3 className="mb-2 font-bold text-emerald-900">
                Recall and follow-up
              </h3>
              <p className="text-emerald-800 text-sm">
                Dental requires regular recall visits (cleanings every 6 months,
                orthodontic adjustments monthly). WhatsApp makes recall
                campaigns instant and free.
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
              <h3 className="mb-2 font-bold text-emerald-900">
                Insurance and scheduling
              </h3>
              <p className="text-emerald-800 text-sm">
                Patients often have questions about insurance coverage or need
                to reschedule. Automated responses handle these 24/7 without
                requiring staff time.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            ROI calculator for dental clinics
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-slate-200 border-b">
                  <th className="py-3 pr-4 text-left font-semibold text-slate-600">
                    Practice Size
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">
                    Weekly Appts
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">
                    Avg Value
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
                  <td className="py-3 pr-4 font-medium">Solo dentist</td>
                  <td className="px-4 py-3 text-slate-500">30</td>
                  <td className="px-4 py-3 text-slate-500">$150</td>
                  <td className="px-4 py-3 text-slate-500">$2,700</td>
                  <td className="py-3 pl-4 font-medium text-emerald-600">
                    $1,620
                  </td>
                </tr>
                <tr className="border-slate-100 border-b">
                  <td className="py-3 pr-4 font-medium">
                    Small practice (2 dentists)
                  </td>
                  <td className="px-4 py-3 text-slate-500">60</td>
                  <td className="px-4 py-3 text-slate-500">$175</td>
                  <td className="px-4 py-3 text-slate-500">$6,300</td>
                  <td className="py-3 pl-4 font-medium text-emerald-600">
                    $3,780
                  </td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium">
                    Large clinic (4+ dentists)
                  </td>
                  <td className="px-4 py-3 text-slate-500">120</td>
                  <td className="px-4 py-3 text-slate-500">$200</td>
                  <td className="px-4 py-3 text-slate-500">$14,400</td>
                  <td className="py-3 pl-4 font-medium text-emerald-600">
                    $8,640
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-slate-500 text-xs">
            Based on 20% no-show rate, 40% reduction with WhatsApp reminders.
            Monthly figures (4.3 weeks).
          </p>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            5 ways dental clinics use WhatsApp automation
          </h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 font-bold text-lg text-white">
                1
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  Appointment confirmation requests
                </h3>
                <p className="mt-1 text-slate-600 text-sm leading-relaxed">
                  24 hours before each appointment, Zenda sends a WhatsApp
                  message with the date, time, procedure, and dentist name. The
                  patient taps Confirm or Reschedule. Confirmed patients show up
                  95% of the time.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 font-bold text-lg text-white">
                2
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  Automated waitlist filling
                </h3>
                <p className="mt-1 text-slate-600 text-sm leading-relaxed">
                  When a patient cancels, Zenda automatically messages your
                  waitlist: &quot;We have an opening tomorrow at 2pm for a
                  cleaning. Want it?&quot; First to reply gets the slot. Zero
                  wasted chair time.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 font-bold text-lg text-white">
                3
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  6-month recall campaigns
                </h3>
                <p className="mt-1 text-slate-600 text-sm leading-relaxed">
                  Automatically message patients 2 weeks before their 6-month
                  recall is due. &quot;Hi [name], it&apos;s time for your
                  cleaning! Want to schedule?&quot; One tap to book — no phone
                  tag, no voicemail.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 font-bold text-lg text-white">
                4
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  Post-treatment follow-up
                </h3>
                <p className="mt-1 text-slate-600 text-sm leading-relaxed">
                  24 hours after a procedure, Zenda checks in: &quot;How are you
                  feeling after your [procedure]? Reply if you have any
                  concerns.&quot; Catches complications early and shows patients
                  you care.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 font-bold text-lg text-white">
                5
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  24/7 new patient booking
                </h3>
                <p className="mt-1 text-slate-600 text-sm leading-relaxed">
                  New patients often search for dentists outside business hours.
                  Zenda answers their questions, explains services and pricing,
                  and books a consultation — even at 10pm on a Sunday. You wake
                  up to a full schedule.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            What dental procedures benefit most
          </h2>
          <ul className="space-y-3 text-slate-700">
            <li>
              <strong>Regular cleanings:</strong> High volume, easy to fill
              cancellations, perfect for recall automation
            </li>
            <li>
              <strong>Orthodontic adjustments:</strong> Monthly visits over
              12-24 months — automated reminders prevent missed adjustments
            </li>
            <li>
              <strong>Root canals and extractions:</strong> High-value, patients
              often nervous and likely to cancel — a reminder + reassurance
              message helps
            </li>
            <li>
              <strong>Implant consultations:</strong> $300+ appointment value.
              One saved no-show pays for a full month of Zenda
            </li>
            <li>
              <strong>Teeth whitening:</strong> Elective procedure — patients
              need a nudge to confirm and show up
            </li>
            <li>
              <strong>Pediatric dentistry:</strong> Parents are busy; automated
              reminders reduce the &quot;I forgot&quot; cancellations
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            Setup guide for dental clinics
          </h2>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <ol className="space-y-3 text-slate-700">
              <li>
                <strong>Download Zenda</strong> — Mac or Windows, 14-day free
                trial
              </li>
              <li>
                <strong>Connect your WhatsApp Business</strong> — scan QR code,
                30 seconds, keep your existing number
              </li>
              <li>
                <strong>Add your dental services</strong> — cleanings,
                consultations, fillings, whitening, etc. with duration and price
              </li>
              <li>
                <strong>Set dentist schedules</strong> — configure each
                dentist&apos;s hours, breaks, and procedure slots
              </li>
              <li>
                <strong>Enable reminders</strong> — Zenda automatically sends
                24h and 2h reminders with confirm/reschedule buttons
              </li>
            </ol>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-6 font-bold text-2xl text-slate-900">FAQ</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900">
                Does it integrate with my dental practice management software?
              </h3>
              <p className="mt-1 text-slate-600 text-sm">
                Zenda has its own built-in calendar and scheduling system. You
                can configure multiple providers, service types, and time slots
                without needing separate software.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">
                Is patient data secure?
              </h3>
              <p className="mt-1 text-slate-600 text-sm">
                Zenda connects to your WhatsApp Business account and processes
                messages locally on your device. No patient data is stored on
                external servers beyond what WhatsApp already handles.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">
                Can I customize the reminder messages?
              </h3>
              <p className="mt-1 text-slate-600 text-sm">
                Yes. Zenda learns your business and adapts messages to match
                your tone. You can also set specific messages for different
                procedures (e.g., a calming message for anxiety-prone
                procedures).
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">
                What about patients without WhatsApp?
              </h3>
              <p className="mt-1 text-slate-600 text-sm">
                Over 2 billion people use WhatsApp globally. In most markets,
                virtually all your patients already have it. For the few who
                don&apos;t, your staff can still call or SMS as before.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-slate-900 p-8 text-center">
          <h2 className="mb-3 font-bold text-2xl text-white">
            Stop losing revenue to no-shows
          </h2>
          <p className="mb-6 text-slate-400">
            14-day free trial. No credit card. Works with your existing
            WhatsApp. One saved appointment pays for the entire month.
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

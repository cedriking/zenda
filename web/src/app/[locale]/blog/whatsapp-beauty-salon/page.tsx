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
  const slug = "whatsapp-beauty-salon";
  return {
    title:
      "WhatsApp for Beauty Salons: Book More Appointments & Keep Your Chair Full | Zenda",
    description:
      "How beauty salons use WhatsApp automation to book more appointments, reduce no-shows by 40%, and respond to clients instantly. Free guide with setup in under 5 minutes.",
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
        "WhatsApp for Beauty Salons: Book More Appointments & Keep Your Chair Full",
      description:
        "Beauty salons using WhatsApp automation fill 40% more empty slots. See how.",
      url: `https://zenda.bot/${locale}/blog/${slug}`,
      type: "article",
    },
  };
}

export default function WhatsAppBeautySalonBlogPage() {
  return (
    <div className="min-h-screen bg-white">
      <Nav variant="simple" />

      <article className="mx-auto max-w-3xl px-6 py-16">
        <header className="mb-12">
          <p className="mb-3 font-semibold text-emerald-600 text-sm uppercase tracking-wide">
            For Beauty Salons
          </p>
          <h1 className="mb-4 font-bold text-3xl text-slate-900 leading-tight md:text-4xl">
            WhatsApp for Beauty Salons: Book More Appointments &amp; Keep Your
            Chair Full
          </h1>
          <p className="text-slate-500">
            How salons use WhatsApp automation to fill empty slots, reduce
            no-shows, and respond to clients in seconds — not hours.
          </p>
        </header>

        <section className="mb-10">
          <p className="mb-4 text-lg text-slate-700 leading-relaxed">
            Every beauty salon owner knows the frustration: a client books a
            2-hour coloring session and doesn&apos;t show up. That&apos;s
            $60-120 of lost revenue, plus the stylist sitting idle. Multiply
            that by 5-10 no-shows per week, and you&apos;re leaving $1,500-4,800
            on the table every month.
          </p>
          <p className="mb-4 text-slate-700 leading-relaxed">
            Meanwhile, potential new clients are messaging you on WhatsApp
            asking &quot;how much for a haircut?&quot; and &quot;do you have
            availability tomorrow?&quot; If you don&apos;t reply within minutes,
            they book somewhere else.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            The problem with manual WhatsApp management
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-slate-200 border-b">
                  <th className="py-3 pr-4 text-left font-semibold text-slate-600">
                    Task
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">
                    Manual
                  </th>
                  <th className="py-3 pl-4 text-left font-semibold text-emerald-600">
                    With Zenda
                  </th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                <tr className="border-slate-100 border-b">
                  <td className="py-3 pr-4 font-medium">
                    Reply &quot;how much for a haircut?&quot;
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    2-5 min per message
                  </td>
                  <td className="py-3 pl-4 font-medium text-emerald-600">
                    Instant, 24/7
                  </td>
                </tr>
                <tr className="border-slate-100 border-b">
                  <td className="py-3 pr-4 font-medium">
                    Check availability &amp; book
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    Open calendar, find slot, confirm
                  </td>
                  <td className="py-3 pl-4 font-medium text-emerald-600">
                    Auto-booked
                  </td>
                </tr>
                <tr className="border-slate-100 border-b">
                  <td className="py-3 pr-4 font-medium">
                    Send appointment reminders
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    Manual messages each morning
                  </td>
                  <td className="py-3 pl-4 font-medium text-emerald-600">
                    Automatic 24h + 2h before
                  </td>
                </tr>
                <tr className="border-slate-100 border-b">
                  <td className="py-3 pr-4 font-medium">
                    Fill cancellation slots
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    Post on Instagram stories, hope
                  </td>
                  <td className="py-3 pl-4 font-medium text-emerald-600">
                    Auto-message waitlist
                  </td>
                </tr>
                <tr className="border-slate-100 border-b">
                  <td className="py-3 pr-4 font-medium">
                    Handle after-hours inquiries
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    Reply next morning (client gone)
                  </td>
                  <td className="py-3 pl-4 font-medium text-emerald-600">
                    Instant reply, books appointment
                  </td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium">Cost</td>
                  <td className="px-4 py-3 text-slate-500">
                    2+ hours/day of your time
                  </td>
                  <td className="py-3 pl-4 font-medium text-emerald-600">
                    From $29/month
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            How much revenue are you losing
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center">
              <div className="mb-2 font-black text-3xl text-emerald-600">
                $480/mo
              </div>
              <p className="text-emerald-800 text-sm">
                Lost to no-shows (small salon, 20 appts/wk)
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center">
              <div className="mb-2 font-black text-3xl text-emerald-600">
                $960/mo
              </div>
              <p className="text-emerald-800 text-sm">
                Lost to slow replies (clients who went elsewhere)
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center">
              <div className="mb-2 font-black text-3xl text-emerald-600">
                $720/mo
              </div>
              <p className="text-emerald-800 text-sm">
                Recovered with WhatsApp automation
              </p>
            </div>
          </div>
          <p className="mt-3 text-slate-500 text-xs">
            Based on average salon: 20 appointments/week, $30 average value, 20%
            no-show rate, 40% reduction with reminders.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            What Zenda handles automatically
          </h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 font-bold text-lg text-white">
                1
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  Instant price quotes
                </h3>
                <p className="mt-1 text-slate-600 text-sm leading-relaxed">
                  When a client asks &quot;how much is a balayage?&quot;, Zenda
                  responds instantly with the price, duration, and available
                  times. No more losing clients to slow replies.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 font-bold text-lg text-white">
                2
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  Smart appointment booking
                </h3>
                <p className="mt-1 text-slate-600 text-sm leading-relaxed">
                  Client says &quot;I need a haircut and blowout this
                  week.&quot; Zenda checks your real-time availability and
                  offers 3 options. Client picks one — booked automatically. You
                  see it on your calendar.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 font-bold text-lg text-white">
                3
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  Two-touch reminders
                </h3>
                <p className="mt-1 text-slate-600 text-sm leading-relaxed">
                  24 hours before: &quot;Hi Maria, your color appointment is
                  tomorrow at 3pm with Ana. Confirm?&quot; 2 hours before:
                  &quot;See you in 2 hours!&quot; Two reminders = 40% fewer
                  no-shows.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 font-bold text-lg text-white">
                4
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  Cancellation recovery
                </h3>
                <p className="mt-1 text-slate-600 text-sm leading-relaxed">
                  When someone cancels, Zenda automatically messages clients who
                  previously asked for that time slot: &quot;We just had a
                  cancellation for Friday 4pm — want it?&quot; Empty slots fill
                  themselves.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            Services that benefit most from automation
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <h3 className="font-bold text-slate-900">Hair services</h3>
              <p className="text-slate-600 text-sm">
                Cuts, coloring, balayage, keratin treatments — high-value
                appointments where no-shows hurt most
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <h3 className="font-bold text-slate-900">Nail services</h3>
              <p className="text-slate-600 text-sm">
                Manicures, pedicures, gel, acrylics — high volume, easy to fill
                cancellations from waitlist
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <h3 className="font-bold text-slate-900">Facial treatments</h3>
              <p className="text-slate-600 text-sm">
                Facials, peels, microdermabrasion — clients often need follow-up
                sessions, perfect for automated rebooking
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <h3 className="font-bold text-slate-900">
                Waxing &amp; threading
              </h3>
              <p className="text-slate-600 text-sm">
                Regular clients every 4-6 weeks — automated recall messages keep
                them coming back
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
                trial, no credit card
              </li>
              <li>
                <strong>Connect your WhatsApp</strong> — scan QR code with
                WhatsApp Business, 30 seconds
              </li>
              <li>
                <strong>Add your services</strong> — list services, prices, and
                how long each takes
              </li>
              <li>
                <strong>Set your hours</strong> — configure availability for
                each stylist
              </li>
              <li>
                <strong>Done</strong> — Zenda starts responding to clients,
                booking appointments, and sending reminders automatically
              </li>
            </ol>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-6 font-bold text-2xl text-slate-900">FAQ</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900">
                Will my clients know it&apos;s automated?
              </h3>
              <p className="mt-1 text-slate-600 text-sm">
                Zenda responds conversationally and naturally. Clients feel like
                they&apos;re chatting with your front desk — fast, helpful, and
                always available.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">
                Can I still reply manually?
              </h3>
              <p className="mt-1 text-slate-600 text-sm">
                Always. You can jump into any conversation at any time. Zenda
                only handles messages when you&apos;re not available or
                don&apos;t respond.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">
                Does it work with multiple stylists?
              </h3>
              <p className="mt-1 text-slate-600 text-sm">
                Yes. Set up each stylist with their own schedule and services.
                Clients can request a specific stylist, and Zenda checks their
                availability.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">
                What if a client wants to see photos of work?
              </h3>
              <p className="mt-1 text-slate-600 text-sm">
                You can configure Zenda to send your portfolio images or
                redirect to your Instagram. Complex requests automatically get
                flagged for you to handle personally.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-slate-900 p-8 text-center">
          <h2 className="mb-3 font-bold text-2xl text-white">
            Keep your chair full this week
          </h2>
          <p className="mb-6 text-slate-400">
            14-day free trial. No credit card. Works with your existing
            WhatsApp. Set up in 5 minutes.
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

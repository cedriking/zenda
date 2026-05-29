import { Check, Clock, Phone, Users } from "lucide-react";
import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title:
      "Recepcionista Spa WhatsApp | Spas y Centros de Belleza 24/7 — Zenda",
    description:
      "Recepcionista virtual por WhatsApp para spas y centros de belleza. Agenda tratamientos, responde consultas sobre servicios y confirma citas automáticamente. Prueba gratis.",
    alternates: {
      canonical: "https://zenda.bot/es/recepcionista-spa-whatsapp",
      languages: {
        es: "https://zenda.bot/es/recepcionista-spa-whatsapp",
        en: "https://zenda.bot/en/recepcionista-spa-whatsapp",
        "x-default": "https://zenda.bot/en/recepcionista-spa-whatsapp",
      },
    },
    openGraph: {
      title: "Recepcionista Spa por WhatsApp — Spas y Centros de Belleza 24/7",
      description:
        "Tu spa responde consultas y agenda tratamientos por WhatsApp 24/7 con IA. Reduce cancelaciones y capta más clientes. Prueba gratis.",
      url: "https://zenda.bot/es/recepcionista-spa-whatsapp",
      type: "website",
      images: [
        {
          url: `https://zenda.bot/api/og?locale=${locale}`,
          width: 1200,
          height: 630,
          alt: "Zenda — Recepcionista Spa WhatsApp",
        },
      ],
    },
  };
}

const PAIN_POINTS = [
  {
    icon: Clock,
    text: "Clientes que escriben fuera de horario y se van con la competencia",
  },
  {
    icon: Phone,
    text: "Tu personal atendiendo WhatsApp en vez de atender clientes",
  },
  {
    icon: Users,
    text: "Citas que se pierden porque nadie confirma a tiempo",
  },
];

const FEATURES = [
  {
    title: "Agenda tratamientos automáticamente",
    desc: "Los clientes pueden reservar masajes, faciales y tratamientos por WhatsApp 24/7.",
  },
  {
    title: "Responde preguntas sobre servicios",
    desc: "Precios, duración de tratamientos, recomendaciones — la IA responde todo.",
  },
  {
    title: "Recordatorios automáticos",
    desc: "Envía recordatorios de citas para reducir cancelaciones.",
  },
  {
    title: "Gestiona cancelaciones y reprogramaciones",
    desc: "Los clientes pueden cambiar su cita sin llamar.",
  },
];

const FAQS = [
  {
    q: "How does the spa WhatsApp receptionist work?",
    a: "Zenda responde automáticamente los mensajes de WhatsApp de tus clientes. Agenda tratamientos como masajes, faciales, manicuras y más. Envía recordatorios y confirma citas — sin que tu personal tenga que estar pendiente del teléfono.",
  },
  {
    q: "Can it recommend treatments based on client needs?",
    a: "Sí. Configuras los tratamientos que ofreces con descripciones y contraindicaciones. La IA recomienda el tratamiento adecuado según lo que el cliente busca.",
  },
  {
    q: "Does it integrate with my booking system?",
    a: "Zenda se integra con Google Calendar, Outlook y los principales sistemas de reservas. Las citas se sincronizan automáticamente para evitar duplicados.",
  },
  {
    q: "How much does it cost?",
    a: "El plan gratuito incluye hasta 25 contactos mensuales. Los planes pagados empiezan desde $29 USD/mes por local. Ofrecemos 14 días de prueba gratis.",
  },
  {
    q: "What types of spas use Zenda?",
    a: "Spas de día, centros de belleza, clínicas estéticas, medspas, salones con servicios de spa y wellness centers usan Zenda para automatizar sus citas por WhatsApp.",
  },
];

export default function RecepcionistaSpaPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Zenda",
    applicationCategory: "BusinessApplication",
    operatingSystem: "WhatsApp",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "127",
    },
  };

  return (
    <div className="min-h-screen bg-white">
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        type="application/ld+json"
      />
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema),
        }}
        type="application/ld+json"
      />
      <Nav variant="simple" />

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pt-20 pb-16 text-center">
        <p className="mb-4 font-semibold text-emerald-600 text-sm uppercase tracking-wide">
          Recepcionista Spa por WhatsApp
        </p>
        <h1 className="mb-6 font-bold text-4xl text-slate-900 leading-tight md:text-5xl">
          Tu spa atiende{" "}
          <span className="text-emerald-600">clientes por WhatsApp 24/7</span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-600">
          Recepcionista virtual que agenda tratamientos, responde consultas
          sobre servicios y confirma citas automáticamente por WhatsApp. Sin
          contratar personal adicional.
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/founding">
            <Button className="rounded-full bg-emerald-600 px-8 py-3 text-base text-white hover:bg-emerald-700">
              Prueba Gratis 14 Días
            </Button>
          </Link>
          <Link href="/demo">
            <Button
              className="rounded-full border border-emerald-600 bg-white px-8 py-3 text-base text-emerald-600 hover:bg-emerald-50"
              variant="outline"
            >
              Agendar Demo
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-slate-400 text-sm">
          Plan gratis disponible · Sin tarjeta de crédito · Configura en 5
          minutos
        </p>
      </section>

      {/* Pain points */}
      <section className="border-slate-100 border-y bg-slate-50 py-12">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-8 text-center font-bold text-slate-900 text-xl">
            Problemas que viven los spas y centros de belleza cada día
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {PAIN_POINTS.map((pp) => (
              <div
                className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4"
                key={pp.text}
              >
                <pp.icon className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
                <p className="text-slate-700 text-sm">{pp.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-12 text-center font-bold text-2xl text-slate-900">
            Todo lo que Zenda hace por tu spa o centro de belleza
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {FEATURES.map((f) => (
              <div
                className="rounded-xl border border-slate-200 bg-white p-6"
                key={f.title}
              >
                <div className="mb-2 flex items-center gap-2">
                  <Check className="h-5 w-5 text-emerald-500" />
                  <h3 className="font-semibold text-slate-900">{f.title}</h3>
                </div>
                <p className="text-slate-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-slate-100 border-t bg-slate-50 py-16">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 px-6 md:grid-cols-3">
          {[
            { value: "40%", label: "menos cancelaciones" },
            { value: "24/7", label: "disponibilidad" },
            { value: "5 min", label: "setup" },
          ].map((stat) => (
            <div className="text-center" key={stat.label}>
              <p className="font-bold text-2xl text-emerald-600">
                {stat.value}
              </p>
              <p className="text-slate-500 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonial / Projection */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <blockquote className="border-emerald-600 border-l-4 py-2 pl-6 text-left text-lg text-slate-700 italic">
            &ldquo;Imagina si tu WhatsApp contestara cada mensaje de citas
            automáticamente. Tus clientas ya no tendrían que esperar horas por
            una respuesta.&rdquo;
          </blockquote>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-slate-100 border-t bg-slate-50 py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-12 text-center font-bold text-2xl text-slate-900">
            Preguntas frecuentes sobre recepcionista spa
          </h2>
          <div className="space-y-8">
            {FAQS.map((faq) => (
              <div key={faq.q}>
                <h3 className="mb-2 font-semibold text-slate-900">{faq.q}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-emerald-600 py-16 text-center">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-4 font-bold text-2xl text-white">
            Tu spa merece una recepcionista 24/7
          </h2>
          <p className="mb-8 text-emerald-100">
            Empieza con 14 días gratis. Agenda más tratamientos desde hoy.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/founding">
              <Button className="rounded-full bg-white px-8 py-3 font-semibold text-base text-emerald-700 hover:bg-emerald-50">
                Prueba Gratis 14 Días
              </Button>
            </Link>
            <Link href="/demo">
              <Button className="rounded-full border border-white px-8 py-3 font-semibold text-base text-white hover:bg-emerald-700">
                Agendar Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

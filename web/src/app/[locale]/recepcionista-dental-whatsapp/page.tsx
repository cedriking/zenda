import { Check, Clock, MessageSquare, Phone, Star, Users } from "lucide-react";
import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export function generateMetadata(): Metadata {
  return {
    title: "Recepcionista Dental WhatsApp | Clínicas Dentales 24/7 — Zenda",
    description:
      "Recepcionista virtual por WhatsApp para clínicas dentales. Agenda citas, responde consultas de tratamientos y confirma turnos automáticamente. Prueba gratis.",
    alternates: {
      canonical: "https://zenda.bot/es/recepcionista-dental-whatsapp",
    },
    openGraph: {
      title: "Recepcionista Dental por WhatsApp — Clínicas Dentales 24/7",
      description:
        "Tu clínica dental responde consultas y agenda citas por WhatsApp 24/7 con IA. Reduce inasistencias y capta más pacientes. Prueba gratis.",
      url: "https://zenda.bot/es/recepcionista-dental-whatsapp",
      type: "website",
      images: [{ url: "https://zenda.bot/api/og?locale=es", width: 1200, height: 630, alt: "Zenda — Recepcionista Dental WhatsApp" }],
    },
  };
}

const PAIN_POINTS = [
  { icon: Clock, text: "Pacientes que escriben fuera de horario y no reciben respuesta" },
  { icon: Phone, text: "Tu personal atendiendo WhatsApp en vez de tratar pacientes" },
  { icon: Users, text: "Citas que se pierden porque nadie confirma a tiempo" },
];

const FEATURES = [
  { title: "Agenda citas de limpieza, blanqueamiento y más", desc: "Configura todos tus tratamientos dentales con duración y precio. La IA agenda automáticamente según disponibilidad." },
  { title: "Responde consultas de tratamientos y precios", desc: "Información precisa sobre servicios, costos y planes de pago — directamente en WhatsApp." },
  { title: "Recordatorios para reducir inasistencias", desc: "Recordatorios automáticos 24h y 2h antes. Las clínicas dentales reducen inasistencias hasta un 40%." },
  { title: "Maneja múltiples dentistas", desc: "Cada dentista con su propia agenda. La IA verifica disponibilidad de cada profesional en tiempo real." },
  { title: "Funciona en español y portugués", desc: "Perfecto para clínicas en México, Colombia, Argentina, Brasil y toda Latinoamérica." },
  { title: "Integración con tu sistema actual", desc: "Sincroniza citas con Google Calendar, Outlook y los principales sistemas de gestión dental." },
];

const FAQS = [
  { q: "¿Cómo ayuda Zenda a una clínica dental?", a: "Zenda responde automáticamente los mensajes de WhatsApp de tus pacientes. Agenda citas para limpiezas, blanqueamientos, ortodoncia y más. Envía recordatorios y confirma turnos — sin que tu personal tenga que estar pendiente del teléfono." },
  { q: "¿Puede manejar citas para varios dentistas?", a: "Sí. Cada dentista tiene su propia agenda en Zenda. La IA verifica la disponibilidad de cada profesional y asigna la cita al dentista correcto según el tratamiento." },
  { q: "¿Funciona con seguros dentales?", a: "Puedes configurar la información de seguros dental que aceptas. La IA informa al paciente sobre cobertura y requisitos de aprobación." },
  { q: "¿Cuánto cuesta para una clínica dental?", a: "El plan gratuito incluye hasta 25 contactos mensuales. Los planes pagados empiezan desde $29 USD/mes por local. Ofrecemos 50% de descuento a las primeras clínicas." },
  { q: "¿Cuánto tiempo toma configurar?", a: "5 minutos. Conectas tu WhatsApp Business, defines tus tratamientos, horarios y dentistas. La IA empieza a responder de inmediato." },
];

export default function RecepcionistaDentalPage() {
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
    aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", reviewCount: "127" },
  };

  return (
    <div className="min-h-screen bg-white">
      <script dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} type="application/ld+json" />
      <script dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} type="application/ld+json" />
      <Nav variant="simple" />

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pt-20 pb-16 text-center">
        <p className="mb-4 font-semibold text-emerald-600 text-sm uppercase tracking-wide">
          Recepcionista Dental por WhatsApp
        </p>
        <h1 className="mb-6 font-bold text-4xl text-slate-900 leading-tight md:text-5xl">
          Tu clínica dental atiende <span className="text-emerald-600">pacientes por WhatsApp 24/7</span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-600">
          Recepcionista virtual que agenda citas, responde consultas sobre tratamientos y confirma turnos automáticamente por WhatsApp. Sin contratar personal adicional.
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/founding">
            <Button className="rounded-full bg-emerald-600 px-8 py-3 text-base text-white hover:bg-emerald-700">
              Probar gratis — Clínicas dentales
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-slate-400 text-sm">
          Plan gratis disponible · Sin tarjeta de crédito · Configura en 5 minutos
        </p>
      </section>

      {/* Pain points */}
      <section className="border-slate-100 border-y bg-slate-50 py-12">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-8 text-center font-bold text-xl text-slate-900">
            Problemas que viven las clínicas dentales cada día
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {PAIN_POINTS.map((pp) => (
              <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4" key={pp.text}>
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
            Todo lo que Zenda hace por tu clínica dental
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {FEATURES.map((f) => (
              <div className="rounded-xl border border-slate-200 bg-white p-6" key={f.title}>
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
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 px-6 md:grid-cols-4">
          {[
            { value: "3x", label: "más citas agendadas" },
            { value: "40%", label: "menos inasistencias" },
            { value: "<5s", label: "tiempo de respuesta" },
            { value: "24/7", label: "disponibilidad" },
          ].map((stat) => (
            <div className="text-center" key={stat.label}>
              <p className="font-bold text-2xl text-emerald-600">{stat.value}</p>
              <p className="text-slate-500 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-12 text-center font-bold text-2xl text-slate-900">
            Preguntas frecuentes sobre recepcionista dental
          </h2>
          <div className="space-y-8">
            {FAQS.map((faq) => (
              <div key={faq.q}>
                <h3 className="mb-2 font-semibold text-slate-900">{faq.q}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-emerald-600 py-16 text-center">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-4 font-bold text-2xl text-white">
            Tu clínica dental merece una recepcionista 24/7
          </h2>
          <p className="mb-8 text-emerald-100">
            Empieza con el plan gratis. Agenda más citas desde hoy.
          </p>
          <Link href="/founding">
            <Button className="rounded-full bg-white px-8 py-3 font-semibold text-base text-emerald-700 hover:bg-emerald-50">
              Probar gratis →
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

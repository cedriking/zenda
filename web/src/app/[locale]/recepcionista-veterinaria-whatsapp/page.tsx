import { Check, Clock, Phone, Users } from "lucide-react";
import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export function generateMetadata(): Metadata {
  return {
    title:
      "Recepcionista Veterinaria WhatsApp | Clínicas Veterinarias 24/7 — Zenda",
    description:
      "Recepcionista virtual por WhatsApp para clínicas veterinarias. Agenda consultas, responde consultas sobre vacunas y emergencias, confirma turnos automáticamente. Prueba gratis.",
    alternates: {
      canonical: "https://zenda.bot/es/recepcionista-veterinaria-whatsapp",
      languages: {
        es: "https://zenda.bot/es/recepcionista-veterinaria-whatsapp",
        en: "https://zenda.bot/en/recepcionista-veterinaria-whatsapp",
        "x-default": "https://zenda.bot/en/recepcionista-veterinaria-whatsapp",
      },
    },
    openGraph: {
      title:
        "Recepcionista Veterinaria por WhatsApp — Clínicas Veterinarias 24/7",
      description:
        "Tu clínica veterinaria responde consultas y agenda citas por WhatsApp 24/7 con IA. Reduce inasistencias y capta más pacientes. Prueba gratis.",
      url: "https://zenda.bot/es/recepcionista-veterinaria-whatsapp",
      type: "website",
      images: [
        {
          url: "https://zenda.bot/api/og?locale=es",
          width: 1200,
          height: 630,
          alt: "Zenda — Recepcionista Veterinaria WhatsApp",
        },
      ],
    },
  };
}

const PAIN_POINTS = [
  {
    icon: Clock,
    text: "Dueños de mascotas que escriben fuera de horario y no reciben respuesta",
  },
  {
    icon: Phone,
    text: "Tu personal atendiendo WhatsApp en vez de atender pacientes",
  },
  {
    icon: Users,
    text: "Consultas que se pierden porque nadie confirma a tiempo",
  },
];

const FEATURES = [
  {
    title: "Agenda consultas automáticamente",
    desc: "Los dueños pueden agendar vacunas, consultas y cirugías por WhatsApp 24/7",
  },
  {
    title: "Responde preguntas frecuentes",
    desc: "Vacunas, horarios, precios de consultas, urgencias — la IA responde todo",
  },
  {
    title: "Recordatorios automáticos",
    desc: "Envía recordatorios de citas y vacunas para reducir inasistencias",
  },
  {
    title: "Maneja urgencias",
    desc: "Detecta mensajes urgentes y los escala a tu equipo inmediatamente",
  },
];

const FAQS = [
  {
    q: "¿Cómo funciona la recepcionista veterinaria por WhatsApp?",
    a: "Zenda responde automáticamente los mensajes de WhatsApp de tus clientes. Agenda consultas, vacunas y cirugías según la disponibilidad de tu clínica. Envía recordatorios y confirma turnos — sin que tu personal tenga que estar pendiente del teléfono.",
  },
  {
    q: "¿Puede manejar solicitudes de emergencia?",
    a: "Sí. La IA detecta mensajes urgentes y los escala inmediatamente a tu equipo. Mientras tanto, guía al dueño de la mascota con primeros auxilios básicos y recopila información importante para el veterinario.",
  },
  {
    q: "¿Se integra con mi calendario?",
    a: "Sí. Zenda se sincroniza con Google Calendar, Outlook y los principales sistemas de gestión veterinaria. Las citas se agregan automáticamente a tu agenda existente.",
  },
  {
    q: "¿Cuánto cuesta?",
    a: "El plan gratuito incluye hasta 25 contactos mensuales. Los planes pagados empiezan desde $29 USD/mes por local. Ofrecemos 50% de descuento a las primeras clínicas veterinarias.",
  },
  {
    q: "¿Qué tipos de clínicas veterinarias usan Zenda?",
    a: "Clínicas veterinarias generales, hospitales veterinarios, clínicas especializadas en dermatología u oftalmología, y servicios de urgencias veterinarias. Zenda se adapta a cualquier especialidad.",
  },
];

export default function RecepcionistaVeterinariaPage() {
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
          Recepcionista Veterinaria por WhatsApp
        </p>
        <h1 className="mb-6 font-bold text-4xl text-slate-900 leading-tight md:text-5xl">
          Tu clínica veterinaria atiende{" "}
          <span className="text-emerald-600">pacientes por WhatsApp 24/7</span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-600">
          Recepcionista virtual que agenda consultas, responde preguntas sobre
          vacunas y emergencias, y confirma turnos automáticamente por WhatsApp.
          Sin contratar personal adicional.
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
            Problemas que viven las clínicas veterinarias cada día
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
            Todo lo que Zenda hace por tu clínica veterinaria
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
        <div className="mx-auto grid max-w-4xl grid-cols-3 gap-8 px-6">
          {[
            { value: "40%", label: "menos inasistencias" },
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

      {/* Testimonial */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <blockquote className="mb-6 text-slate-700 text-xl italic leading-relaxed">
            &ldquo;Imagina si tu WhatsApp contestara cada mensaje de citas
            automáticamente. Tus clientes ya no tendrían que esperar horas por
            una respuesta.&rdquo;
          </blockquote>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-slate-100 border-t bg-slate-50 py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-12 text-center font-bold text-2xl text-slate-900">
            Preguntas frecuentes sobre recepcionista veterinaria
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
            Tu clínica veterinaria merece una recepcionista 24/7
          </h2>
          <p className="mb-8 text-emerald-100">
            Empieza con el plan gratis. Agenda más consultas desde hoy.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/founding">
              <Button className="rounded-full bg-white px-8 py-3 font-semibold text-base text-emerald-700 hover:bg-emerald-50">
                Prueba Gratis 14 Días →
              </Button>
            </Link>
            <Link href="/demo">
              <Button className="rounded-full border border-white/30 bg-transparent px-8 py-3 font-semibold text-base text-white hover:bg-white/10">
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

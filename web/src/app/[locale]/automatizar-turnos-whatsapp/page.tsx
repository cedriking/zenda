import { Calendar, Check, Clock, MessageSquare } from "lucide-react";
import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export function generateMetadata(): Metadata {
  return {
    title: "Automatizar Turnos por WhatsApp | Argentina — Zenda",
    description:
      "Automatiza la gestión de turnos por WhatsApp en Argentina. Tu negocio responde, agenda y confirma turnos automáticamente con IA. Prueba gratis.",
    alternates: {
      canonical: "https://zenda.bot/es/automatizar-turnos-whatsapp",
      languages: {
        es: "https://zenda.bot/es/automatizar-turnos-whatsapp",
        en: "https://zenda.bot/en/automatizar-turnos-whatsapp",
        "x-default": "https://zenda.bot/en/automatizar-turnos-whatsapp",
      },
    },
    openGraph: {
      title: "Automatizar Turnos por WhatsApp — Argentina",
      description:
        "Automatiza turnos por WhatsApp para tu negocio en Argentina. IA que agenda, confirma y envía recordatorios. Prueba gratis.",
      url: "https://zenda.bot/es/automatizar-turnos-whatsapp",
      type: "website",
      images: [
        {
          url: "https://zenda.bot/api/og?locale=es",
          width: 1200,
          height: 630,
          alt: "Zenda — Automatizar Turnos WhatsApp Argentina",
        },
      ],
    },
  };
}

const FEATURES = [
  {
    title: "Gestión de turnos automática",
    desc: "El cliente pide un turno por WhatsApp y la IA verifica disponibilidad, agenda y confirma — todo en segundos.",
  },
  {
    title: "Recordatorios para reducir ausentismo",
    desc: "WhatsApp envía recordatorios automáticos. Reducí las inasistencias hasta un 40% sin llamar por teléfono.",
  },
  {
    title: "Reagenda y cancela por WhatsApp",
    desc: "Si el cliente no puede venir, la IA ofrece nuevos horarios y actualiza la agenda automáticamente.",
  },
  {
    title: "Múltiples profesionales",
    desc: "Cada profesional con su propia agenda. La IA asigna el turno según disponibilidad y especialidad.",
  },
  {
    title: "Funciona en español argentino",
    desc: "Entiende 'turno', 'reservar', 'che, ¿tenés hora?' y más expresiones locales. También disponible en portugués e inglés.",
  },
  {
    title: "Sin inversión en software",
    desc: "No necesitás contratar un desarrollador ni comprar software caro. Empezá gratis con hasta 25 turnos mensuales.",
  },
];

const FAQS = [
  {
    q: "¿Qué significa automatizar turnos por WhatsApp?",
    a: "Significa que cuando un cliente te pide un turno por WhatsApp, la inteligencia artificial responde automáticamente, verifica disponibilidad en tu agenda, confirma el turno y envía recordatorios — sin que tengas que hacer nada.",
  },
  {
    q: "¿Funciona para negocios en Argentina?",
    a: "Sí. Zenda funciona perfectamente en Argentina con WhatsApp Business. Entiende expresiones argentinas como 'turno', 'che', 'reservar', y maneja horarios y zonas horarias locales.",
  },
  {
    q: "¿Puedo usarlo con mi WhatsApp Business actual?",
    a: "Sí. Conectás tu número de WhatsApp Business existente. No necesitás un número nuevo ni cambiar nada en tu operación actual.",
  },
  {
    q: "¿Cuánto cuesta en Argentina?",
    a: "El plan gratis incluye hasta 25 turnos mensuales. Los planes pagados arrancan desde $29 USD/mes por local. Ofrecemos 50% de descuento a los primeros negocios argentinos.",
  },
  {
    q: "¿Qué tipos de negocios lo usan?",
    a: "Clínicas médicas y dentales, peluquerías y barberías, talleres mecánicos, gimnasios, estudios de yoga, veterinarias, y cualquier negocio que trabaje con turnos en Argentina.",
  },
];

export default function AutomatizarTurnosPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };

  return (
    <div className="min-h-screen bg-white">
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        type="application/ld+json"
      />
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Zenda — Automatizar Turnos WhatsApp",
            applicationCategory: "BusinessApplication",
            operatingSystem: "WhatsApp",
            description:
              "Automatizá la gestión de turnos por WhatsApp con IA. Agenda, confirma y envía recordatorios.",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
              description: "Plan gratuito disponible",
            },
          }),
        }}
        type="application/ld+json"
      />
      <Nav variant="simple" />

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pt-20 pb-16 text-center">
        <p className="mb-4 font-semibold text-emerald-600 text-sm uppercase tracking-wide">
          Automatizar Turnos por WhatsApp
        </p>
        <h1 className="mb-6 font-bold text-4xl text-slate-900 leading-tight md:text-5xl">
          Dejá de perder turnos por{" "}
          <span className="text-emerald-600">no contestar a tiempo</span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-600">
          Automatizá la gestión de turnos por WhatsApp. Tu negocio responde en
          segundos, agenda automáticamente y envía recordatorios — sin contratar
          personal.
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/founding">
            <Button className="rounded-full bg-emerald-600 px-8 py-3 text-base text-white hover:bg-emerald-700">
              Automatizar mis turnos — Gratis
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-slate-400 text-sm">
          Plan gratis disponible · Sin tarjeta · Configurá en 5 minutos
        </p>
      </section>

      {/* Stats */}
      <section className="border-slate-100 border-y bg-slate-50 py-12">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 px-6 md:grid-cols-4">
          {[
            { value: "3x", label: "más turnos agendados" },
            { value: "40%", label: "menos inasistencias" },
            { value: "<5s", label: "tiempo de respuesta" },
            { value: "24/7", label: "disponibilidad" },
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

      {/* Features */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-12 text-center font-bold text-2xl text-slate-900">
            Todo lo que la automatización hace por tu negocio
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

      {/* How it works */}
      <section className="border-slate-100 border-t bg-slate-50 py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-12 text-center font-bold text-2xl text-slate-900">
            Cómo funciona
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: MessageSquare,
                title: "Cliente escribe por WhatsApp",
                desc: "Un cliente te pide un turno por WhatsApp. La IA recibe el mensaje al instante.",
              },
              {
                icon: Calendar,
                title: "IA verifica y agenda",
                desc: "La IA consulta disponibilidad, propone horarios y confirma el turno automáticamente.",
              },
              {
                icon: Clock,
                title: "Recordatorios automáticos",
                desc: "WhatsApp envía recordatorios y el cliente puede confirmar o reagenda con un mensaje.",
              },
            ].map((s) => (
              <div className="text-center" key={s.title}>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                  <s.icon className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="mb-2 font-semibold text-slate-900">{s.title}</h3>
                <p className="text-slate-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing link */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            Planes desde $0 para tu negocio
          </h2>
          <p className="mb-6 text-slate-500">
            Empezá gratis con hasta 25 contactos. Planes completos desde $29
            USD/mes.
          </p>
          <Link href="/pricing">
            <Button
              className="rounded-full border border-emerald-600 bg-white px-6 py-2 text-emerald-600 hover:bg-emerald-50"
              variant="outline"
            >
              Ver planes y precios →
            </Button>
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-slate-100 border-t bg-slate-50 py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-12 text-center font-bold text-2xl text-slate-900">
            Preguntas frecuentes
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
            Empezá a automatizar tus turnos hoy
          </h2>
          <p className="mb-8 text-emerald-100">
            Dejá de perder turnos por respuestas lentas. Probá Zenda gratis.
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

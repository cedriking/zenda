import { Check, MessageSquare, Zap } from "lucide-react";
import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export function generateMetadata(): Metadata {
  return {
    title:
      "Mejor Alternativa a Respond.io para WhatsApp | Recepcionista IA para Citas — Zenda",
    description:
      "Respond.io es una plataforma de mensajería. Zenda es un recepcionista IA que agenda citas por WhatsApp automáticamente. Hecho para Latinoamérica. Prueba gratis.",
    alternates: {
      canonical: "https://zenda.bot/es/mejor-alternativa-respondio-whatsapp",
      languages: {
        es: "https://zenda.bot/es/mejor-alternativa-respondio-whatsapp",
        en: "https://zenda.bot/en/mejor-alternativa-respondio-whatsapp",
        ar: "https://zenda.bot/ar/mejor-alternativa-respondio-whatsapp",
        fr: "https://zenda.bot/fr/mejor-alternativa-respondio-whatsapp",
        de: "https://zenda.bot/de/mejor-alternativa-respondio-whatsapp",
        ru: "https://zenda.bot/ru/mejor-alternativa-respondio-whatsapp",
        zh: "https://zenda.bot/zh/mejor-alternativa-respondio-whatsapp",
        ja: "https://zenda.bot/ja/mejor-alternativa-respondio-whatsapp",
        ko: "https://zenda.bot/ko/mejor-alternativa-respondio-whatsapp",
        "x-default":
          "https://zenda.bot/es/mejor-alternativa-respondio-whatsapp",
      },
    },
    openGraph: {
      title: "Mejor Alternativa a Respond.io para WhatsApp — Zenda",
      description:
        "Respond.io es una plataforma de mensajería. Zenda es un recepcionista IA que agenda citas por WhatsApp. Hecho para Latinoamérica.",
      url: "https://zenda.bot/es/mejor-alternativa-respondio-whatsapp",
      type: "website",
      images: [
        {
          url: "https://zenda.bot/api/og?locale=es",
          width: 1200,
          height: 630,
          alt: "Zenda — Alternativa a Respond.io para WhatsApp",
        },
      ],
    },
  };
}

const DIFFERENTIATORS = [
  {
    icon: MessageSquare,
    title: "No gestiones conversaciones — agenda citas",
    desc: "Respond.io es una plataforma para gestionar conversaciones a escala. Zenda es un recepcionista de IA que conversa con tus clientes por WhatsApp y agenda citas automáticamente — sin que tú participes.",
  },
  {
    icon: Zap,
    title: "IA nativa, no workflows manuales",
    desc: "Respond.io requiere que construyas workflows complejos para automatizar. La IA de Zenda ya sabe agendar — entiende español, verifica disponibilidad y confirma citas sin configuración.",
  },
  {
    icon: Check,
    title: "Para PyMEs, no para agencias",
    desc: "Respond.io está diseñado para agencias y empresas grandes que manejan miles de conversaciones. Zenda está construido para el negocio Latino que necesita un recepcionista — simple, rápido, accesible.",
  },
];

const COMPARISON = [
  {
    feature: "Propósito",
    respondio: "Plataforma de mensajería",
    zenda: "Recepcionista IA para citas",
  },
  {
    feature: "Agendamiento automático",
    respondio: "No (requiere workflows complejos)",
    zenda: "Sí, nativo con IA",
  },
  {
    feature: "IA conversacional",
    respondio: "Workflows + IA básica",
    zenda: "IA que agenda citas",
  },
  {
    feature: "Enfoque geográfico",
    respondio: "Global (Malasia)",
    zenda: "Latinoamérica",
  },
  {
    feature: "Precio desde",
    respondio: "$79/mes (1 workspace)",
    zenda: "$0 (plan gratis)",
  },
  {
    feature: "Complejidad",
    respondio: "Alta (curva de aprendizaje)",
    zenda: "Baja (5 minutos setup)",
  },
  {
    feature: "Setup",
    respondio: "Horas/días",
    zenda: "5 minutos",
  },
  {
    feature: "Ideal para",
    respondio: "Agencias y enterprise",
    zenda: "Negocios basados en citas",
  },
];

const FAQS = [
  {
    q: "Por qué es Zenda mejor que Respond.io para agendar citas por WhatsApp?",
    a: "Respond.io es una plataforma para gestionar conversaciones de WhatsApp a escala — diseñada para agencias y equipos grandes. Zenda es un recepcionista de IA que agenda citas automáticamente. Si tu negocio necesita agendar, no gestionar conversaciones, Zenda es la mejor opción.",
  },
  {
    q: "Puedo migrar de Respond.io a Zenda?",
    a: "Sí. Solo necesitas conectar tu WhatsApp Business a Zenda y configurar tus servicios y horarios. No hay migración complicada — puedes estar recibiendo citas en menos de 5 minutos.",
  },
  {
    q: "Respond.io es más caro que Zenda?",
    a: "Mucho más. Respond.io cobra desde $79 USD/mes por workspace. Zenda tiene un plan gratis para empezar y los planes pagados comienzan desde $29 USD/mes.",
  },
  {
    q: "Respond.io tiene automatización, no es suficiente?",
    a: "Respond.io tiene workflows de automatización, pero necesitas construirlos manualmente — son complejos y técnicos. La IA de Zenda ya está entrenada para agendar citas. No necesitas crear ningún workflow.",
  },
  {
    q: "Qué tipos de negocios usan Zenda?",
    a: "Clínicas dentales, salones de belleza, barberías, spas, gimnasios, talleres mecánicos, veterinarias y cualquier negocio basado en citas en Latinoamérica.",
  },
  {
    q: "Zenda funciona para empresas grandes?",
    a: "Zenda está optimizado para PyMEs basadas en citas. Si necesitas gestionar miles de conversaciones con múltiples agentes, Respond.io puede ser mejor. Si necesitas un recepcionista que agenda citas, Zenda es la mejor opción.",
  },
];

export default function MejorAlternativaRespondioPage() {
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
            name: "Zenda — Alternativa a Respond.io para WhatsApp",
            applicationCategory: "BusinessApplication",
            operatingSystem: "WhatsApp",
            description:
              "La mejor alternativa a Respond.io para agendar citas por WhatsApp en LATAM. Recepcionista IA que agenda automáticamente.",
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

      <section className="mx-auto max-w-4xl px-6 pt-20 pb-16 text-center">
        <p className="mb-4 font-semibold text-emerald-600 text-sm uppercase tracking-wide">
          Alternativa a Respond.io para WhatsApp
        </p>
        <h1 className="mb-6 font-bold text-4xl text-slate-900 leading-tight md:text-5xl">
          Respond.io gestiona mensajes.{" "}
          <span className="text-emerald-600">Zenda agenda tus citas.</span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-600">
          La mejor alternativa a Respond.io para negocios en Latinoamérica que
          necesitan agendar citas por WhatsApp. Sin workflows complejos — la IA
          agenda por ti.
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/founding">
            <Button className="rounded-full bg-emerald-600 px-8 py-3 text-base text-white hover:bg-emerald-700">
              Probar Zenda gratis — Sin tarjeta
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-slate-400 text-sm">
          Plan gratis disponible · WhatsApp nativo · Español primero
        </p>
      </section>

      <section className="border-slate-100 border-y bg-slate-50 py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-12 text-center font-bold text-2xl text-slate-900">
            Por qué los negocios en LATAM eligen Zenda sobre Respond.io
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {DIFFERENTIATORS.map((d) => (
              <div
                className="rounded-lg border border-slate-200 bg-white p-6"
                key={d.title}
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                  <d.icon className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="mb-2 font-semibold text-slate-900">{d.title}</h3>
                <p className="text-slate-500 text-sm">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-12 text-center font-bold text-2xl text-slate-900">
            Zenda vs Respond.io — Comparación directa
          </h2>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-4 text-left font-semibold text-slate-900">
                    Característica
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-400">
                    Respond.io
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-emerald-600">
                    Zenda
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row) => (
                  <tr className="border-slate-100 border-t" key={row.feature}>
                    <td className="px-6 py-4 font-medium text-slate-700 text-sm">
                      {row.feature}
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-sm">
                      {row.respondio}
                    </td>
                    <td className="px-6 py-4 font-medium text-emerald-600 text-sm">
                      {row.zenda}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="border-slate-100 border-t bg-slate-50 py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-12 text-center font-bold text-2xl text-slate-900">
            Cómo funciona Zenda en 3 pasos
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Conecta tu WhatsApp",
                desc: "Vincula tu WhatsApp Business a Zenda en 2 minutos. Sin código.",
              },
              {
                step: "2",
                title: "Configura tus servicios",
                desc: "Define servicios, horarios y profesionales. La IA aprende tu negocio.",
              },
              {
                step: "3",
                title: "Recibe citas automáticamente",
                desc: "Los clientes escriben por WhatsApp y la IA agenda, confirma y recuerda.",
              },
            ].map((s) => (
              <div className="text-center" key={s.step}>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-600 text-lg">
                  {s.step}
                </div>
                <h3 className="mb-2 font-semibold text-slate-900">{s.title}</h3>
                <p className="text-slate-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-8 font-bold text-2xl text-slate-900">
            Miles de negocios en LATAM ya usan Zenda
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              "Clínicas dentales y consultorios médicos",
              "Salones de belleza y barberías",
              "Spas y centros de bienestar",
              "Gimnasios y estudios de yoga",
              "Talleres mecánicos",
              "Veterinarias",
              "Asesorías y servicios profesionales",
              "Restaurantes con reservaciones",
            ].map((uc) => (
              <div
                className="flex items-center gap-3 rounded-lg border border-slate-200 p-3"
                key={uc}
              >
                <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                <p className="text-slate-700 text-sm">{uc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-slate-100 border-t bg-slate-50 py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-12 text-center font-bold text-2xl text-slate-900">
            Preguntas frecuentes sobre Zenda vs Respond.io
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

      <section className="bg-emerald-600 py-16 text-center">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-4 font-bold text-2xl text-white">
            No gestiones mensajes. Agenda citas automáticamente.
          </h2>
          <p className="mb-8 text-emerald-100">
            Prueba Zenda gratis y descubre por qué es la mejor alternativa a
            Respond.io para agendar citas por WhatsApp en Latinoamérica.
          </p>
          <Link href="/founding">
            <Button className="rounded-full bg-white px-8 py-3 font-semibold text-base text-emerald-700 hover:bg-emerald-50">
              Probar Zenda gratis →
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

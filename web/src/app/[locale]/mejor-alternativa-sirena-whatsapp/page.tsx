import { Check, MessageSquare, Zap } from "lucide-react";
import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export function generateMetadata(): Metadata {
  return {
    title:
      "Mejor Alternativa a Sirena para WhatsApp | Recepcionista IA que Agenda Citas — Zenda",
    description:
      "Sirena distribuye leads. Zenda agenda citas automáticamente con IA por WhatsApp. Sin cambiar tu número, sin WhatsApp Business API obligatorio. Prueba gratis.",
    alternates: {
      canonical: "https://zenda.bot/es/mejor-alternativa-sirena-whatsapp",
      languages: {
        es: "https://zenda.bot/es/mejor-alternativa-sirena-whatsapp",
        en: "https://zenda.bot/en/mejor-alternativa-sirena-whatsapp",
        ar: "https://zenda.bot/ar/mejor-alternativa-sirena-whatsapp",
        fr: "https://zenda.bot/fr/mejor-alternativa-sirena-whatsapp",
        de: "https://zenda.bot/de/mejor-alternativa-sirena-whatsapp",
        ru: "https://zenda.bot/ru/mejor-alternativa-sirena-whatsapp",
        zh: "https://zenda.bot/zh/mejor-alternativa-sirena-whatsapp",
        ja: "https://zenda.bot/ja/mejor-alternativa-sirena-whatsapp",
        ko: "https://zenda.bot/ko/mejor-alternativa-sirena-whatsapp",
        "x-default": "https://zenda.bot/es/mejor-alternativa-sirena-whatsapp",
      },
    },
    openGraph: {
      title: "Mejor Alternativa a Sirena para WhatsApp — Zenda",
      description:
        "Sirena distribuye leads. Zenda los convierte en citas con IA por WhatsApp. Automatización inteligente para negocios en LATAM.",
      url: "https://zenda.bot/es/mejor-alternativa-sirena-whatsapp",
      type: "website",
      images: [
        {
          url: "https://zenda.bot/api/og?locale=es",
          width: 1200,
          height: 630,
          alt: "Zenda — Alternativa a Sirena para WhatsApp",
        },
      ],
    },
  };
}

const DIFFERENTIATORS = [
  {
    icon: MessageSquare,
    title: "IA que agenda, no que distribuye leads",
    desc: "Sirena es una plataforma de distribución de leads. Zenda es una recepcionista con IA que conversa con tus clientes y agenda citas automáticamente — sin intervención humana.",
  },
  {
    icon: Zap,
    title: "Sin cambiar tu número de WhatsApp",
    desc: "Sirena requiere WhatsApp Business API. Zenda se conecta fácilmente sin cambiar tu número actual. Tus clientes siguen escribiendo al mismo WhatsApp de siempre.",
  },
  {
    icon: Check,
    title: "Automatización inteligente, no manual",
    desc: "Sirena requiere asignación manual de leads por reglas. Zenda usa IA para manejar todo el flujo: responder, agendar, confirmar y recordar. Tus clientes obtienen respuesta inmediata 24/7.",
  },
];

const COMPARISON = [
  {
    feature: "Propósito",
    sirena: "Distribución de leads",
    zenda: "Recepcionista IA para citas",
  },
  {
    feature: "Agendamiento automático",
    sirena: "No",
    zenda: "Sí, nativo",
  },
  {
    feature: "IA conversacional",
    sirena: "Chatbots básicos",
    zenda: "IA que entiende y agenda",
  },
  {
    feature: "Mercado principal",
    sirena: "LATAM (ventaja compartida)",
    zenda: "LATAM",
  },
  {
    feature: "Precio desde",
    sirena: "$99 USD/mes",
    zenda: "$0 (plan gratis)",
  },
  {
    feature: "WhatsApp API",
    sirena: "Requerido",
    zenda: "Opcional",
  },
  {
    feature: "Asignación de leads",
    sirena: "Manual por reglas",
    zenda: "Automática por IA",
  },
  {
    feature: "Ideal para",
    sirena: "Equipos de ventas",
    zenda: "Negocios basados en citas",
  },
];

const FAQS = [
  {
    q: "Why es Zenda mejor que Sirena para mi negocio?",
    a: "Sirena distribuye leads entre tu equipo. Zenda va más allá: su IA conversa con cada cliente, entiende lo que necesita y agenda la cita automáticamente. No necesitas un equipo esperando para responder — Zenda lo hace 24/7.",
  },
  {
    q: "Can I migrate from Sirena to Zenda?",
    a: "Sí. Solo necesitas conectar tu WhatsApp a Zenda y configurar tus servicios. No hay migración de datos complicada — puedes empezar a recibir y agendar citas automáticamente desde el primer día.",
  },
  {
    q: "Does Zenda require WhatsApp Business API?",
    a: "No. A diferencia de Sirena, Zenda no requiere WhatsApp Business API obligatoriamente. Puedes conectarte fácilmente sin cambiar tu número de WhatsApp actual.",
  },
  {
    q: "How much does Zenda cost vs Sirena?",
    a: "Sirena cobra desde $99 USD/mes. Zenda tiene un plan gratis para empezar y planes pagados desde $29 USD/mes con funcionalidad completa de agendamiento con IA. 14 días de prueba gratis.",
  },
  {
    q: "What's the difference between Sirena and Zenda?",
    a: "Sirena es una plataforma de distribución de leads por WhatsApp: recibe mensajes y los asigna a agentes. Zenda es un recepcionista IA que maneja todo el flujo de agendamiento automáticamente — responde, agenda, confirma y recuerda citas sin intervención humana.",
  },
  {
    q: "What types of businesses use Zenda?",
    a: "Clínicas dentales, salones de belleza, barberías, spas, gimnasios, talleres mecánicos, veterinarias y cualquier negocio basado en citas en Latinoamérica.",
  },
];

export default function MejorAlternativaSirenaPage() {
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
            name: "Zenda — Alternativa a Sirena para WhatsApp",
            applicationCategory: "BusinessApplication",
            operatingSystem: "WhatsApp",
            description:
              "La mejor alternativa a Sirena para WhatsApp en LATAM. Recepcionista IA que agenda citas automáticamente por WhatsApp.",
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
          Alternativa a Sirena para WhatsApp
        </p>
        <h1 className="mb-6 font-bold text-4xl text-slate-900 leading-tight md:text-5xl">
          Sirena distribuye leads.{" "}
          <span className="text-emerald-600">Zenda agenda citas con IA.</span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-600">
          La mejor alternativa a Sirena para negocios en Latinoamérica. Zenda es
          un recepcionista con IA que agenda citas automáticamente por WhatsApp
          — sin cambiar tu número, sin asignación manual.
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/founding">
            <Button className="rounded-full bg-emerald-600 px-8 py-3 text-base text-white hover:bg-emerald-700">
              Probar Zenda gratis — Sin tarjeta
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-slate-400 text-sm">
          Plan gratis disponible · WhatsApp nativo · Sin API obligatoria
        </p>
      </section>

      {/* Why Zenda instead of Sirena */}
      <section className="border-slate-100 border-y bg-slate-50 py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-12 text-center font-bold text-2xl text-slate-900">
            Por qué los negocios en LATAM eligen Zenda sobre Sirena
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

      {/* Comparison table */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-12 text-center font-bold text-2xl text-slate-900">
            Zenda vs Sirena — Comparación directa
          </h2>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-4 text-left font-semibold text-slate-900">
                    Característica
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-400">
                    Sirena
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
                      {row.sirena}
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

      {/* How it works */}
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
                desc: "Vincula tu WhatsApp a Zenda en 2 minutos. Sin cambiar de número, sin API complicada.",
              },
              {
                step: "2",
                title: "Configura tus servicios",
                desc: "Define servicios, horarios y profesionales. La IA aprende tu negocio.",
              },
              {
                step: "3",
                title: "Recibe citas automáticamente",
                desc: "Los clientes escriben por WhatsApp y la IA agenda, confirma y recuerda — sin intervención humana.",
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

      {/* Social proof / businesses */}
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

      {/* FAQ */}
      <section className="border-slate-100 border-t bg-slate-50 py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-12 text-center font-bold text-2xl text-slate-900">
            Preguntas frecuentes sobre Zenda vs Sirena
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
            Deja de distribuir leads. Empieza a agendar citas con IA.
          </h2>
          <p className="mb-8 text-emerald-100">
            Prueba Zenda gratis y descubre por qué es la mejor alternativa a
            Sirena para negocios en Latinoamérica.
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

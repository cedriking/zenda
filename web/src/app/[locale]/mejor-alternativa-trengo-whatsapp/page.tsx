import { Check, MessageSquare, Zap } from "lucide-react";
import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export function generateMetadata(): Metadata {
  return {
    title:
      "Mejor Alternativa a Trengo para WhatsApp | Recepcionista IA para Citas — Zenda",
    description:
      "Trengo es una bandeja compartida. Zenda es un recepcionista IA que agenda citas por WhatsApp automáticamente. Enfocado en Latinoamérica, no en Europa. Prueba gratis.",
    alternates: {
      canonical: "https://zenda.bot/es/mejor-alternativa-trengo-whatsapp",
      languages: {
        es: "https://zenda.bot/es/mejor-alternativa-trengo-whatsapp",
        en: "https://zenda.bot/en/mejor-alternativa-trengo-whatsapp",
        ar: "https://zenda.bot/ar/mejor-alternativa-trengo-whatsapp",
        fr: "https://zenda.bot/fr/mejor-alternativa-trengo-whatsapp",
        de: "https://zenda.bot/de/mejor-alternativa-trengo-whatsapp",
        ru: "https://zenda.bot/ru/mejor-alternativa-trengo-whatsapp",
        zh: "https://zenda.bot/zh/mejor-alternativa-trengo-whatsapp",
        ja: "https://zenda.bot/ja/mejor-alternativa-trengo-whatsapp",
        ko: "https://zenda.bot/ko/mejor-alternativa-trengo-whatsapp",
        "x-default": "https://zenda.bot/es/mejor-alternativa-trengo-whatsapp",
      },
    },
    openGraph: {
      title: "Mejor Alternativa a Trengo para WhatsApp — Zenda",
      description:
        "Trengo es una bandeja compartida. Zenda es un recepcionista IA que agenda citas por WhatsApp. Hecho para Latinoamérica.",
      url: "https://zenda.bot/es/mejor-alternativa-trengo-whatsapp",
      type: "website",
      images: [
        {
          url: "https://zenda.bot/api/og?locale=es",
          width: 1200,
          height: 630,
          alt: "Zenda — Alternativa a Trengo para WhatsApp",
        },
      ],
    },
  };
}

const DIFFERENTIATORS = [
  {
    icon: MessageSquare,
    title:
      "No necesitas una bandeja de entrada compartida — necesitas un recepcionista",
    desc: "Trengo es una bandeja compartida para equipos de soporte. Zenda es un recepcionista de IA que activamente conversa con tus clientes y agenda citas por WhatsApp sin intervención humana.",
  },
  {
    icon: Zap,
    title: "IA que agenda, no que responde tickets",
    desc: "Trengo usa IA para sugerir respuestas a tickets. La IA de Zenda entiende solicitudes de citas en lenguaje natural y las agenda automáticamente en tu calendario.",
  },
  {
    icon: Check,
    title: "Enfocado en LATAM, no en Europa",
    desc: "Trengo es una empresa holandesa diseñada para PyMEs europeas. Zenda está construido para Latinoamérica — español nativo, WhatsApp primero, precios en dólares accesibles.",
  },
];

const COMPARISON = [
  {
    feature: "Propósito",
    trengo: "Bandeja compartida multi-canal",
    zenda: "Recepcionista IA para citas",
  },
  {
    feature: "Agendamiento automático",
    trengo: "No (requiere integración)",
    zenda: "Sí, nativo",
  },
  {
    feature: "IA conversacional",
    trengo: "Sugerencias de respuesta",
    zenda: "IA que agenda citas",
  },
  {
    feature: "Enfoque geográfico",
    trengo: "Europa (Holanda)",
    zenda: "Latinoamérica",
  },
  {
    feature: "Precio desde",
    trengo: "€20/mes (por usuario)",
    zenda: "$0 (plan gratis)",
  },
  {
    feature: "Canales",
    trengo: "WhatsApp, email, chat, redes",
    zenda: "WhatsApp (especializado)",
  },
  {
    feature: "Setup",
    trengo: "Moderado",
    zenda: "5 minutos",
  },
  {
    feature: "Ideal para",
    trengo: "Equipos de soporte",
    zenda: "Negocios basados en citas",
  },
];

const FAQS = [
  {
    q: "Why es Zenda mejor que Trengo para agendar citas por WhatsApp?",
    a: "Trengo es una herramienta de soporte al cliente con bandeja compartida. No fue diseñado para agendar citas. Zenda es un recepcionista de IA que conversa con tus clientes por WhatsApp, entiende cuando quieren una cita, y la agenda automáticamente en tu calendario.",
  },
  {
    q: "Can I migrate from Trengo to Zenda?",
    a: "Sí. Solo necesitas conectar tu WhatsApp Business a Zenda y configurar tus servicios y horarios. No hay migración complicada — puedes estar recibiendo citas por WhatsApp en menos de 5 minutos.",
  },
  {
    q: "Does Zenda support multiple channels like Trengo?",
    a: "Zenda se especializa en WhatsApp porque en Latinoamérica es el canal que usan el 95% de tus clientes. En lugar de ofrecer muchos canales mediocres, hacemos uno excepcionalmente bien.",
  },
  {
    q: "How much does Zenda cost vs Trengo?",
    a: "Trengo cobra desde €20/mes por usuario. Zenda tiene un plan gratis para hasta 25 contactos mensuales. Los planes pagados empiezan desde $29 USD/mes con funcionalidad completa, incluyendo agendamiento con IA.",
  },
  {
    q: "What's the difference between Trengo and Zenda?",
    a: "Trengo es una bandeja de entrada compartida para equipos de soporte al cliente. Zenda es un recepcionista de IA que agenda citas automáticamente por WhatsApp. Si tu negocio necesita agendar citas, Zenda es la mejor opción.",
  },
  {
    q: "What types of businesses use Zenda?",
    a: "Clínicas dentales, salones de belleza, barberías, spas, gimnasios, talleres mecánicos, veterinarias y cualquier negocio basado en citas en Latinoamérica.",
  },
];

export default function MejorAlternativaTrengoPage() {
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
            name: "Zenda — Alternativa a Trengo para WhatsApp",
            applicationCategory: "BusinessApplication",
            operatingSystem: "WhatsApp",
            description:
              "La mejor alternativa a Trengo para agendar citas por WhatsApp en LATAM. Recepcionista IA que agenda automáticamente.",
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
          Alternativa a Trengo para WhatsApp
        </p>
        <h1 className="mb-6 font-bold text-4xl text-slate-900 leading-tight md:text-5xl">
          Trengo es una bandeja compartida.{" "}
          <span className="text-emerald-600">
            Zenda es tu recepcionista IA.
          </span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-600">
          La mejor alternativa a Trengo para negocios en Latinoamérica que
          necesitan agendar citas. Tu recepcionista de IA conversa por WhatsApp
          y agenda automáticamente — sin tickets, sin esperar.
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

      {/* Why Zenda instead of Trengo */}
      <section className="border-slate-100 border-y bg-slate-50 py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-12 text-center font-bold text-2xl text-slate-900">
            Por qué los negocios en LATAM eligen Zenda sobre Trengo
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
            Zenda vs Trengo — Comparación directa
          </h2>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-4 text-left font-semibold text-slate-900">
                    Característica
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-400">
                    Trengo
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
                      {row.trengo}
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
            Preguntas frecuentes sobre Zenda vs Trengo
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
            No gestiones tickets. Agenda citas automáticamente.
          </h2>
          <p className="mb-8 text-emerald-100">
            Prueba Zenda gratis y descubre por qué es la mejor alternativa a
            Trengo para agendar citas por WhatsApp en Latinoamérica.
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

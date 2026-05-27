import { Check, MessageSquare, Zap } from "lucide-react";
import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export function generateMetadata(): Metadata {
  return {
    title:
      "Mejor Alternativa a ManyChat para WhatsApp | Recepcionista IA para Citas — Zenda",
    description:
      "ManyChat es una plataforma de chatbots. Zenda es un recepcionista IA que agenda citas reales por WhatsApp. Sin construir flujos, sin configuración compleja. Prueba gratis.",
    alternates: {
      canonical: "https://zenda.bot/es/mejor-alternativa-manychat-whatsapp",
      languages: {
        es: "https://zenda.bot/es/mejor-alternativa-manychat-whatsapp",
        en: "https://zenda.bot/en/mejor-alternativa-manychat-whatsapp",
        ar: "https://zenda.bot/ar/mejor-alternativa-manychat-whatsapp",
        fr: "https://zenda.bot/fr/mejor-alternativa-manychat-whatsapp",
        de: "https://zenda.bot/de/mejor-alternativa-manychat-whatsapp",
        ru: "https://zenda.bot/ru/mejor-alternativa-manychat-whatsapp",
        zh: "https://zenda.bot/zh/mejor-alternativa-manychat-whatsapp",
        ja: "https://zenda.bot/ja/mejor-alternativa-manychat-whatsapp",
        ko: "https://zenda.bot/ko/mejor-alternativa-manychat-whatsapp",
        "x-default": "https://zenda.bot/es/mejor-alternativa-manychat-whatsapp",
      },
    },
    openGraph: {
      title: "Mejor Alternativa a ManyChat para WhatsApp — Zenda",
      description:
        "ManyChat requiere construir flujos. Zenda es un recepcionista IA que agenda citas reales por WhatsApp. Sin fricción, sin configuración.",
      url: "https://zenda.bot/es/mejor-alternativa-manychat-whatsapp",
      type: "website",
      images: [
        {
          url: "https://zenda.bot/api/og?locale=es",
          width: 1200,
          height: 630,
          alt: "Zenda — Alternativa a ManyChat para WhatsApp",
        },
      ],
    },
  };
}

const DIFFERENTIATORS = [
  {
    icon: MessageSquare,
    title: "No construyas flujos — obtén un recepcionista",
    desc: "ManyChat requiere que construyas flujos de conversación con drag-and-drop. Zenda funciona desde el primer día con IA que entiende a tus clientes y agenda citas automáticamente.",
  },
  {
    icon: Zap,
    title: "Agendamiento real, no solo bots",
    desc: "ManyChat es una plataforma de chatbots. Zenda integra tu calendario y agenda citas reales. El cliente escribe 'quiero una cita mañana' y queda agendado — sin flujos manuales.",
  },
  {
    icon: Check,
    title: "WhatsApp-first, no Instagram-first",
    desc: "ManyChat está optimizado para Instagram y Messenger. Zenda es WhatsApp-first, que es el canal que realmente usan los negocios y clientes en Latinoamérica.",
  },
];

const COMPARISON = [
  {
    feature: "Propósito",
    manychat: "Plataforma de chatbots",
    zenda: "Recepcionista IA para citas",
  },
  {
    feature: "Agendamiento automático",
    manychat: "No (requiere integración)",
    zenda: "Sí, nativo",
  },
  {
    feature: "IA conversacional",
    manychat: "Flujos predefinidos",
    zenda: "IA que entiende lenguaje natural",
  },
  {
    feature: "Canal principal",
    manychat: "Instagram/Messenger",
    zenda: "WhatsApp",
  },
  {
    feature: "Precio desde",
    manychat: "$15 USD/mes (Pro)",
    zenda: "$0 (plan gratis)",
  },
  {
    feature: "Setup",
    manychat: "Construir flujos manualmente",
    zenda: "5 minutos",
  },
  {
    feature: "WhatsApp nativo",
    manychat: "Add-on",
    zenda: "Primario",
  },
  {
    feature: "Ideal para",
    manychat: "Marketing digital",
    zenda: "Negocios basados en citas",
  },
];

const FAQS = [
  {
    q: "Why es Zenda mejor que ManyChat para agendar citas?",
    a: "ManyChat es una plataforma de chatbots que requiere construir flujos manualmente. Zenda es un recepcionista IA que entiende lenguaje natural, se integra con tu calendario, y agenda citas reales por WhatsApp sin que tú programes nada.",
  },
  {
    q: "Can I migrate from ManyChat to Zenda?",
    a: "Yes. Solo necesitas conectar tu WhatsApp Business a Zenda y configurar tus servicios y horarios. No hay migración de datos complicada — empiezas a recibir citas por WhatsApp en minutos.",
  },
  {
    q: "Does Zenda support Instagram like ManyChat?",
    a: "Zenda se enfoca 100% en WhatsApp porque es el canal que más usan los negocios y clientes en Latinoamérica. Esta especialización permite una experiencia de agendamiento superior en el canal que realmente importa.",
  },
  {
    q: "How much does Zenda cost vs ManyChat?",
    a: "Zenda tiene un plan gratis disponible. ManyChat Pro empieza desde $15 USD/mes. Zenda está diseñado para ser accesible para cualquier negocio en LATAM, con planes pagados desde $29 USD/mes y 14 días de prueba gratis.",
  },
  {
    q: "What's the difference between ManyChat and Zenda?",
    a: "ManyChat es una plataforma de marketing de chatbots para Instagram y Messenger. Zenda es un recepcionista IA especializado en agendar citas por WhatsApp. ManyChat requiere construir flujos; Zenda funciona con IA desde el primer día.",
  },
  {
    q: "What types of businesses use Zenda?",
    a: "Clínicas dentales, salones de belleza, barberías, spas, gimnasios, talleres mecánicos, veterinarias y cualquier negocio basado en citas en Latinoamérica.",
  },
];

export default function MejorAlternativaManychatPage() {
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
            name: "Zenda — Alternativa a ManyChat para WhatsApp",
            applicationCategory: "BusinessApplication",
            operatingSystem: "WhatsApp",
            description:
              "La mejor alternativa a ManyChat para agendar citas por WhatsApp en LATAM. Recepcionista IA que agenda citas reales sin construir flujos.",
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
          Alternativa a ManyChat para WhatsApp
        </p>
        <h1 className="mb-6 font-bold text-4xl text-slate-900 leading-tight md:text-5xl">
          ManyChat construye bots.{" "}
          <span className="text-emerald-600">Zenda agenda citas reales.</span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-600">
          La mejor alternativa a ManyChat para negocios en Latinoamérica. No
          construyas flujos — obtén un recepcionista IA que agenda citas
          directamente por WhatsApp.
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

      {/* Why Zenda instead of ManyChat */}
      <section className="border-slate-100 border-y bg-slate-50 py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-12 text-center font-bold text-2xl text-slate-900">
            Por qué los negocios en LATAM eligen Zenda sobre ManyChat
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
            Zenda vs ManyChat — Comparación directa
          </h2>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-4 text-left font-semibold text-slate-900">
                    Característica
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-400">
                    ManyChat
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
                      {row.manychat}
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
            Preguntas frecuentes sobre Zenda vs ManyChat
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
            Deja de construir flujos. Obtén un recepcionista IA.
          </h2>
          <p className="mb-8 text-emerald-100">
            Prueba Zenda gratis y descubre por qué es la mejor alternativa a
            ManyChat para agendar citas por WhatsApp en Latinoamérica.
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

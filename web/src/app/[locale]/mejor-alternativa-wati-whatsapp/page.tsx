import { Check, MessageSquare, Zap } from "lucide-react";
import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const slug = "mejor-alternativa-wati-whatsapp";
  const title =
    "Mejor Alternativa a Wati para WhatsApp | Agendar Citas con IA — Zenda";
  const description =
    "Wati es una plataforma genérica de WhatsApp. Zenda es una recepcionista IA que agenda citas directamente por WhatsApp en Latinoamérica. Sin plantillas, sin complejidad. Prueba gratis.";

  if (locale !== "es") {
    return {
      title,
      description,
      robots: { index: false, follow: false },
      alternates: {
        canonical: `https://zenda.bot/es/${slug}`,
      },
    };
  }

  return {
    title,
    description,
    alternates: {
      canonical: `https://zenda.bot/es/${slug}`,
      languages: {
        ...Object.fromEntries(
          routing.locales.map((l) => [l, `https://zenda.bot/${l}/${slug}`])
        ),
        "x-default": "https://zenda.bot/en",
      },
    },
    openGraph: {
      title: "Mejor Alternativa a Wati para WhatsApp — Zenda",
      description:
        "Wati envía plantillas. Zenda chatea con IA por WhatsApp. Agendamiento automático para negocios en LATAM.",
      url: `https://zenda.bot/es/${slug}`,
      type: "website",
      images: [
        {
          url: `https://zenda.bot/api/og?locale=${locale}`,
          width: 1200,
          height: 630,
          alt: "Zenda — Alternativa a Wati para WhatsApp",
        },
      ],
    },
  };
}

const DIFFERENTIATORS = [
  {
    icon: MessageSquare,
    title: "No solo envía plantillas — chatea con IA",
    desc: "Wati envía mensajes con plantillas predefinidas. Zenda tiene conversaciones reales con IA que entiende lenguaje natural. Tus clientes escriben como quieren y la IA los entiende.",
  },
  {
    icon: Zap,
    title: "Diseñado para LATAM, no India",
    desc: "Wati está construido para el mercado indio y asiático. Zenda está diseñado específicamente para Latinoamérica, con español nativo y comprensión cultural de la región.",
  },
  {
    icon: Check,
    title: "Agendamiento automático incluido",
    desc: "Wati es una plataforma genérica de WhatsApp. Zenda tiene agendamiento de citas integrado desde el primer día. No necesitas integraciones externas ni configuraciones complejas.",
  },
];

const COMPARISON = [
  {
    feature: "Propósito principal",
    wati: "Plataforma WhatsApp genérica",
    zenda: "Recepcionista IA para citas",
  },
  {
    feature: "Agendamiento automático",
    wati: "No (requiere integración)",
    zenda: "Sí, incluido",
  },
  {
    feature: "IA conversacional",
    wati: "Bots básicos con flujos",
    zenda: "IA que entiende lenguaje natural",
  },
  {
    feature: "Enfoque geográfico",
    wati: "India y APAC",
    zenda: "Latinoamérica",
  },
  {
    feature: "Idioma",
    wati: "Inglés primero",
    zenda: "Español nativo",
  },
  {
    feature: "Precio desde",
    wati: "$29 USD/mes (solo plataforma)",
    zenda: "$0 (plan gratis disponible)",
  },
  {
    feature: "Setup",
    wati: "Complejo (BSP approval)",
    zenda: "Simple (5 minutos)",
  },
  {
    feature: "Templates WhatsApp",
    wati: "Sí (requiere diseño)",
    zenda: "No necesarios (IA conversacional)",
  },
];

const FAQS = [
  {
    q: "Why es Zenda mejor que Wati para agendar citas?",
    a: "Wati es una plataforma genérica de WhatsApp que requiere crear plantillas y flujos manuales. Zenda es una recepcionista IA que entiende lenguaje natural en español y agenda citas automáticamente. No necesitas diseñar plantillas ni flujos complicados — la IA conversa con tus clientes como lo haría un asistente humano.",
  },
  {
    q: "Can I migrate from Wati to Zenda?",
    a: "Yes. Solo necesitas conectar tu WhatsApp Business a Zenda y configurar tus servicios. No hay migración de datos complicada — empiezas a recibir citas por WhatsApp en minutos.",
  },
  {
    q: "Does Zenda require WhatsApp Business API approval?",
    a: "No. Zenda maneja toda la configuración técnica por ti. No necesitas aprobar un BSP ni configurar la API de WhatsApp Business por tu cuenta. Conectas tu número y listo.",
  },
  {
    q: "How much does Zenda cost vs Wati?",
    a: "Wati cobra desde $29 USD/mes solo por la plataforma, sin incluir agendamiento. Zenda tiene un plan gratis disponible y los planes pagados incluyen agendamiento automático, IA conversacional y recordatorios por WhatsApp.",
  },
  {
    q: "What's the difference between Wati and Zenda?",
    a: "Wati es una plataforma de marketing por WhatsApp enfocada en el mercado asiático. Zenda es una recepcionista IA especializada en agendar citas para negocios en Latinoamérica. Wati requiere diseñar plantillas y aprobar BSPs. Zenda funciona en 5 minutos con IA que habla español nativo.",
  },
  {
    q: "What types of businesses use Zenda?",
    a: "Clínicas dentales, salones de belleza, barberías, spas, gimnasios, talleres mecánicos, veterinarias y cualquier negocio basado en citas en Latinoamérica.",
  },
];

export default function MejorAlternativaWatiPage() {
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
            name: "Zenda — Alternativa a Wati para WhatsApp",
            applicationCategory: "BusinessApplication",
            operatingSystem: "WhatsApp",
            description:
              "La mejor alternativa a Wati para WhatsApp en LATAM. Agenda citas con IA directamente por WhatsApp.",
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
          Alternativa a Wati para WhatsApp
        </p>
        <h1 className="mb-6 font-bold text-4xl text-slate-900 leading-tight md:text-5xl">
          Wati envía plantillas.{" "}
          <span className="text-emerald-600">Zenda chatea con IA.</span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-600">
          La mejor alternativa a Wati para negocios en Latinoamérica. Tu
          recepcionista IA agenda citas directamente por WhatsApp — sin
          plantillas, sin flujos complejos, sin BSP approval.
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

      {/* Why Zenda instead of Wati */}
      <section className="border-slate-100 border-y bg-slate-50 py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-12 text-center font-bold text-2xl text-slate-900">
            Por qué los negocios en LATAM eligen Zenda sobre Wati
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
            Zenda vs Wati — Comparación directa
          </h2>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-4 text-left font-semibold text-slate-900">
                    Característica
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-400">
                    Wati
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
                      {row.wati}
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
                desc: "Vincula tu WhatsApp Business a Zenda en 5 minutos. Sin BSP approval ni configuraciones técnicas.",
              },
              {
                step: "2",
                title: "Configura tus servicios",
                desc: "Define servicios, horarios y profesionales. La IA aprende tu negocio.",
              },
              {
                step: "3",
                title: "Recibe citas automáticamente",
                desc: "Los clientes escriben por WhatsApp y la IA agenda, confirma y recuerda. Sin plantillas.",
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
            Preguntas frecuentes sobre Zenda vs Wati
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
            Deja de enviar plantillas. Empieza a chatear con IA.
          </h2>
          <p className="mb-8 text-emerald-100">
            Prueba Zenda gratis y descubre por qué es la mejor alternativa a
            Wati para negocios en Latinoamérica.
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

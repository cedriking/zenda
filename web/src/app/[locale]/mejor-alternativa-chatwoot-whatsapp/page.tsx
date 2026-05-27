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
  const slug = "mejor-alternativa-chatwoot-whatsapp";
  return {
    title:
      "Mejor Alternativa a Chatwoot para WhatsApp | Recepcionista IA para Citas — Zenda",
    description:
      "Chatwoot es open-source pero requiere servidores. Zenda es un recepcionista IA que agenda citas por WhatsApp automáticamente. Sin servidores, sin código. Prueba gratis.",
    alternates: {
      canonical: `https://zenda.bot/${locale}/${slug}`,
      languages: {
        ...Object.fromEntries(
          routing.locales.map((l) => [l, `https://zenda.bot/${l}/${slug}`])
        ),
        "x-default": `https://zenda.bot/es/${slug}`,
      },
    },
    openGraph: {
      title: "Mejor Alternativa a Chatwoot para WhatsApp — Zenda",
      description:
        "Chatwoot es open-source pero requiere servidores. Zenda es un recepcionista IA listo para usar. Hecho para LATAM.",
      url: `https://zenda.bot/${locale}/${slug}`,
      type: "website",
      images: [
        {
          url: "https://zenda.bot/api/og?locale=es",
          width: 1200,
          height: 630,
          alt: "Zenda — Alternativa a Chatwoot para WhatsApp",
        },
      ],
    },
  };
}

const DIFFERENTIATORS = [
  {
    icon: MessageSquare,
    title: "No necesitas servidores",
    desc: "Chatwoot es open-source pero necesitas tu propio servidor, base de datos y mantenimiento. Zenda funciona desde el primer día — sin infraestructura, sin DevOps.",
  },
  {
    icon: Zap,
    title: "IA que agenda citas, no un inbox",
    desc: "Chatwoot es una bandeja de entrada compartida. Alguien tiene que responder cada mensaje. La IA de Zenda conversa, agenda y confirma citas automáticamente — sin intervención humana.",
  },
  {
    icon: Check,
    title: "Listo en 5 minutos, no en 5 días",
    desc: "Instalar Chatwoot requiere configuración técnica: servidor, SSL, email, base de datos. Zenda se configura en 5 minutos — conectas WhatsApp, defines servicios y listo.",
  },
];

const COMPARISON = [
  {
    feature: "Propósito",
    chatwoot: "Bandeja de entrada compartida",
    zenda: "Recepcionista IA para citas",
  },
  {
    feature: "Agendamiento automático",
    chatwoot: "No",
    zenda: "Sí, nativo con IA",
  },
  {
    feature: "IA conversacional",
    chatwoot: "Básica (requiere configurar)",
    zenda: "IA nativa para citas",
  },
  {
    feature: "Requiere servidor propio",
    chatwoot: "Sí (self-hosted)",
    zenda: "No (SaaS)",
  },
  {
    feature: "Mantenimiento",
    chatwoot: "Tú lo haces",
    zenda: "Incluido",
  },
  {
    feature: "Precio",
    chatwoot: "Gratis (pero pagas servidor)",
    zenda: "Desde $0 (plan gratis)",
  },
  {
    feature: "Setup",
    chatwoot: "Horas/días (técnico)",
    zenda: "5 minutos",
  },
  {
    feature: "Ideal para",
    chatwoot: "Equipos técnicos",
    zenda: "Negocios basados en citas",
  },
];

const FAQS = [
  {
    q: "Por qué es Zenda mejor que Chatwoot para agendar citas por WhatsApp?",
    a: "Chatwoot es una herramienta de comunicación open-source — necesitas servidores, configuración técnica y alguien que responda cada mensaje. Zenda es un recepcionista de IA que agenda citas automáticamente. Sin servidores, sin código, sin intervención humana.",
  },
  {
    q: "Chatwoot es gratis, por qué pagar por Zenda?",
    a: "Chatwoot es gratis pero pagas el servidor ($5-50/mes), el SSL, el mantenimiento y tu tiempo configurando. Zenda tiene plan gratis y planes pagos desde $29/mes con todo incluido — hosting, IA, actualizaciones, soporte.",
  },
  {
    q: "Puedo usar Chatwoot y Zenda juntos?",
    a: "Son herramientas diferentes. Chatwoot gestiona conversaciones; Zenda agenda citas. Si solo necesitas agendar citas por WhatsApp, Zenda es suficiente y más simple.",
  },
  {
    q: "Qué tan técnico es instalar Chatwoot?",
    a: "Requiere conocimientos de Linux, Docker, bases de datos y SSL. Si no eres técnico, necesitas contratar a alguien — lo que encarece la supuesta solución 'gratis'.",
  },
  {
    q: "Qué tipos de negocios usan Zenda?",
    a: "Clínicas dentales, salones de belleza, barberías, spas, gimnasios, talleres mecánicos, veterinarias y cualquier negocio basado en citas en Latinoamérica.",
  },
  {
    q: "Zenda es tan personalizable como Chatwoot?",
    a: "Para agendar citas, Zenda es más personalizable porque está diseñado específicamente para eso. Chatwoot es genérico — tendrías que construir la funcionalidad de citas tú mismo.",
  },
];

export default function MejorAlternativaChatwootPage() {
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
            name: "Zenda — Alternativa a Chatwoot para WhatsApp",
            applicationCategory: "BusinessApplication",
            operatingSystem: "WhatsApp",
            description:
              "La mejor alternativa a Chatwoot para agendar citas por WhatsApp en LATAM. Sin servidores, sin código.",
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
          Alternativa a Chatwoot para WhatsApp
        </p>
        <h1 className="mb-6 font-bold text-4xl text-slate-900 leading-tight md:text-5xl">
          Chatwoot necesita servidores.{" "}
          <span className="text-emerald-600">
            Zenda funciona desde el minuto 1.
          </span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-600">
          La mejor alternativa a Chatwoot para negocios en Latinoamérica que
          necesitan agendar citas por WhatsApp. Sin DevOps, sin servidores —
          citas automáticas con IA.
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
            Por qué los negocios en LATAM eligen Zenda sobre Chatwoot
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
            Zenda vs Chatwoot — Comparación directa
          </h2>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-4 text-left font-semibold text-slate-900">
                    Característica
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-400">
                    Chatwoot
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
                      {row.chatwoot}
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
            Preguntas frecuentes sobre Zenda vs Chatwoot
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
            No instales servidores. Agenda citas automáticamente.
          </h2>
          <p className="mb-8 text-emerald-100">
            Prueba Zenda gratis y descubre por qué es la mejor alternativa a
            Chatwoot para agendar citas por WhatsApp en Latinoamérica.
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

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
  const slug = "mejor-alternativa-kommo-whatsapp";
  const title =
    "Mejor Alternativa a Kommo para WhatsApp | Agendar Citas con IA — Zenda";
  const description =
    "Kommo es un CRM. Zenda es un recepcionista IA que agenda citas directamente por WhatsApp. Sin configuración compleja, sin pipelines. Prueba gratis.";

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
      title: "Mejor Alternativa a Kommo para WhatsApp — Zenda",
      description:
        "Kommo es un CRM con WhatsApp. Zenda es un recepcionista IA que agenda citas automáticamente. Diseñado para negocios en LATAM.",
      url: `https://zenda.bot/es/${slug}`,
      type: "website",
      images: [
        {
          url: `https://zenda.bot/api/og?locale=${locale}`,
          width: 1200,
          height: 630,
          alt: "Zenda — Alternativa a Kommo para WhatsApp",
        },
      ],
    },
  };
}

const DIFFERENTIATORS = [
  {
    icon: MessageSquare,
    title: "No necesitas un CRM — necesitas un recepcionista",
    desc: "Kommo es un CRM completo con WhatsApp. La mayoría de salones y clínicas no necesitan gestionar pipelines de ventas, necesitan alguien que conteste WhatsApp y agenda citas. Zenda hace exactamente eso.",
  },
  {
    icon: Zap,
    title: "Cero configuración vs semanas de setup",
    desc: "Kommo requiere configurar pipelines, etapas, automatizaciones y plantillas. Zenda funciona desde el primer minuto: conectas WhatsApp, configuras tus servicios y la IA empieza a agendar.",
  },
  {
    icon: Check,
    title: "IA que agenda, no solo registra",
    desc: "Kommo registra conversaciones y requiere bots con flujos predefinidos. Zenda tiene IA que entiende español, conversa naturalmente con tus clientes y agenda citas automáticamente.",
  },
];

const COMPARISON = [
  {
    feature: "Propósito",
    kommo: "CRM con WhatsApp",
    zenda: "Recepcionista IA para citas",
  },
  {
    feature: "Agendamiento automático",
    kommo: "No (requiere integración)",
    zenda: "Sí, nativo",
  },
  {
    feature: "IA conversacional",
    kommo: "Bots con flujos",
    zenda: "IA que entiende español",
  },
  {
    feature: "Complejidad",
    kommo: "Alta (pipelines, etapas)",
    zenda: "Simple (conecta y usa)",
  },
  {
    feature: "Precio desde",
    kommo: "$15 USD/mes (por usuario)",
    zenda: "$0 (plan gratis)",
  },
  {
    feature: "Curva de aprendizaje",
    kommo: "Semanas",
    zenda: "Minutos",
  },
  {
    feature: "Ideal para",
    kommo: "Equipos de ventas",
    zenda: "Negocios basados en citas",
  },
  {
    feature: "WhatsApp nativo",
    kommo: "Sí (conectado)",
    zenda: "Sí (diseñado para WhatsApp)",
  },
];

const FAQS = [
  {
    q: "Why es Zenda mejor que Kommo para agendar citas por WhatsApp?",
    a: "Kommo es un CRM pensado para equipos de ventas. Si tu negocio necesita agendar citas (clínica, salón, spa), estás pagando por funcionalidades que no necesitas. Zenda está diseñado específicamente para agendar citas por WhatsApp con IA, sin configuración compleja ni curvas de aprendizaje.",
  },
  {
    q: "Can I migrate from Kommo to Zenda?",
    a: "Sí. Solo necesitas conectar tu WhatsApp Business a Zenda y configurar tus servicios. No hay migración de datos complicada — empiezas a recibir y agendar citas por WhatsApp en minutos.",
  },
  {
    q: "Does Zenda replace my CRM?",
    a: "Si tu negocio es basado en citas (salón, clínica, spa), Zenda puede reemplazar completamente tu CRM porque hace exactamente lo que necesitas: contestar WhatsApp y agendar. Si necesitas un CRM para gestión de ventas compleja, Zenda complementa tu CRM manejando la parte de agendamiento.",
  },
  {
    q: "How much does Zenda cost vs Kommo?",
    a: "Zenda tiene un plan gratis disponible. Kommo cobra desde $15 USD por usuario al mes. Para un negocio basado en citas, Zenda ofrece exactamente lo que necesitas a una fracción del costo.",
  },
  {
    q: "What's the difference between Kommo and Zenda?",
    a: "Kommo (antes amoCRM) es un CRM completo con integración de WhatsApp, diseñado para equipos de ventas con pipelines y automatizaciones. Zenda es un recepcionista IA que agenda citas directamente por WhatsApp, diseñado para negocios como clínicas, salones y spas en Latinoamérica.",
  },
  {
    q: "What types of businesses use Zenda?",
    a: "Clínicas dentales, salones de belleza, barberías, spas, gimnasios, talleres mecánicos, veterinarias y cualquier negocio basado en citas en Latinoamérica.",
  },
];

export default function MejorAlternativaKommoPage() {
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
            name: "Zenda — Alternativa a Kommo para WhatsApp",
            applicationCategory: "BusinessApplication",
            operatingSystem: "WhatsApp",
            description:
              "La mejor alternativa a Kommo para agendar citas por WhatsApp en LATAM. Recepcionista IA que agenda automáticamente.",
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
          Alternativa a Kommo para WhatsApp
        </p>
        <h1 className="mb-6 font-bold text-4xl text-slate-900 leading-tight md:text-5xl">
          Kommo es un CRM.{" "}
          <span className="text-emerald-600">
            Zenda es un recepcionista que agenda.
          </span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-600">
          La mejor alternativa a Kommo para negocios basados en citas. Zenda
          contesta WhatsApp y agenda citas con inteligencia artificial — sin
          pipelines, sin semanas de configuración, sin complicaciones.
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

      {/* Why Zenda instead of Kommo */}
      <section className="border-slate-100 border-y bg-slate-50 py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-12 text-center font-bold text-2xl text-slate-900">
            Por qué los negocios en LATAM eligen Zenda sobre Kommo
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
            Zenda vs Kommo — Comparación directa
          </h2>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-4 text-left font-semibold text-slate-900">
                    Característica
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-400">
                    Kommo
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
                      {row.kommo}
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
            Preguntas frecuentes sobre Zenda vs Kommo
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
            No necesitas un CRM. Necesitas un recepcionista.
          </h2>
          <p className="mb-8 text-emerald-100">
            Prueba Zenda gratis y descubre por qué es la mejor alternativa a
            Kommo para agendar citas por WhatsApp en Latinoamérica.
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

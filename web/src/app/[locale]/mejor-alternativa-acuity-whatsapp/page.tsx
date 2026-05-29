import { Check, Globe, MessageSquare, Zap } from "lucide-react";
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
  const slug = "mejor-alternativa-acuity-whatsapp";
  const title =
    "Mejor Alternativa a Acuity Scheduling para WhatsApp | Agendar Citas con IA — Zenda";
  const description =
    "Acuity Scheduling no es nativo para WhatsApp. Zenda agenda citas directamente por WhatsApp con IA en español. Sin descargar apps, sin formularios. Prueba gratis.";

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
      title: "Mejor Alternativa a Acuity Scheduling para WhatsApp — Zenda",
      description:
        "Acuity no funciona en WhatsApp. Zenda agenda citas con IA directamente por WhatsApp para negocios en LATAM. Sin apps, sin fricción.",
      url: `https://zenda.bot/es/${slug}`,
      type: "website",
      images: [
        {
          url: `https://zenda.bot/api/og?locale=${locale}`,
          width: 1200,
          height: 630,
          alt: "Zenda — Alternativa a Acuity Scheduling para WhatsApp",
        },
      ],
    },
  };
}

const DIFFERENTIATORS = [
  {
    icon: MessageSquare,
    title: "WhatsApp, no formularios web",
    desc: "Acuity Scheduling requiere que los clientes abran una página web y llenen un formulario. Zenda funciona directamente dentro de WhatsApp, donde tus clientes ya están.",
  },
  {
    icon: Globe,
    title: "Español primero, no traducción",
    desc: "Acuity fue diseñado en inglés para el mercado estadounidense. Zenda fue construido desde cero para Latinoamérica, con IA que entiende español nativo y expresiones regionales.",
  },
  {
    icon: Zap,
    title: "Sin descargar nada",
    desc: "Tus clientes no necesitan descargar apps ni crear cuentas. Solo escriben por WhatsApp como siempre hacen. La experiencia es natural y sin fricción.",
  },
];

const COMPARISON = [
  {
    feature: "Canal principal",
    acuity: "Página web / formulario",
    zenda: "WhatsApp directo",
  },
  {
    feature: "Experiencia del cliente",
    acuity: "Abre enlace, selecciona hora, llena datos",
    zenda: "Escribe por WhatsApp y listo",
  },
  {
    feature: "Idioma",
    acuity: "Inglés con traducción básica",
    zenda: "Español nativo con IA",
  },
  {
    feature: "App requerida para el cliente",
    acuity: "Navegador web",
    zenda: "Ninguna (solo WhatsApp)",
  },
  {
    feature: "Maneja reagendas por chat",
    acuity: "No — usa enlace otra vez",
    zenda: "Sí — cliente escribe por WhatsApp",
  },
  {
    feature: "Responde preguntas de precios",
    acuity: "No",
    zenda: "Sí — IA conversacional",
  },
  {
    feature: "Recordatorios por WhatsApp",
    acuity: "No nativo (requiere integración)",
    zenda: "Incluido en todos los planes",
  },
  {
    feature: "Diseñado para LATAM",
    acuity: "No",
    zenda: "Sí",
  },
  {
    feature: "Precio desde",
    acuity: "$16 USD/mes",
    zenda: "$0 (plan gratis disponible)",
  },
];

const FAQS = [
  {
    q: "Why es Zenda mejor que Acuity Scheduling para WhatsApp?",
    a: "Acuity Scheduling es una herramienta de agendamiento web que funciona con enlaces y formularios. Zenda opera directamente dentro de WhatsApp, el canal que el 95% de los latinoamericanos usa diariamente. No hay enlaces ni formularios — el cliente escribe y la IA agenda.",
  },
  {
    q: "Does Zenda work in Spanish?",
    a: "Sí, Zenda fue diseñado desde cero para el mercado hispanohablante. La IA entiende español nativo, expresiones regionales y lenguaje coloquial.",
  },
  {
    q: "Do my clients need to download an app?",
    a: "No. Tus clientes solo necesitan WhatsApp, que ya tienen instalado. No hay apps adicionales, cuentas ni formularios.",
  },
  {
    q: "Can Zenda handle rescheduling and cancellations?",
    a: "Sí. Si un cliente necesita cambiar o cancelar su cita, solo escribe por WhatsApp y la IA ofrece nuevas opciones de horario automáticamente.",
  },
  {
    q: "How much does Zenda cost?",
    a: "El plan gratis incluye hasta 25 contactos mensuales. Los planes pagados empiezan desde $29 USD/mes con funcionalidad completa. 14 días de prueba gratis sin tarjeta de crédito.",
  },
  {
    q: "Can I integrate Zenda with my existing calendar?",
    a: "Sí, Zenda se integra con Google Calendar para sincronizar disponibilidad y citas automáticamente.",
  },
];

export default function MejorAlternativaAcuityPage() {
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
            name: "Zenda — Alternativa a Acuity Scheduling para WhatsApp",
            applicationCategory: "BusinessApplication",
            operatingSystem: "WhatsApp",
            description:
              "La mejor alternativa a Acuity Scheduling para WhatsApp en LATAM. Agenda citas con IA en español, sin descargar nada.",
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
          Alternativa a Acuity Scheduling para WhatsApp
        </p>
        <h1 className="mb-6 font-bold text-4xl text-slate-900 leading-tight md:text-5xl">
          Acuity no funciona en WhatsApp.{" "}
          <span className="text-emerald-600">Zenda sí.</span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-600">
          La mejor alternativa a Acuity Scheduling para negocios en
          Latinoamérica. Agenda citas con IA directamente por WhatsApp — sin
          descargar apps, sin formularios, en español nativo.
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/founding">
            <Button className="rounded-full bg-emerald-600 px-8 py-3 text-base text-white hover:bg-emerald-700">
              Probar Zenda gratis — Sin tarjeta
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-slate-400 text-sm">
          Plan gratis disponible · Sin apps · 100% en español
        </p>
      </section>

      {/* Why Zenda instead of Acuity */}
      <section className="border-slate-100 border-y bg-slate-50 py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-12 text-center font-bold text-2xl text-slate-900">
            Por qué Zenda es mejor que Acuity para LATAM
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
            Zenda vs Acuity Scheduling — Comparación directa
          </h2>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-4 text-left font-semibold text-slate-900">
                    Característica
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-400">
                    Acuity Scheduling
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
                      {row.acuity}
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
            Empieza en 3 pasos
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Conecta WhatsApp Business",
                desc: "Vincula tu número de WhatsApp Business a Zenda en 2 minutos.",
              },
              {
                step: "2",
                title: "Configura tu negocio",
                desc: "Agrega servicios, horarios y profesionales. La IA aprende tu operación.",
              },
              {
                step: "3",
                title: "Atiende clientes 24/7",
                desc: "La IA responde, agenda, confirma y envía recordatorios automáticamente.",
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

      {/* Businesses */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-8 font-bold text-2xl text-slate-900">
            Perfecto para negocios basados en citas
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              "Clínicas dentales y consultorios",
              "Salones de belleza y barberías",
              "Spas y centros de bienestar",
              "Gimnasios y estudios de fitness",
              "Talleres mecánicos y de autos",
              "Veterinarias y clínicas de mascotas",
              "Asesorías y consultorías",
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
            Preguntas frecuentes sobre Zenda vs Acuity
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
            Deja los formularios. Abraza WhatsApp.
          </h2>
          <p className="mb-8 text-emerald-100">
            Prueba Zenda gratis y descubre por qué es la mejor alternativa a
            Acuity Scheduling para negocios en Latinoamérica.
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

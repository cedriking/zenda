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
  const slug = "mejor-alternativa-zenvia-whatsapp";
  const title =
    "Mejor Alternativa a Zenvia para WhatsApp | Recepcionista IA para Citas — Zenda";
  const description =
    "Zenvia es una plataforma de mensajería enterprise. Zenda es un recepcionista IA que agenda citas por WhatsApp automáticamente. Hecho para PyMEs en LATAM. Prueba gratis.";

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
      title: "Mejor Alternativa a Zenvia para WhatsApp — Zenda",
      description:
        "Zenvia es una plataforma enterprise. Zenda es un recepcionista IA para PyMEs en LATAM. Agenda citas automáticamente.",
      url: `https://zenda.bot/es/${slug}`,
      type: "website",
      images: [
        {
          url: `https://zenda.bot/api/og?locale=${locale}`,
          width: 1200,
          height: 630,
          alt: "Zenda — Alternativa a Zenvia para WhatsApp",
        },
      ],
    },
  };
}

const DIFFERENTIATORS = [
  {
    icon: MessageSquare,
    title: "Recepcionista IA, no API de mensajería",
    desc: "Zenvia es una plataforma de comunicaciones para empresas grandes. Zenda es un recepcionista de IA que ya sabe agendar citas — solo conectas WhatsApp y funciona.",
  },
  {
    icon: Zap,
    title: "Para PyMEs, no para enterprise",
    desc: "Zenvia cobra por volumen de mensajes y está diseñado para corporativos. Zenda tiene plan gratis y está construido para el negocio Latino — simple, accesible, sin contratos.",
  },
  {
    icon: Check,
    title: "Todo incluido en un precio",
    desc: "Con Zenvia pagas por mensajes, plataforma, integraciones y soporte por separado. Zenda incluye IA, recordatorios, agendamiento y panel en un solo plan.",
  },
];

const COMPARISON = [
  {
    feature: "Propósito",
    zenvia: "Plataforma de mensajería enterprise",
    zenda: "Recepcionista IA para citas",
  },
  {
    feature: "Agendamiento automático",
    zenvia: "No (requiere desarrollo)",
    zenda: "Sí, nativo con IA",
  },
  {
    feature: "IA conversacional",
    zenvia: "Chatbots básicos (extra)",
    zenda: "IA nativa para citas",
  },
  {
    feature: "Enfoque",
    zenvia: "Enterprise / corporativo",
    zenda: "PyMEs basadas en citas",
  },
  {
    feature: "Precio",
    zenvia: "Por volumen (enterprise)",
    zenda: "Desde $0 (plan gratis)",
  },
  {
    feature: "Recordatorios",
    zenvia: "Requiere programar",
    zenda: "Incluido",
  },
  {
    feature: "Setup",
    zenvia: "Semanas (con equipo técnico)",
    zenda: "5 minutos",
  },
  {
    feature: "Ideal para",
    zenvia: "Grandes empresas",
    zenda: "Negocios basados en citas",
  },
];

const FAQS = [
  {
    q: "Por qué es Zenda mejor que Zenvia para agendar citas por WhatsApp?",
    a: "Zenvia es una plataforma de comunicaciones para empresas grandes — envía mensajes masivos, notificaciones, marketing. Zenda es un recepcionista de IA especializado en agendar citas. Si tu negocio necesita citas, no campañas de marketing, Zenda es la mejor opción.",
  },
  {
    q: "Zenvia es brasileño, no es mejor para LATAM?",
    a: "Zenvia es brasileño pero enfocado en corporativos (bancos, retailers). Zenda está diseñado para PyMEs en toda Latinoamérica — México, Argentina, Colombia, Chile, Perú. Español nativo, precios accesibles para negocios pequeños.",
  },
  {
    q: "Puedo usar Zenvia y Zenda juntos?",
    a: "Si ya usas Zenvia para marketing o notificaciones, puedes agregar Zenda específicamente para agendar citas. Son complementarios — no excluyentes.",
  },
  {
    q: "Zenvia no tiene chatbots?",
    a: "Zenvia tiene chatbots pero son genéricos — responden FAQs, derivan conversaciones. No están diseñados para agendar citas. La IA de Zenda está entrenada específicamente para entender solicitudes de citas, verificar disponibilidad y confirmar.",
  },
  {
    q: "Cuánto cuesta Zenda vs Zenvia?",
    a: "Zenvia cobra por volumen de mensajes y tiene precios enterprise (custom). Para una PyME con 100 citas mensuales, Zenda es significativamente más económico y ya incluye todo lo que necesitas.",
  },
  {
    q: "Qué tipos de negocios usan Zenda?",
    a: "Clínicas dentales, salones de belleza, barberías, spas, gimnasios, talleres mecánicos, veterinarias y cualquier negocio basado en citas en Latinoamérica.",
  },
];

export default function MejorAlternativaZenviaPage() {
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
            name: "Zenda — Alternativa a Zenvia para WhatsApp",
            applicationCategory: "BusinessApplication",
            operatingSystem: "WhatsApp",
            description:
              "La mejor alternativa a Zenvia para agendar citas por WhatsApp en LATAM. Recepcionista IA para PyMEs.",
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
          Alternativa a Zenvia para WhatsApp
        </p>
        <h1 className="mb-6 font-bold text-4xl text-slate-900 leading-tight md:text-5xl">
          Zenvia es para enterprise.{" "}
          <span className="text-emerald-600">Zenda es para tu negocio.</span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-600">
          La mejor alternativa a Zenvia para PyMEs en Latinoamérica que
          necesitan agendar citas por WhatsApp. Sin contratos enterprise —
          recepcionista IA desde $0.
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
            Por qué las PyMEs en LATAM eligen Zenda sobre Zenvia
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
            Zenda vs Zenvia — Comparación directa
          </h2>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-4 text-left font-semibold text-slate-900">
                    Característica
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-400">
                    Zenvia
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
                      {row.zenvia}
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
            Preguntas frecuentes sobre Zenda vs Zenvia
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
            No necesitas enterprise. Necesitas un recepcionista.
          </h2>
          <p className="mb-8 text-emerald-100">
            Prueba Zenda gratis y descubre por qué es la mejor alternativa a
            Zenvia para agendar citas por WhatsApp en Latinoamérica.
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

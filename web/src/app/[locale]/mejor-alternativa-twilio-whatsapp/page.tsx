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
  const slug = "mejor-alternativa-twilio-whatsapp";
  const title =
    "Mejor Alternativa a Twilio para WhatsApp | Recepcionista IA para Citas — Zenda";
  const description =
    "Twilio es una API para desarrolladores. Zenda es un recepcionista IA que agenda citas por WhatsApp automáticamente. Sin código. Hecho para Latinoamérica. Prueba gratis.";

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
      title: "Mejor Alternativa a Twilio para WhatsApp — Zenda",
      description:
        "Twilio es una API para desarrolladores. Zenda es un recepcionista IA que agenda citas por WhatsApp. Sin código, hecho para LATAM.",
      url: `https://zenda.bot/es/${slug}`,
      type: "website",
      images: [
        {
          url: `https://zenda.bot/api/og?locale=${locale}`,
          width: 1200,
          height: 630,
          alt: "Zenda — Alternativa a Twilio para WhatsApp",
        },
      ],
    },
  };
}

const DIFFERENTIATORS = [
  {
    icon: MessageSquare,
    title: "Sin código — listo para usar",
    desc: "Twilio es una API que requiere desarrolladores para implementar. Zenda es un producto completo — conectas WhatsApp, configuras servicios y empiezas a recibir citas. Sin una línea de código.",
  },
  {
    icon: Zap,
    title: "IA que agenda, no infraestructura de mensajes",
    desc: "Twilio te da los bloques para construir — tú programas la lógica. Zenda ya tiene la IA entrenada para agendar citas en español, verificar disponibilidad y enviar recordatorios.",
  },
  {
    icon: Check,
    title: "Precio predecible, no por mensaje",
    desc: "Twilio cobra por cada mensaje enviado y recibido. Los costos crecen con cada conversación. Zenda tiene planes fijos — no te sorprende la factura a fin de mes.",
  },
];

const COMPARISON = [
  {
    feature: "Propósito",
    twilio: "API de comunicaciones",
    zenda: "Recepcionista IA para citas",
  },
  {
    feature: "Agendamiento automático",
    twilio: "No (requiere desarrollo)",
    zenda: "Sí, nativo con IA",
  },
  {
    feature: "IA conversacional",
    twilio: "No (requieres integrar IA tú mismo)",
    zenda: "Sí, IA nativa para citas",
  },
  {
    feature: "Requiere desarrolladores",
    twilio: "Sí",
    zenda: "No",
  },
  {
    feature: "Precio",
    twilio: "Por mensaje (variable)",
    zenda: "Plan fijo desde $0",
  },
  {
    feature: "Recordatorios automáticos",
    twilio: "Requiere programar",
    zenda: "Incluido",
  },
  {
    feature: "Setup",
    twilio: "Semanas de desarrollo",
    zenda: "5 minutos",
  },
  {
    feature: "Ideal para",
    twilio: "Equipos de ingeniería",
    zenda: "Negocios basados en citas",
  },
];

const FAQS = [
  {
    q: "Por qué es Zenda mejor que Twilio para agendar citas por WhatsApp?",
    a: "Twilio es una API de comunicaciones — necesitas desarrolladores para implementar cualquier funcionalidad. Zenda es un producto completo que ya hace todo: conecta WhatsApp, agenda citas con IA, envía recordatorios. Sin código, sin desarrolladores, en 5 minutos.",
  },
  {
    q: "Twilio no es más flexible?",
    a: "Sí, Twilio es extremadamente flexible — si tienes un equipo de ingeniería y meses de desarrollo. Si lo que necesitas es agendar citas por WhatsApp ya, Zenda funciona hoy sin escribir código.",
  },
  {
    q: "Cuánto cuesta Zenda vs Twilio?",
    a: "Twilio cobra por cada mensaje (variable, impredecible). Un negocio con 100 conversaciones mensuales puede gastar $50-200+ en Twilio solo en mensajes. Zenda tiene plan gratis y planes fijos desde $29 USD/mes con todo incluido.",
  },
  {
    q: "Puedo usar Twilio y Zenda juntos?",
    a: "Zenda funciona independientemente. Si ya usas Twilio para otros fines, puedes usar Zenda específicamente para agendar citas por WhatsApp sin conflicto.",
  },
  {
    q: "Qué tipos de negocios usan Zenda?",
    a: "Clínicas dentales, salones de belleza, barberías, spas, gimnasios, talleres mecánicos, veterinarias y cualquier negocio basado en citas en Latinoamérica.",
  },
  {
    q: "Zenda es seguro como Twilio?",
    a: "Sí. Zenda usa infraestructura enterprise-grade y cumple con las políticas de WhatsApp Business. Tus datos y conversaciones están protegidos con encriptación.",
  },
];

export default function MejorAlternativaTwilioPage() {
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
            name: "Zenda — Alternativa a Twilio para WhatsApp",
            applicationCategory: "BusinessApplication",
            operatingSystem: "WhatsApp",
            description:
              "La mejor alternativa a Twilio para agendar citas por WhatsApp en LATAM. Recepcionista IA sin código.",
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
          Alternativa a Twilio para WhatsApp
        </p>
        <h1 className="mb-6 font-bold text-4xl text-slate-900 leading-tight md:text-5xl">
          Twilio es una API.{" "}
          <span className="text-emerald-600">
            Zenda es tu recepcionista IA.
          </span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-600">
          La mejor alternativa a Twilio para negocios en Latinoamérica que
          necesitan agendar citas por WhatsApp. Sin código, sin desarrolladores
          — citas automáticas en 5 minutos.
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
            Por qué los negocios en LATAM eligen Zenda sobre Twilio
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
            Zenda vs Twilio — Comparación directa
          </h2>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-4 text-left font-semibold text-slate-900">
                    Característica
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-400">
                    Twilio
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
                      {row.twilio}
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
            Preguntas frecuentes sobre Zenda vs Twilio
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
            No programes. Agenda citas automáticamente.
          </h2>
          <p className="mb-8 text-emerald-100">
            Prueba Zenda gratis y descubre por qué es la mejor alternativa a
            Twilio para agendar citas por WhatsApp en Latinoamérica.
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

import { Bot, Check, Clock, MessageSquare, Zap } from "lucide-react";
import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export function generateMetadata(): Metadata {
  return {
    title: "Bot de Citas por WhatsApp | Agenda Automática con IA — Zenda",
    description:
      "Bot de citas por WhatsApp con inteligencia artificial. Agenda, confirma y reagenda citas automáticamente. Funciona 24/7 en español. Prueba gratis.",
    alternates: {
      canonical: "https://zenda.bot/es/bot-citas-whatsapp",
      languages: {
        es: "https://zenda.bot/es/bot-citas-whatsapp",
        en: "https://zenda.bot/en/bot-citas-whatsapp",
        "x-default": "https://zenda.bot/en/bot-citas-whatsapp",
      },
    },
    openGraph: {
      title: "Bot de Citas por WhatsApp — Agenda Automática con IA",
      description:
        "Un bot de WhatsApp que agenda citas por ti 24/7. Responde consultas, confirma turnos y envía recordatorios con IA. Prueba gratis.",
      url: "https://zenda.bot/es/bot-citas-whatsapp",
      type: "website",
      images: [
        {
          url: "https://zenda.bot/api/og?locale=es",
          width: 1200,
          height: 630,
          alt: "Zenda — Bot de Citas WhatsApp",
        },
      ],
    },
  };
}

const FEATURES = [
  {
    icon: Zap,
    title: "Respuesta instantánea",
    desc: "Tu bot responde en menos de 5 segundos, las 24 horas del día. Cada mensaje de cliente recibe atención inmediata.",
  },
  {
    icon: MessageSquare,
    title: "Conversación natural",
    desc: "La IA entiende lenguaje natural. El cliente escribe 'quiero una cita para mañana a las 3' y el bot agenda automáticamente.",
  },
  {
    icon: Bot,
    title: "Sin código, sin complicaciones",
    desc: "Configura tu bot en 5 minutos desde el panel. No necesitas saber programar ni contratar un desarrollador.",
  },
  {
    icon: Clock,
    title: "Disponibilidad 24/7",
    desc: "Tu negocio nunca deja de atender. El bot funciona de madrugada, fines de semana y días festivos.",
  },
];

const USE_CASES = [
  "Clínicas dentales y consultorios médicos",
  "Salones de belleza y barberías",
  "Spas y centros de bienestar",
  "Gimnasios y estudios de yoga",
  "Talleres mecánicos y de autos",
  "Asesorías y servicios profesionales",
  "Veterinarias y clínicas de mascotas",
  "Restaurantes con reservaciones",
];

const FAQS = [
  {
    q: "¿Qué es un bot de citas por WhatsApp?",
    a: "Es un asistente de inteligencia artificial conectado a tu WhatsApp Business que responde mensajes y agenda citas automáticamente. Funciona como un recepcionista virtual que nunca duerme.",
  },
  {
    q: "¿En qué se diferencia de un chatbot normal?",
    a: "Zenda usa IA avanzada que entiende lenguaje natural. No usa menús rígidos ni botones predefinidos. El cliente escribe como hablaría normalmente y la IA comprende y actúa.",
  },
  {
    q: "¿Necesito conocimientos técnicos?",
    a: "No. Configuras tu bot desde un panel web en 5 minutos: defines servicios, horarios y conectas tu WhatsApp Business. Listo.",
  },
  {
    q: "¿El bot puede manejar cancelaciones y reagendas?",
    a: "Sí. Si un cliente necesita cancelar o cambiar su cita, el bot ofrece nuevas opciones de horario automáticamente y actualiza la agenda.",
  },
  {
    q: "¿Cuánto cuesta el bot de citas?",
    a: "El plan gratis incluye hasta 25 contactos mensuales. Los planes pagados desde $29 USD/mes con funcionalidad completa. 14 días de prueba gratis.",
  },
  {
    q: "¿Funciona con WhatsApp Business o WhatsApp normal?",
    a: "Funciona con WhatsApp Business API. Te ayudamos a configurar la conexión durante el proceso de registro.",
  },
];

export default function BotCitasPage() {
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
            name: "Zenda — Bot de Citas WhatsApp",
            applicationCategory: "BusinessApplication",
            operatingSystem: "WhatsApp",
            description:
              "Bot de citas por WhatsApp con IA. Agenda, confirma y gestiona citas automáticamente 24/7.",
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
          Bot de Citas por WhatsApp
        </p>
        <h1 className="mb-6 font-bold text-4xl text-slate-900 leading-tight md:text-5xl">
          Un bot de WhatsApp que{" "}
          <span className="text-emerald-600">agenda citas por ti 24/7</span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-600">
          Bot con inteligencia artificial que responde consultas, agenda citas,
          confirma turnos y envía recordatorios — todo por WhatsApp. Sin código,
          sin complicaciones.
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/founding">
            <Button className="rounded-full bg-emerald-600 px-8 py-3 text-base text-white hover:bg-emerald-700">
              Crear mi bot de citas — Gratis
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-slate-400 text-sm">
          Plan gratis disponible · Sin código · Configura en 5 minutos
        </p>
      </section>

      {/* Features */}
      <section className="border-slate-100 border-y bg-slate-50 py-16">
        <div className="mx-auto max-w-4xl px-6">
          <div className="grid gap-8 md:grid-cols-2">
            {FEATURES.map((f) => (
              <div
                className="flex items-start gap-4 rounded-lg border border-slate-200 bg-white p-6"
                key={f.title}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                  <f.icon className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-slate-900">
                    {f.title}
                  </h3>
                  <p className="text-slate-500 text-sm">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-12 text-center font-bold text-2xl text-slate-900">
            Negocios que se benefician de un bot de citas
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {USE_CASES.map((uc) => (
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

      {/* How it works */}
      <section className="border-slate-100 border-t bg-slate-50 py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-12 text-center font-bold text-2xl text-slate-900">
            Cómo funciona tu bot de citas
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Conecta WhatsApp",
                desc: "Vincula tu WhatsApp Business a Zenda en 2 minutos.",
              },
              {
                step: "2",
                title: "Configura servicios",
                desc: "Define servicios, horarios y profesionales. La IA aprende tu negocio.",
              },
              {
                step: "3",
                title: "El bot trabaja 24/7",
                desc: "Responde, agenda y confirma citas automáticamente por WhatsApp.",
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

      {/* Pricing link */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            Tu bot de citas desde $0
          </h2>
          <p className="mb-6 text-slate-500">
            Empieza gratis con hasta 25 contactos. Planes completos desde $29
            USD/mes.
          </p>
          <Link href="/pricing">
            <Button
              className="rounded-full border border-emerald-600 bg-white px-6 py-2 text-emerald-600 hover:bg-emerald-50"
              variant="outline"
            >
              Ver planes y precios →
            </Button>
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-slate-100 border-t bg-slate-50 py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-12 text-center font-bold text-2xl text-slate-900">
            Preguntas frecuentes sobre bots de citas
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
            Tu bot de citas está listo en 5 minutos
          </h2>
          <p className="mb-8 text-emerald-100">
            Empieza con el plan gratis. Más citas, menos trabajo.
          </p>
          <Link href="/founding">
            <Button className="rounded-full bg-white px-8 py-3 font-semibold text-base text-emerald-700 hover:bg-emerald-50">
              Crear mi bot gratis →
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

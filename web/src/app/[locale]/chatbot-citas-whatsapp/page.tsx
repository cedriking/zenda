import { Bot, Check, Clock, MessageSquare, RefreshCw } from "lucide-react";
import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export function generateMetadata(): Metadata {
  return {
    title:
      "Chatbot para Citas por WhatsApp con IA | Agenda Automática 24/7 — Zenda",
    description:
      "Chatbot de IA para agendar citas por WhatsApp. Maneja reservas, reagendas y cancelaciones con lenguaje natural. Funciona 24/7 en español. Prueba gratis.",
    alternates: {
      canonical: "https://zenda.bot/es/chatbot-citas-whatsapp",
      languages: {
        es: "https://zenda.bot/es/chatbot-citas-whatsapp",
        en: "https://zenda.bot/en/chatbot-citas-whatsapp",
        ar: "https://zenda.bot/ar/chatbot-citas-whatsapp",
        fr: "https://zenda.bot/fr/chatbot-citas-whatsapp",
        de: "https://zenda.bot/de/chatbot-citas-whatsapp",
        ru: "https://zenda.bot/ru/chatbot-citas-whatsapp",
        zh: "https://zenda.bot/zh/chatbot-citas-whatsapp",
        ja: "https://zenda.bot/ja/chatbot-citas-whatsapp",
        ko: "https://zenda.bot/ko/chatbot-citas-whatsapp",
        "x-default": "https://zenda.bot/es/chatbot-citas-whatsapp",
      },
    },
    openGraph: {
      title: "Chatbot para Citas por WhatsApp con IA — Zenda",
      description:
        "Chatbot inteligente que agenda citas por WhatsApp con lenguaje natural. Maneja reagendas, cancelaciones y recordatorios 24/7. Prueba gratis.",
      url: "https://zenda.bot/es/chatbot-citas-whatsapp",
      type: "website",
      images: [
        {
          url: "https://zenda.bot/api/og?locale=es",
          width: 1200,
          height: 630,
          alt: "Zenda — Chatbot de Citas WhatsApp con IA",
        },
      ],
    },
  };
}

const FEATURES = [
  {
    icon: MessageSquare,
    title: "Lenguaje natural con IA",
    desc: "El cliente escribe 'quiero una cita para el viernes a las 4' y el chatbot entiende, consulta disponibilidad y agenda automáticamente. Sin menús rígidos ni botones.",
  },
  {
    icon: RefreshCw,
    title: "Reagendas y cancelaciones",
    desc: "Si un cliente necesita cambiar su cita, el chatbot ofrece nuevas opciones de horario y actualiza la agenda al instante. Todo por WhatsApp.",
  },
  {
    icon: Clock,
    title: "Disponible 24/7",
    desc: "Tu chatbot nunca duerme. Atiende clientes de madrugada, fines de semana y días festivos. Cada mensaje recibe respuesta en segundos.",
  },
  {
    icon: Bot,
    title: "Sin código, sin complicaciones",
    desc: "Configura tu chatbot en 5 minutos desde un panel web. No necesitas saber programar ni contratar un desarrollador.",
  },
];

const CAPABILITIES = [
  {
    capability: "Agendar citas nuevas",
    description: "El cliente escribe y el bot agenda automáticamente",
  },
  {
    capability: "Reagendar citas",
    description: "El cliente pide cambio y el bot ofrece nuevas opciones",
  },
  {
    capability: "Cancelar citas",
    description: "El bot cancela y libera el horario al instante",
  },
  {
    capability: "Consultar precios",
    description: "Responde preguntas sobre precios y servicios",
  },
  {
    capability: "Enviar recordatorios",
    description: "Recordatorio automático antes de la cita por WhatsApp",
  },
  {
    capability: "Responder fuera de horario",
    description: "Atiende clientes las 24 horas, los 7 días",
  },
  {
    capability: "Consultar disponibilidad",
    description: "Muestra horarios disponibles en tiempo real",
  },
  {
    capability: "Confirmar citas",
    description: "Pide confirmación y actualiza el estado automáticamente",
  },
];

const FAQS = [
  {
    q: "What is a WhatsApp appointment chatbot?",
    a: "Un chatbot de citas por WhatsApp es un asistente de inteligencia artificial conectado a tu WhatsApp Business que conversa con tus clientes y agenda citas automáticamente. Funciona como un recepcionista virtual que nunca duerme.",
  },
  {
    q: "How does the AI understand what the client wants?",
    a: "Zenda usa IA avanzada que entiende lenguaje natural en español. El cliente escribe como hablaría normalmente — 'quiero una cita para mañana a las 3' — y la IA comprende la intención, fecha y hora para agendar automáticamente.",
  },
  {
    q: "Can the chatbot handle rescheduling?",
    a: "Sí. Si un cliente necesita cambiar su cita, solo escribe por WhatsApp. El chatbot muestra nuevas opciones de horario y actualiza la agenda. Sin llamadas, sin formularios.",
  },
  {
    q: "And cancellations?",
    a: "Sí. El cliente puede cancelar por WhatsApp y el chatbot libera el horario al instante. También puede enviar un mensaje de seguimiento ofreciendo reagendar.",
  },
  {
    q: "Do I need to know how to code?",
    a: "No. Configuras tu chatbot desde un panel web en 5 minutos: defines servicios, horarios y conectas tu WhatsApp Business. Listo.",
  },
  {
    q: "How much does the chatbot cost?",
    a: "El plan gratis incluye hasta 25 contactos mensuales. Los planes pagados empiezan desde $29 USD/mes con funcionalidad completa. 14 días de prueba gratis.",
  },
  {
    q: "Does it work with WhatsApp Business or regular WhatsApp?",
    a: "Funciona con WhatsApp Business API. Te ayudamos a configurar la conexión durante el proceso de registro.",
  },
  {
    q: "What types of businesses can use this chatbot?",
    a: "Cualquier negocio basado en citas: clínicas dentales, salones de belleza, barberías, spas, gimnasios, talleres mecánicos, veterinarias, consultorios, y más.",
  },
];

export default function ChatbotCitasPage() {
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
            name: "Zenda — Chatbot de Citas WhatsApp con IA",
            applicationCategory: "BusinessApplication",
            operatingSystem: "WhatsApp",
            description:
              "Chatbot de IA para agendar citas por WhatsApp. Maneja reservas, reagendas y cancelaciones con lenguaje natural 24/7.",
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
          Chatbot de Citas con IA
        </p>
        <h1 className="mb-6 font-bold text-4xl text-slate-900 leading-tight md:text-5xl">
          Un chatbot de WhatsApp que{" "}
          <span className="text-emerald-600">
            agenda, reagenda y cancela citas
          </span>{" "}
          con IA
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-600">
          Chatbot con inteligencia artificial que conversa con tus clientes por
          WhatsApp y gestiona citas con lenguaje natural. Reagendas,
          cancelaciones, recordatorios — todo automático, 24/7.
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/founding">
            <Button className="rounded-full bg-emerald-600 px-8 py-3 text-base text-white hover:bg-emerald-700">
              Crear mi chatbot de citas — Gratis
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-slate-400 text-sm">
          Plan gratis disponible · Lenguaje natural · 24/7
        </p>
      </section>

      {/* Features */}
      <section className="border-slate-100 border-y bg-slate-50 py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-12 text-center font-bold text-2xl text-slate-900">
            Tu chatbot de citas hace todo esto
          </h2>
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

      {/* Capabilities checklist */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-12 text-center font-bold text-2xl text-slate-900">
            Todo lo que tu chatbot puede hacer por WhatsApp
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {CAPABILITIES.map((c) => (
              <div
                className="flex items-center gap-3 rounded-lg border border-slate-200 p-4"
                key={c.capability}
              >
                <Check className="h-5 w-5 shrink-0 text-emerald-500" />
                <div>
                  <p className="font-medium text-slate-900 text-sm">
                    {c.capability}
                  </p>
                  <p className="text-slate-500 text-xs">{c.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-slate-100 border-t bg-slate-50 py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-12 text-center font-bold text-2xl text-slate-900">
            Cómo funciona tu chatbot de citas
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
                title: "El chatbot trabaja 24/7",
                desc: "Responde, agenda, reagenda, cancela y recuerda citas automáticamente.",
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

      {/* Use cases */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-8 font-bold text-2xl text-slate-900">
            Negocios que usan chatbot de citas por WhatsApp
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              "Clínicas dentales y consultorios médicos",
              "Salones de belleza y barberías",
              "Spas y centros de bienestar",
              "Gimnasios y estudios de yoga",
              "Talleres mecánicos y de autos",
              "Veterinarias y clínicas de mascotas",
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

      {/* Pricing link */}
      <section className="border-slate-100 border-t bg-slate-50 py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            Tu chatbot de citas desde $0
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
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-12 text-center font-bold text-2xl text-slate-900">
            Preguntas frecuentes sobre chatbots de citas
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
            Tu chatbot de citas está listo en 5 minutos
          </h2>
          <p className="mb-8 text-emerald-100">
            Empieza con el plan gratis. Más citas atendidas, menos trabajo
            manual.
          </p>
          <Link href="/founding">
            <Button className="rounded-full bg-white px-8 py-3 font-semibold text-base text-emerald-700 hover:bg-emerald-50">
              Crear mi chatbot gratis →
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

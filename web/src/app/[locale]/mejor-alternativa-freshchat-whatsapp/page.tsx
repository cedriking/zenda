import { Check, MessageSquare, Zap } from "lucide-react";
import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export function generateMetadata(): Metadata {
  return {
    title:
      "Mejor Alternativa a Freshchat para WhatsApp | Recepcionista IA para Citas — Zenda",
    description:
      "Freshchat es un chat de soporte. Zenda es un recepcionista IA que agenda citas por WhatsApp automáticamente. Hecho para Latinoamérica. Prueba gratis.",
    alternates: {
      canonical: "https://zenda.bot/es/mejor-alternativa-freshchat-whatsapp",
      languages: {
        es: "https://zenda.bot/es/mejor-alternativa-freshchat-whatsapp",
        en: "https://zenda.bot/en/mejor-alternativa-freshchat-whatsapp",
        "x-default":
          "https://zenda.bot/es/mejor-alternativa-freshchat-whatsapp",
      },
    },
    openGraph: {
      title: "Mejor Alternativa a Freshchat para WhatsApp — Zenda",
      description:
        "Freshchat es un chat de soporte. Zenda es un recepcionista IA que agenda citas por WhatsApp. Hecho para Latinoamérica.",
      url: "https://zenda.bot/es/mejor-alternativa-freshchat-whatsapp",
      type: "website",
      images: [
        {
          url: "https://zenda.bot/api/og?locale=es",
          width: 1200,
          height: 630,
          alt: "Zenda — Alternativa a Freshchat para WhatsApp",
        },
      ],
    },
  };
}

const DIFFERENTIATORS = [
  {
    icon: MessageSquare,
    title: "Nogestiones tickets — agenda citas",
    desc: "Freshchat es un live chat para soporte al cliente. Zenda es un recepcionista de IA que conversa con tus clientes por WhatsApp y agenda citas automáticamente en tu calendario.",
  },
  {
    icon: Zap,
    title: "IA que agenda, no un chatbot genérico",
    desc: "Freshchat ofrece chatbots básicos. La IA de Zenda entiende solicitudes de citas en lenguaje natural en español, verifica disponibilidad y confirma — sin intervención humana.",
  },
  {
    icon: Check,
    title: "Hecho para LATAM, no para enterprise",
    desc: "Freshchat es parte de Freshworks, diseñado para empresas grandes. Zenda está construido para negocios Latinos — español nativo, WhatsApp primero, sin complejidad.",
  },
];

const COMPARISON = [
  {
    feature: "Propósito",
    freshchat: "Live chat y soporte",
    zenda: "Recepcionista IA para citas",
  },
  {
    feature: "Agendamiento automático",
    freshchat: "No (requiere integración)",
    zenda: "Sí, nativo",
  },
  {
    feature: "IA conversacional",
    freshchat: "Chatbots básicos",
    zenda: "IA que agenda citas",
  },
  {
    feature: "Enfoque geográfico",
    freshchat: "Global (EEUU/India)",
    zenda: "Latinoamérica",
  },
  {
    feature: "Precio desde",
    freshchat: "$15/mes (por agente)",
    zenda: "$0 (plan gratis)",
  },
  {
    feature: "Canales",
    freshchat: "Web chat, WhatsApp, email",
    zenda: "WhatsApp (especializado)",
  },
  {
    feature: "Setup",
    freshchat: "Moderado",
    zenda: "5 minutos",
  },
  {
    feature: "Ideal para",
    freshchat: "Equipos de soporte",
    zenda: "Negocios basados en citas",
  },
];

const FAQS = [
  {
    q: "Por qué es Zenda mejor que Freshchat para agendar citas por WhatsApp?",
    a: "Freshchat es una herramienta de live chat y soporte al cliente. No fue diseñado para agendar citas. Zenda es un recepcionista de IA que conversa con tus clientes por WhatsApp, entiende cuando quieren una cita, y la agenda automáticamente.",
  },
  {
    q: "Puedo migrar de Freshchat a Zenda?",
    a: "Sí. Solo necesitas conectar tu WhatsApp Business a Zenda y configurar tus servicios y horarios. Puedes estar recibiendo citas por WhatsApp en menos de 5 minutos.",
  },
  {
    q: "Freshchat tiene IA y chatbots, no es lo mismo?",
    a: "Freshchat ofrece chatbots para soporte (responder FAQs, derivar tickets). La IA de Zenda está diseñada específicamente para agendar: entiende fechas, horas, servicios y profesionales. No es un chatbot genérico — es un recepcionista.",
  },
  {
    q: "Cuánto cuesta Zenda vs Freshchat?",
    a: "Freshchat cobra desde $15 USD/mes por agente. Zenda tiene un plan gratis para empezar. Los planes pagados empiezan desde $29 USD/mes con agendamiento con IA incluido.",
  },
  {
    q: "Qué tipos de negocios usan Zenda?",
    a: "Clínicas dentales, salones de belleza, barberías, spas, gimnasios, talleres mecánicos, veterinarias y cualquier negocio basado en citas en Latinoamérica.",
  },
  {
    q: "Zenda solo funciona con WhatsApp?",
    a: "Zenda se especializa en WhatsApp porque en Latinoamérica es el canal que usan el 95% de tus clientes. En lugar de ofrecer muchos canales mediocres, hacemos uno excepcionalmente bien.",
  },
];

export default function MejorAlternativaFreshchatPage() {
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
            name: "Zenda — Alternativa a Freshchat para WhatsApp",
            applicationCategory: "BusinessApplication",
            operatingSystem: "WhatsApp",
            description:
              "La mejor alternativa a Freshchat para agendar citas por WhatsApp en LATAM. Recepcionista IA que agenda automáticamente.",
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
          Alternativa a Freshchat para WhatsApp
        </p>
        <h1 className="mb-6 font-bold text-4xl text-slate-900 leading-tight md:text-5xl">
          Freshchat es un live chat.{" "}
          <span className="text-emerald-600">
            Zenda es tu recepcionista IA.
          </span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-600">
          La mejor alternativa a Freshchat para negocios en Latinoamérica que
          necesitan agendar citas por WhatsApp. Sin tickets, sin complejidad —
          citas automáticas.
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
            Por qué los negocios en LATAM eligen Zenda sobre Freshchat
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
            Zenda vs Freshchat — Comparación directa
          </h2>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-4 text-left font-semibold text-slate-900">
                    Característica
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-400">
                    Freshchat
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
                      {row.freshchat}
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
            Preguntas frecuentes sobre Zenda vs Freshchat
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
            No respondas chats. Agenda citas automáticamente.
          </h2>
          <p className="mb-8 text-emerald-100">
            Prueba Zenda gratis y descubre por qué es la mejor alternativa a
            Freshchat para agendar citas por WhatsApp en Latinoamérica.
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

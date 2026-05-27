import { Check, MessageSquare, Zap } from "lucide-react";
import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export function generateMetadata(): Metadata {
  return {
    title:
      "Mejor Alternativa a Zendesk para WhatsApp | Recepcionista IA para Citas — Zenda",
    description:
      "Zendesk es para equipos de soporte grandes. Zenda es un recepcionista IA que agenda citas por WhatsApp automáticamente. De $0 a funcionando en 5 minutos. Pruébalo gratis.",
    alternates: {
      canonical: "https://zenda.bot/es/mejor-alternativa-zendesk-whatsapp",
      languages: {
        es: "https://zenda.bot/es/mejor-alternativa-zendesk-whatsapp",
        en: "https://zenda.bot/en/mejor-alternativa-zendesk-whatsapp",
        ar: "https://zenda.bot/ar/mejor-alternativa-zendesk-whatsapp",
        fr: "https://zenda.bot/fr/mejor-alternativa-zendesk-whatsapp",
        de: "https://zenda.bot/de/mejor-alternativa-zendesk-whatsapp",
        ru: "https://zenda.bot/ru/mejor-alternativa-zendesk-whatsapp",
        zh: "https://zenda.bot/zh/mejor-alternativa-zendesk-whatsapp",
        ja: "https://zenda.bot/ja/mejor-alternativa-zendesk-whatsapp",
        ko: "https://zenda.bot/ko/mejor-alternativa-zendesk-whatsapp",
        "x-default": "https://zenda.bot/es/mejor-alternativa-zendesk-whatsapp",
      },
    },
    openGraph: {
      title: "Mejor Alternativa a Zendesk para WhatsApp — Zenda",
      description:
        "No necesitas un equipo de soporte — necesitas un recepcionista. Zenda agenda citas por WhatsApp con IA para negocios en LATAM.",
      url: "https://zenda.bot/es/mejor-alternativa-zendesk-whatsapp",
      type: "website",
      images: [
        {
          url: "https://zenda.bot/api/og?locale=es",
          width: 1200,
          height: 630,
          alt: "Zenda — Alternativa a Zendesk para WhatsApp",
        },
      ],
    },
  };
}

const DIFFERENTIATORS = [
  {
    icon: MessageSquare,
    title: "No necesitas un equipo de soporte — necesitas un recepcionista",
    desc: "Zendesk es software empresarial de mesa de ayuda. Zenda es un recepcionista IA diseñado para agendar citas. No gestionas tickets — gestionas citas automáticamente.",
  },
  {
    icon: Zap,
    title: "De $0 a funcionando en 5 minutos",
    desc: "Zendesk toma semanas configurarlo con un consultor. Zenda se conecta a tu WhatsApp y empieza a agendar citas de inmediato. Sin capacitación, sin implementación compleja.",
  },
  {
    icon: Check,
    title: "Diseñado para tu negocio, no para Fortune 500",
    desc: "Zendesk está diseñado para equipos grandes de soporte al cliente. Zenda está construido para salones, clínicas y PYMEs en Latinoamérica que necesitan agendar citas por WhatsApp.",
  },
];

const COMPARISON = [
  {
    feature: "Propósito",
    zendesk: "Mesa de ayuda empresarial",
    zenda: "Recepcionista IA para citas",
  },
  {
    feature: "Agendamiento automático",
    zendesk: "No",
    zenda: "Sí, nativo",
  },
  {
    feature: "IA conversacional",
    zendesk: "Answer Bot (genérico)",
    zenda: "IA optimizada para citas",
  },
  {
    feature: "Enfoque",
    zendesk: "Empresas grandes",
    zenda: "PYMEs en LATAM",
  },
  {
    feature: "Precio desde",
    zendesk: "$55 USD/mes (por agente)",
    zenda: "$0 (plan gratis)",
  },
  {
    feature: "Setup",
    zendesk: "Semanas con consultor",
    zenda: "5 minutos",
  },
  {
    feature: "WhatsApp",
    zendesk: "Add-on premium",
    zenda: "Incluido desde el inicio",
  },
  {
    feature: "Idioma",
    zendesk: "Inglés primero",
    zenda: "Español nativo",
  },
];

const FAQS = [
  {
    q: "Why es Zenda mejor que Zendesk para WhatsApp en mi negocio?",
    a: "Zendesk es una plataforma de mesa de ayuda para equipos grandes de soporte. Si tu negocio necesita agendar citas por WhatsApp — no gestionar tickets — Zenda es la mejor opción. Funciona como un recepcionista IA que agenda, confirma y envía recordatorios automáticamente.",
  },
  {
    q: "Can I migrate from Zendesk to Zenda?",
    a: "Sí. Solo necesitas conectar tu WhatsApp Business a Zenda y configurar tus servicios y horarios. No hay migración de datos complicada — empiezas a recibir citas por WhatsApp en minutos.",
  },
  {
    q: "Does Zenda integrate with other tools?",
    a: "Sí, Zenda se integra con Google Calendar para sincronizar disponibilidad y citas agendadas automáticamente. También puedes conectar otras herramientas de tu negocio.",
  },
  {
    q: "How much does Zenda cost vs Zendesk?",
    a: "Zendesk cobra desde $55 USD por agente al mes. Zenda ofrece un plan gratis permanente y planes pagados desde $29 USD/mes con funcionalidad completa. Sin costos por agente ni add-ons.",
  },
  {
    q: "What's the difference between Zendesk and Zenda?",
    a: "Zendesk es un software de mesa de ayuda para que equipos grandes manejen tickets de soporte. Zenda es un recepcionista IA que agenda citas por WhatsApp para salones, clínicas y PYMEs en Latinoamérica. Diferente propósito, diferente público, diferente precio.",
  },
  {
    q: "What types of businesses use Zenda?",
    a: "Clínicas dentales, salones de belleza, barberías, spas, gimnasios, talleres mecánicos, veterinarias y cualquier negocio basado en citas en Latinoamérica.",
  },
];

export default function MejorAlternativaZendeskPage() {
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
            name: "Zenda — Alternativa a Zendesk para WhatsApp",
            applicationCategory: "BusinessApplication",
            operatingSystem: "WhatsApp",
            description:
              "La mejor alternativa a Zendesk para WhatsApp en LATAM. Recepcionista IA que agenda citas directamente por WhatsApp.",
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
          Alternativa a Zendesk para WhatsApp
        </p>
        <h1 className="mb-6 font-bold text-4xl text-slate-900 leading-tight md:text-5xl">
          No necesitas un equipo de soporte.{" "}
          <span className="text-emerald-600">Necesitas un recepcionista.</span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-600">
          La mejor alternativa a Zendesk para negocios en Latinoamérica. Zenda
          es un recepcionista IA que agenda citas directamente por WhatsApp —
          sin tickets, sin complejidad, sin consultores.
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/founding">
            <Button className="rounded-full bg-emerald-600 px-8 py-3 text-base text-white hover:bg-emerald-700">
              Probar Zenda gratis — Sin tarjeta
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-slate-400 text-sm">
          Plan gratis disponible · WhatsApp nativo · Funcionando en 5 minutos
        </p>
      </section>

      {/* Why Zenda instead of Zendesk */}
      <section className="border-slate-100 border-y bg-slate-50 py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-12 text-center font-bold text-2xl text-slate-900">
            Por qué los negocios en LATAM eligen Zenda sobre Zendesk
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
            Zenda vs Zendesk — Comparación directa
          </h2>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-4 text-left font-semibold text-slate-900">
                    Característica
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-400">
                    Zendesk
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
                      {row.zendesk}
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
            Preguntas frecuentes sobre Zenda vs Zendesk
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
            Deja de pagar por software de soporte. Empieza a agendar citas por
            WhatsApp.
          </h2>
          <p className="mb-8 text-emerald-100">
            Prueba Zenda gratis y descubre por qué es la mejor alternativa a
            Zendesk para negocios en Latinoamérica.
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

import {
  ArrowDown,
  ArrowRight,
  Bell,
  Bot,
  Check,
  Clock,
  MessageSquare,
  RefreshCw,
  Smartphone,
  Zap,
} from "lucide-react";
import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export function generateMetadata(): Metadata {
  return {
    title:
      "Confirmar Citas por WhatsApp Autom\u00e1ticamente | Reduce Inasistencias \u2014 Zenda",
    description:
      "Confirma citas por WhatsApp autom\u00e1ticamente con IA. Env\u00eda recordatorios, confirma y reagenda sin esfuerzo. Reduce inasistencias hasta un 40%. Prueba gratis.",
    alternates: {
      canonical: "https://zenda.bot/es/confirmar-citas-whatsapp",
      languages: {
        es: "https://zenda.bot/es/confirmar-citas-whatsapp",
        en: "https://zenda.bot/en/confirmar-citas-whatsapp",
        ar: "https://zenda.bot/ar/confirmar-citas-whatsapp",
        fr: "https://zenda.bot/fr/confirmar-citas-whatsapp",
        de: "https://zenda.bot/de/confirmar-citas-whatsapp",
        ru: "https://zenda.bot/ru/confirmar-citas-whatsapp",
        zh: "https://zenda.bot/zh/confirmar-citas-whatsapp",
        ja: "https://zenda.bot/ja/confirmar-citas-whatsapp",
        ko: "https://zenda.bot/ko/confirmar-citas-whatsapp",
        "x-default": "https://zenda.bot/en/confirmar-citas-whatsapp",
      },
    },
    openGraph: {
      title:
        "Confirmar Citas por WhatsApp Autom\u00e1ticamente \u2014 Reduce Inasistencias",
      description:
        "Automatiza la confirmaci\u00f3n de citas por WhatsApp. Recordatorios, confirmaci\u00f3n y reagendado autom\u00e1tico. Hasta 40% menos inasistencias. Prueba gratis.",
      url: "https://zenda.bot/es/confirmar-citas-whatsapp",
      type: "website",
      images: [
        {
          url: "https://zenda.bot/api/og?locale=es",
          width: 1200,
          height: 630,
          alt: "Zenda \u2014 Confirmar Citas WhatsApp",
        },
      ],
    },
  };
}

const STATS = [
  {
    value: "40%",
    label: "menos inasistencias",
    desc: "con confirmaci\u00f3n autom\u00e1tica",
  },
  {
    value: "95%",
    label: "tasa de confirmaci\u00f3n",
    desc: "clientes confirman por WhatsApp",
  },
  {
    value: "<5s",
    label: "tiempo de respuesta",
    desc: "confirmaci\u00f3n instant\u00e1nea",
  },
  {
    value: "80%",
    label: "menos llamadas manuales",
    desc: "libera tiempo de tu equipo",
  },
];

const CONFIRMATION_STEPS = [
  {
    icon: MessageSquare,
    title: "Cita agendada",
    desc: "Un cliente agenda una cita por WhatsApp, tel\u00e9fono o en persona.",
  },
  {
    icon: Bell,
    title: "Recordatorio 24h antes",
    desc: "WhatsApp env\u00eda un recordatorio autom\u00e1tico 24 horas antes de la cita.",
  },
  {
    icon: Check,
    title: "Cliente confirma",
    desc: "El cliente responde 's\u00ed' o 'confirmo' y la cita queda confirmada autom\u00e1ticamente.",
  },
  {
    icon: Bell,
    title: "Recordatorio 2h antes",
    desc: "Un segundo recordatorio 2 horas antes asegura que el cliente no olvide.",
  },
  {
    icon: RefreshCw,
    title: "Reagenda si no puede",
    desc: "Si el cliente necesita cambiar la hora, la IA ofrece nuevas opciones al instante.",
  },
];

const INTEGRATIONS = [
  {
    icon: Smartphone,
    title: "WhatsApp Business API",
    desc: "Conexi\u00f3n directa con tu WhatsApp Business. Los clientes interactuan como siempre.",
  },
  {
    icon: Clock,
    title: "Google Calendar",
    desc: "Sincroniza citas confirmadas con tu calendario de Google autom\u00e1ticamente.",
  },
  {
    icon: Bot,
    title: "IA conversacional",
    desc: "Entiende lenguaje natural en espa\u00f1ol. El cliente no necesita botones ni men\u00fas.",
  },
  {
    icon: Zap,
    title: "CRM y herramientas",
    desc: "Conecta con tu sistema de gesti\u00f3n y mant\u00e9n todo sincronizado.",
  },
];

const FAQS = [
  {
    q: "\u00bfC\u00f3mo funciona la confirmaci\u00f3n autom\u00e1tica de citas?",
    a: "Cuando un cliente agenda una cita, Zenda programa recordatorios autom\u00e1ticos por WhatsApp: uno 24 horas antes y otro 2 horas antes. El cliente confirma respondiendo al mensaje. Si necesita reagenda, la IA ofrece nuevas opciones al instante.",
  },
  {
    q: "\u00bfCu\u00e1nto reduce las inasistencias?",
    a: "Los negocios que implementan confirmaci\u00f3n autom\u00e1tica por WhatsApp reducen inasistencias entre un 30% y un 40% en promedio. Los recordatorios oportunos son la clave.",
  },
  {
    q: "\u00bfQu\u00e9 pasa si el cliente no responde al recordatorio?",
    a: "Puedes configurar un segundo recordatorio autom\u00e1tico o recibir una notificaci\u00f3n para hacer seguimiento manual. Zenda te avisa cuando un cliente no confirma.",
  },
  {
    q: "\u00bfPuedo personalizar los mensajes de confirmaci\u00f3n?",
    a: "S\u00ed. Personaliza el texto, la frecuencia y el tono de los mensajes. Usa variables como nombre del cliente, servicio, fecha y hora para mensajes m\u00e1s personalizados.",
  },
  {
    q: "\u00bfFunciona para cualquier tipo de negocio?",
    a: "S\u00ed. Cualquier negocio que trabaje con citas puede beneficiarse: cl\u00ednicas, salones, barber\u00edas, spas, talleres mec\u00e1nicos, veterinarias, gyms y m\u00e1s.",
  },
  {
    q: "\u00bfEl cliente necesita instalar algo?",
    a: "No. Los recordatorios y confirmaciones llegan como mensajes normales de WhatsApp. El cliente solo necesita responder para confirmar, cancelar o reagenda.",
  },
  {
    q: "\u00bfCu\u00e1nto cuesta?",
    a: "El plan gratis incluye hasta 25 contactos mensuales con confirmaciones autom\u00e1ticas. Los planes pagados desde $29 USD/mes incluyen funcionalidad completa. 14 d\u00edas de prueba gratis.",
  },
  {
    q: "\u00bfSe puede reagenda autom\u00e1ticamente?",
    a: "S\u00ed. Si el cliente indica que no puede asistir, la IA le presenta horarios alternativos disponibles y reagendar la cita autom\u00e1ticamente, actualizando tu calendario.",
  },
];

export default function ConfirmarCitasWhatsAppPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };

  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Zenda",
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Scheduling Software",
    operatingSystem: "WhatsApp",
    description:
      "Confirma citas por WhatsApp autom\u00e1ticamente. Recordatorios, confirmaci\u00f3n y reagendado autom\u00e1tico con IA. Reduce inasistencias hasta un 40%.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Plan gratuito disponible",
    },
  };

  return (
    <div className="min-h-screen bg-white">
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        type="application/ld+json"
      />
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
        type="application/ld+json"
      />
      <Nav variant="simple" />

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pt-20 pb-16 text-center">
        <p className="mb-4 font-semibold text-emerald-600 text-sm uppercase tracking-wide">
          Confirmar Citas por WhatsApp Autom\u00e1ticamente
        </p>
        <h1 className="mb-6 font-bold text-4xl text-slate-900 leading-tight md:text-5xl">
          Deja de llamar para confirmar.{" "}
          <span className="text-emerald-600">Zenda lo hace por ti</span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-600">
          Confirma citas autom\u00e1ticamente por WhatsApp con recordatorios
          inteligentes. Reduce inasistencias hasta un 40% sin hacer llamadas
          manuales.
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/founding">
            <Button className="rounded-full bg-emerald-600 px-8 py-3 text-base text-white hover:bg-emerald-700">
              Automatizar confirmaciones \u2014 Gratis 14 d\u00edas
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-slate-400 text-sm">
          Hasta 40% menos inasistencias \u00b7 Sin llamadas manuales \u00b7
          Configura en 5 min
        </p>
      </section>

      {/* Problem with manual confirmation */}
      <section className="border-slate-100 border-y bg-slate-50 py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-4 text-center font-bold text-2xl text-slate-900">
            El problema de confirmar citas manualmente
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-slate-500">
            Si a\u00fan llamas por tel\u00e9fono para confirmar citas,
            est\u00e1s perdiendo tiempo y dinero.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white p-6 text-center">
              <p className="mb-2 font-bold text-3xl text-red-400">30-40%</p>
              <p className="font-medium text-slate-700 text-sm">
                Inasistencias sin recordatorios
              </p>
              <p className="mt-2 text-slate-400 text-xs">
                Casi 1 de cada 3 citas no se presentan
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-6 text-center">
              <p className="mb-2 font-bold text-3xl text-red-400">2-3 hrs</p>
              <p className="font-medium text-slate-700 text-sm">
                Semanales llamando para confirmar
              </p>
              <p className="mt-2 text-slate-400 text-xs">
                Tiempo que podr\u00edas usar en atender clientes
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-6 text-center">
              <p className="mb-2 font-bold text-3xl text-red-400">60%</p>
              <p className="font-medium text-slate-700 text-sm">
                No contestan la llamada
              </p>
              <p className="mt-2 text-slate-400 text-xs">
                Pero s\u00ed responden mensajes de WhatsApp
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How Zenda automates it */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-4 text-center font-bold text-2xl text-slate-900">
            C\u00f3mo Zenda automatiza la confirmaci\u00f3n
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-slate-500">
            Desde la cita agendada hasta el cliente en tu negocio, todo
            automatizado por WhatsApp.
          </p>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Cita agendada",
                desc: "Un cliente agenda una cita por cualquier canal. Zenda la registra autom\u00e1ticamente.",
              },
              {
                step: "2",
                title: "Recordatorios autom\u00e1ticos",
                desc: "WhatsApp env\u00eda recordatorios 24h y 2h antes. El cliente confirma con un mensaje.",
              },
              {
                step: "3",
                title: "Reagenda autom\u00e1tica",
                desc: "Si el cliente no puede, la IA ofrece nuevos horarios y actualiza tu agenda al instante.",
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

      {/* Confirmation flow diagram */}
      <section className="border-slate-100 border-t bg-slate-50 py-20">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="mb-4 text-center font-bold text-2xl text-slate-900">
            Flujo de confirmaci\u00f3n autom\u00e1tica
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-slate-500">
            As\u00ed se ve el proceso desde que se agenda hasta que el cliente
            confirma.
          </p>
          <div className="space-y-0">
            {CONFIRMATION_STEPS.map((step, i) => (
              <div key={step.title}>
                <div className="flex items-start gap-4 rounded-lg border border-slate-200 bg-white p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                    <step.icon className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm">
                      {step.title}
                    </h3>
                    <p className="text-slate-500 text-sm">{step.desc}</p>
                  </div>
                </div>
                {i < CONFIRMATION_STEPS.length - 1 && (
                  <div className="flex justify-center py-1">
                    <ArrowDown className="h-5 w-5 text-slate-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 px-6 md:grid-cols-4">
          {STATS.map((stat) => (
            <div className="text-center" key={stat.label}>
              <p className="font-bold text-2xl text-emerald-600">
                {stat.value}
              </p>
              <p className="font-medium text-slate-900 text-sm">{stat.label}</p>
              <p className="text-slate-400 text-xs">{stat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Integration info */}
      <section className="border-slate-100 border-t bg-slate-50 py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-4 text-center font-bold text-2xl text-slate-900">
            Integraciones que hacen que funcione
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-slate-500">
            Zenda se conecta con las herramientas que ya usas para que todo
            fluya autom\u00e1ticamente.
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            {INTEGRATIONS.map((int) => (
              <div
                className="flex items-start gap-4 rounded-lg border border-slate-200 bg-white p-6"
                key={int.title}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                  <int.icon className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-slate-900">
                    {int.title}
                  </h3>
                  <p className="text-slate-500 text-sm">{int.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-12 text-center font-bold text-2xl text-slate-900">
            Preguntas frecuentes
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
            Automatiza la confirmaci\u00f3n de citas hoy
          </h2>
          <p className="mb-8 text-emerald-100">
            Reduce inasistencias hasta un 40% con confirmaci\u00f3n
            autom\u00e1tica por WhatsApp. Sin llamadas manuales. Prueba gratis
            14 d\u00edas.
          </p>
          <Link href="/founding">
            <Button className="rounded-full bg-white px-8 py-3 font-semibold text-base text-emerald-700 hover:bg-emerald-50">
              Probar gratis 14 d\u00edas{" "}
              <ArrowRight className="ml-1 inline h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

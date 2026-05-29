import {
  ArrowRight,
  CalendarCheck,
  Car,
  Check,
  Clock,
  Dumbbell,
  MessageSquare,
  PawPrint,
  Scissors,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title:
      "Agendar Citas por WhatsApp Autom\u00e1tico | IA que Agenda por Ti \u2014 Zenda",
    description:
      "Agenda citas por WhatsApp autom\u00e1ticamente con IA. Tu negocio responde, agenda y confirma citas sin intervenci\u00f3n humana. Funciona 24/7. Configura en 5 minutos. Prueba gratis.",
    alternates: {
      canonical: "https://zenda.bot/es/agendar-citas-whatsapp-automatico",
      languages: {
        es: "https://zenda.bot/es/agendar-citas-whatsapp-automatico",
        en: "https://zenda.bot/en/agendar-citas-whatsapp-automatico",
        ar: "https://zenda.bot/ar/agendar-citas-whatsapp-automatico",
        fr: "https://zenda.bot/fr/agendar-citas-whatsapp-automatico",
        de: "https://zenda.bot/de/agendar-citas-whatsapp-automatico",
        ru: "https://zenda.bot/ru/agendar-citas-whatsapp-automatico",
        zh: "https://zenda.bot/zh/agendar-citas-whatsapp-automatico",
        ja: "https://zenda.bot/ja/agendar-citas-whatsapp-automatico",
        ko: "https://zenda.bot/ko/agendar-citas-whatsapp-automatico",
        "x-default": "https://zenda.bot/en/agendar-citas-whatsapp-automatico",
      },
    },
    openGraph: {
      title:
        "Agendar Citas por WhatsApp Autom\u00e1tico \u2014 IA que Agenda por Ti",
      description:
        "Automatiza la agenda de citas por WhatsApp. La IA responde, agenda y confirma citas 24/7. Sin personal adicional. Prueba gratis 14 d\u00edas.",
      url: "https://zenda.bot/es/agendar-citas-whatsapp-automatico",
      type: "website",
      images: [
        {
          url: `https://zenda.bot/api/og?locale=${locale}`,
          width: 1200,
          height: 630,
          alt: "Zenda \u2014 Agendar Citas WhatsApp Autom\u00e1tico",
        },
      ],
    },
  };
}

const STEPS = [
  {
    icon: MessageSquare,
    title: "El cliente escribe por WhatsApp",
    desc: "Un cliente potencial env\u00eda un mensaje preguntando por disponibilidad, precios o queriendo agendar una cita.",
  },
  {
    icon: Clock,
    title: "Zenda responde y agenda al instante",
    desc: "La IA analiza el mensaje, consulta tu agenda en tiempo real y responde con horarios disponibles \u2014 en menos de 5 segundos.",
  },
  {
    icon: CalendarCheck,
    title: "Cita confirmada autom\u00e1ticamente",
    desc: "El cliente elige su horario y Zenda confirma la cita, programa recordatorios y sincroniza tu calendario.",
  },
];

const BENEFITS = [
  {
    value: "80%",
    label: "menos tiempo gestionando citas",
    desc: "La IA maneja todo el proceso de agendado sin intervenci\u00f3n humana.",
  },
  {
    value: "3x",
    label: "m\u00e1s citas agendadas",
    desc: "Al responder al instante, nunca pierdes un cliente por demoras.",
  },
  {
    value: "0",
    label: "citas perdidas por falta de respuesta",
    desc: "Tu negocio contesta 24/7, incluso de madrugada y fines de semana.",
  },
  {
    value: "5 min",
    label: "de configuraci\u00f3n",
    desc: "Conecta WhatsApp, define servicios y horarios. Listo.",
  },
];

const BUSINESS_TYPES = [
  {
    icon: Scissors,
    name: "Salones de belleza",
    example: "Corte, coloraci\u00f3n, manicura, pedicura",
  },
  {
    icon: Scissors,
    name: "Barber\u00edas",
    example: "Corte de cabello, afeitado, arreglo de barba",
  },
  {
    icon: Stethoscope,
    name: "Cl\u00ednicas dentales",
    example: "Limpieza, blanqueamiento, consulta general",
  },
  {
    icon: Stethoscope,
    name: "Consultorios m\u00e9dicos",
    example: "Consulta general, especialidades, telemedicina",
  },
  {
    icon: Sparkles,
    name: "Spas y bienestar",
    example: "Masajes, tratamientos faciales, relajaci\u00f3n",
  },
  {
    icon: Dumbbell,
    name: "Gimnasios y fitness",
    example: "Clases, personal training, evaluaciones",
  },
  {
    icon: Car,
    name: "Talleres mec\u00e1nicos",
    example: "Mantenimiento, revisi\u00f3n, reparaci\u00f3n",
  },
  {
    icon: PawPrint,
    name: "Veterinarias",
    example: "Consulta, vacunaci\u00f3n, peluquer\u00eda canina",
  },
];

const COMPARISON_FEATURES = [
  {
    feature: "Agendar citas autom\u00e1ticamente",
    zenda: true,
    manual: false,
    other: false,
  },
  {
    feature: "Respuesta en menos de 5 segundos",
    zenda: true,
    manual: false,
    other: false,
  },
  { feature: "Disponibilidad 24/7", zenda: true, manual: false, other: false },
  {
    feature: "Recordatorios autom\u00e1ticos",
    zenda: true,
    manual: false,
    other: true,
  },
  {
    feature: "Confirmaci\u00f3n autom\u00e1tica",
    zenda: true,
    manual: false,
    other: true,
  },
  {
    feature: "Reagenda autom\u00e1tica",
    zenda: true,
    manual: false,
    other: false,
  },
  {
    feature: "Sin contratar personal",
    zenda: true,
    manual: false,
    other: false,
  },
  {
    feature: "Sincroniza con calendario",
    zenda: true,
    manual: false,
    other: true,
  },
];

const FAQS = [
  {
    q: "\u00bfC\u00f3mo funciona el agendado autom\u00e1tico por WhatsApp?",
    a: "Cuando un cliente escribe por WhatsApp, la IA de Zenda analiza su mensaje, consulta tu agenda en tiempo real y le presenta los horarios disponibles. El cliente selecciona uno y la cita queda confirmada autom\u00e1ticamente, con recordatorios programados.",
  },
  {
    q: "\u00bfNecesito contratar personal adicional?",
    a: "No. Zenda funciona como un recepcionista virtual que maneja todo el proceso de agendado por ti, las 24 horas del d\u00eda, sin necesidad de personal adicional.",
  },
  {
    q: "\u00bfQu\u00e9 pasa si dos clientes piden la misma hora?",
    a: "Zenda consulta tu agenda en tiempo real. Si un horario ya est\u00e1 ocupado, la IA ofrece autom\u00e1ticamente las siguientes opciones disponibles. Nunca habr\u00e1 citas duplicadas.",
  },
  {
    q: "\u00bfCu\u00e1nto tiempo toma configurar Zenda?",
    a: "La configuraci\u00f3n inicial toma aproximadamente 5 minutos: vinculas tu WhatsApp Business, defines tus servicios y horarios, y la IA empieza a funcionar de inmediato.",
  },
  {
    q: "\u00bfFunciona con WhatsApp Business?",
    a: "S\u00ed. Zenda se conecta a tu cuenta de WhatsApp Business API. Te guiamos durante el proceso de configuraci\u00f3n para que la integraci\u00f3n sea r\u00e1pida y sencilla.",
  },
  {
    q: "\u00bfEl cliente necesita instalar algo?",
    a: "No. El cliente interact\u00faa como en cualquier conversaci\u00f3n de WhatsApp. Solo necesita enviar un mensaje y responder con su horario preferido.",
  },
  {
    q: "\u00bfPuedo personalizar los horarios disponibles?",
    a: "S\u00ed. Defines tus horarios de atenci\u00f3n, bloqueos de agenda, duraci\u00f3n por servicio y profesionales disponibles. La IA respeta tu configuraci\u00f3n siempre.",
  },
  {
    q: "\u00bfCu\u00e1nto cuesta?",
    a: "El plan gratis incluye hasta 25 contactos mensuales. Los planes pagados empiezan desde $29 USD/mes con funcionalidad completa. Ofrecemos 14 d\u00edas de prueba gratis.",
  },
];

export default function AgendarCitasAutomaticoPage() {
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
      "Agenda citas por WhatsApp autom\u00e1ticamente con inteligencia artificial. Respuesta instant\u00e1nea 24/7, confirmaci\u00f3n autom\u00e1tica y recordatorios.",
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
          Agendar Citas por WhatsApp Autom\u00e1tico
        </p>
        <h1 className="mb-6 font-bold text-4xl text-slate-900 leading-tight md:text-5xl">
          Tus citas se agendan solas{" "}
          <span className="text-emerald-600">por WhatsApp</span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-600">
          La IA de Zenda responde, agenda y confirma citas autom\u00e1ticamente
          por WhatsApp. Sin personal adicional, sin citas perdidas, sin
          complicaciones. Funciona 24/7.
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/founding">
            <Button className="rounded-full bg-emerald-600 px-8 py-3 text-base text-white hover:bg-emerald-700">
              Agendar citas autom\u00e1ticamente \u2014 Gratis 14 d\u00edas
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-slate-400 text-sm">
          Sin tarjeta de cr\u00e9dito \u00b7 Configura en 5 minutos \u00b7
          Funciona 24/7
        </p>
      </section>

      {/* How it works */}
      <section className="border-slate-100 border-y bg-slate-50 py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-4 text-center font-bold text-2xl text-slate-900">
            C\u00f3mo funciona el agendado autom\u00e1tico
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-slate-500">
            De la consulta del cliente a la cita confirmada, todo en segundos y
            sin intervenci\u00f3n humana.
          </p>
          <div className="grid gap-8 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <div className="text-center" key={step.title}>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                  <step.icon className="h-6 w-6 text-emerald-600" />
                </div>
                <p className="mb-2 font-bold text-emerald-600 text-sm">
                  Paso {i + 1}
                </p>
                <h3 className="mb-2 font-semibold text-slate-900">
                  {step.title}
                </h3>
                <p className="text-slate-500 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-4 text-center font-bold text-2xl text-slate-900">
            Beneficios de automatizar tus citas
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-slate-500">
            M\u00e1s citas, menos trabajo, cero citas perdidas.
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            {BENEFITS.map((b) => (
              <div
                className="flex items-start gap-4 rounded-lg border border-slate-200 bg-white p-6"
                key={b.label}
              >
                <p className="shrink-0 font-bold text-2xl text-emerald-600">
                  {b.value}
                </p>
                <div>
                  <h3 className="font-semibold text-slate-900">{b.label}</h3>
                  <p className="text-slate-500 text-sm">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who uses it */}
      <section className="border-slate-100 border-t bg-slate-50 py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-4 text-center font-bold text-2xl text-slate-900">
            \u00bfQui\u00e9n usa Zenda para agendar citas?
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-slate-500">
            Cualquier negocio de citas en Latinoam\u00e9rica que quiera
            automatizar su agenda por WhatsApp.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {BUSINESS_TYPES.map((bt) => (
              <div
                className="rounded-lg border border-slate-200 bg-white p-4 text-center"
                key={bt.name}
              >
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                  <bt.icon className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="mb-1 font-semibold text-slate-900 text-sm">
                  {bt.name}
                </h3>
                <p className="text-slate-400 text-xs">{bt.example}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature comparison */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-4 text-center font-bold text-2xl text-slate-900">
            Zenda vs. agendar manualmente
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-slate-500">
            Compara c\u00f3mo Zenda automatiza lo que antes tomaba horas.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-slate-200 border-b">
                  <th className="pr-4 pb-3 font-semibold text-slate-500">
                    Caracter\u00edstica
                  </th>
                  <th className="px-4 pb-3 text-center font-semibold text-emerald-600">
                    Zenda
                  </th>
                  <th className="px-4 pb-3 text-center font-semibold text-slate-400">
                    Manual
                  </th>
                  <th className="pb-3 pl-4 text-center font-semibold text-slate-400">
                    Otro software
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_FEATURES.map((row) => (
                  <tr className="border-slate-100 border-b" key={row.feature}>
                    <td className="py-3 pr-4 text-slate-700">{row.feature}</td>
                    <td className="px-4 py-3 text-center">
                      {row.zenda ? (
                        <Check className="mx-auto h-5 w-5 text-emerald-500" />
                      ) : (
                        <span className="text-slate-300">\u2013</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.manual ? (
                        <Check className="mx-auto h-5 w-5 text-emerald-500" />
                      ) : (
                        <span className="text-slate-300">\u2013</span>
                      )}
                    </td>
                    <td className="py-3 pl-4 text-center">
                      {row.other ? (
                        <Check className="mx-auto h-5 w-5 text-emerald-500" />
                      ) : (
                        <span className="text-slate-300">\u2013</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-slate-100 border-t bg-slate-50 py-20">
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
            Empieza a agendar citas autom\u00e1ticamente
          </h2>
          <p className="mb-8 text-emerald-100">
            Deja de perder clientes por respuestas lentas. La IA de Zenda agenda
            por ti 24/7. Prueba gratis 14 d\u00edas.
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

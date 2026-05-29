import {
  ArrowRight,
  Bot,
  Check,
  Clock,
  Globe,
  MessageSquare,
  Shield,
  Smartphone,
  X,
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
      "WhatsApp para Negocios con Citas | Agenda Autom\u00e1tica \u2014 Zenda",
    description:
      "Usa WhatsApp Business para agendar citas autom\u00e1ticamente. Zenda a\u00f1ade IA a tu WhatsApp: responde, agenda, confirma y recuerda citas. Prueba gratis 14 d\u00edas.",
    alternates: {
      canonical: "https://zenda.bot/es/whatsapp-negocios-citas",
      languages: {
        es: "https://zenda.bot/es/whatsapp-negocios-citas",
        en: "https://zenda.bot/en/whatsapp-negocios-citas",
        ar: "https://zenda.bot/ar/whatsapp-negocios-citas",
        fr: "https://zenda.bot/fr/whatsapp-negocios-citas",
        de: "https://zenda.bot/de/whatsapp-negocios-citas",
        ru: "https://zenda.bot/ru/whatsapp-negocios-citas",
        zh: "https://zenda.bot/zh/whatsapp-negocios-citas",
        ja: "https://zenda.bot/ja/whatsapp-negocios-citas",
        ko: "https://zenda.bot/ko/whatsapp-negocios-citas",
        "x-default": "https://zenda.bot/en/whatsapp-negocios-citas",
      },
    },
    openGraph: {
      title:
        "WhatsApp para Negocios con Citas \u2014 Agenda Autom\u00e1tica con IA",
      description:
        "Convierte tu WhatsApp Business en una m\u00e1quina de agendar citas. IA que responde, confirma y recuerda turnos autom\u00e1ticamente. Prueba gratis.",
      url: "https://zenda.bot/es/whatsapp-negocios-citas",
      type: "website",
      images: [
        {
          url: `https://zenda.bot/api/og?locale=${locale}`,
          width: 1200,
          height: 630,
          alt: "Zenda \u2014 WhatsApp para Negocios con Citas",
        },
      ],
    },
  };
}

const PAIN_POINTS = [
  {
    icon: Clock,
    title: "Respuestas lentas",
    desc: "Tus clientes esperan minutos u horas por una respuesta. Para entonces, ya agendaron con la competencia.",
  },
  {
    icon: X,
    title: "Citas duplicadas",
    desc: "Sin un sistema centralizado, es f\u00e1cil agendar dos citas en el mismo horario.",
  },
  {
    icon: Smartphone,
    title: "Atado al celular",
    desc: "Si no contestas WhatsApp, pierdes citas. No puedes estar disponible 24/7 manualmente.",
  },
];

const ZENDA_FEATURES = [
  {
    icon: Bot,
    title: "IA que agenda por ti",
    desc: "La inteligencia artificial responde consultas y agenda citas autom\u00e1ticamente, como un recepcionista que nunca duerme.",
  },
  {
    icon: Clock,
    title: "Disponibilidad 24/7",
    desc: "Tu negocio contesta WhatsApp de madrugada, fines de semana y d\u00edas festivos. Sin personal adicional.",
  },
  {
    icon: MessageSquare,
    title: "Confirmaci\u00f3n autom\u00e1tica",
    desc: "Zenda confirma cada cita y env\u00eda recordatorios 24h y 2h antes. Reduce inasistencias hasta un 40%.",
  },
  {
    icon: Shield,
    title: "Agenda sincronizada",
    desc: "Todas las citas se registran en un calendario central. Sin duplicados, sin confusiones, sin errores.",
  },
  {
    icon: Globe,
    title: "Hecho para LATAM",
    desc: "Dise\u00f1ado para negocios en Latinoam\u00e9rica. Precios en USD accesibles, soporte en espa\u00f1ol, integraci\u00f3n con WhatsApp Business API.",
  },
];

const BEFORE_AFTER = [
  {
    label: "Gesti\u00f3n de citas",
    before: "Manual, lenta, propensa a errores",
    after: "Autom\u00e1tica, instant\u00e1nea, sin errores",
  },
  {
    label: "Disponibilidad",
    before: "Solo horario laboral",
    after: "24/7, todos los d\u00edas",
  },
  {
    label: "Tiempo de respuesta",
    before: "Minutos, horas o nunca",
    after: "Menos de 5 segundos",
  },
  {
    label: "Confirmaciones",
    before: "Llamadas telef\u00f3nicas manuales",
    after: "WhatsApp autom\u00e1tico",
  },
  {
    label: "Inasistencias",
    before: "30-40% promedio",
    after: "Reducci\u00f3n hasta 40%",
  },
  {
    label: "Costo",
    before: "Recepcionista $500+/mes",
    after: "Desde $0 con plan gratis",
  },
];

const FAQS = [
  {
    q: "\u00bfEn qu\u00e9 se diferencia Zenda de WhatsApp Business normal?",
    a: "WhatsApp Business solo te da un perfil comercial y respuestas r\u00e1pidas. Zenda a\u00f1ade inteligencia artificial que entiende a tus clientes, agenda citas autom\u00e1ticamente, confirma y env\u00eda recordatorios sin que intervengas.",
  },
  {
    q: "\u00bfNecesito cambiar mi n\u00famero de WhatsApp?",
    a: "No necesariamente. Zenda se conecta a tu WhatsApp Business API. Puedes usar tu n\u00famero actual o configurar uno nuevo durante el proceso de registro.",
  },
  {
    q: "\u00bfCu\u00e1nto cuesta Zenda?",
    a: "Ofrecemos un plan gratis con hasta 25 contactos mensuales. Los planes pagados empiezan desde $29 USD/mes con funcionalidad completa. Todos incluyen 14 d\u00edas de prueba gratis.",
  },
  {
    q: "\u00bfPuedo personalizar los mensajes?",
    a: "S\u00ed. Puedes definir el tono, la frecuencia de recordatorios, y personalizar mensajes con el nombre del cliente, servicio y horario. La IA se adapta a tu marca.",
  },
  {
    q: "\u00bfFunciona para cualquier tipo de negocio?",
    a: "Zenda est\u00e1 dise\u00f1ado para negocios de citas: salones de belleza, cl\u00ednicas dentales, barber\u00edas, spas, gimnasios, talleres mec\u00e1nicos, veterinarias y m\u00e1s.",
  },
  {
    q: "\u00bfQu\u00e9 pasa si la IA no entiende al cliente?",
    a: "En casos donde la IA no pueda resolver la consulta, te notifica para que intervengas. Adem\u00e1s, la IA aprende de cada interacci\u00f3n y mejora constantemente.",
  },
  {
    q: "\u00bfCu\u00e1nto tiempo toma la configuraci\u00f3n?",
    a: "La configuraci\u00f3n toma aproximadamente 5 minutos: vinculas tu WhatsApp Business, defines tus servicios y horarios, y Zenda empieza a funcionar de inmediato.",
  },
  {
    q: "\u00bfMis datos est\u00e1n seguros?",
    a: "S\u00ed. Zenda cumple con las pol\u00edticas de privacidad de WhatsApp y protege la informaci\u00f3n de tus clientes con encriptaci\u00f3n. No compartimos datos con terceros.",
  },
];

export default function WhatsAppNegociosCitasPage() {
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
      "WhatsApp para negocios con citas. IA que responde, agenda, confirma y env\u00eda recordatorios autom\u00e1ticamente.",
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
          WhatsApp para Negocios con Citas
        </p>
        <h1 className="mb-6 font-bold text-4xl text-slate-900 leading-tight md:text-5xl">
          Tu WhatsApp Business ahora{" "}
          <span className="text-emerald-600">agenda citas solo</span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-600">
          Convierte tu WhatsApp en una m\u00e1quina de agendar citas. Zenda
          a\u00f1ade IA que responde, agenda, confirma y recuerda citas
          autom\u00e1ticamente. Sin contratar personal.
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/founding">
            <Button className="rounded-full bg-emerald-600 px-8 py-3 text-base text-white hover:bg-emerald-700">
              Probar gratis \u2014 14 d\u00edas
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-slate-400 text-sm">
          Sin tarjeta de cr\u00e9dito \u00b7 5 min de configuraci\u00f3n \u00b7
          Hecho para LATAM
        </p>
      </section>

      {/* Why regular WhatsApp isn't enough */}
      <section className="border-slate-100 border-y bg-slate-50 py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-4 text-center font-bold text-2xl text-slate-900">
            WhatsApp Business ya no es suficiente
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-slate-500">
            Tus clientes quieren respuestas inmediatas. Si no contestas, pierden
            la paciencia y van con la competencia.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {PAIN_POINTS.map((pp) => (
              <div
                className="rounded-lg border border-red-100 bg-red-50 p-6"
                key={pp.title}
              >
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                  <pp.icon className="h-5 w-5 text-red-500" />
                </div>
                <h3 className="mb-2 font-semibold text-red-900">{pp.title}</h3>
                <p className="text-red-700 text-sm">{pp.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Zenda features */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-4 text-center font-bold text-2xl text-slate-900">
            Lo que Zenda a\u00f1ade a tu WhatsApp
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-slate-500">
            De un simple chat a un sistema completo de citas automatizado.
          </p>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ZENDA_FEATURES.map((f) => (
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

      {/* Before / After comparison */}
      <section className="border-slate-100 border-t bg-slate-50 py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-4 text-center font-bold text-2xl text-slate-900">
            Antes de Zenda vs. despu\u00e9s de Zenda
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-slate-500">
            La diferencia entre gestionar citas manualmente y automatizar con
            IA.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-slate-200 border-b">
                  <th className="pr-4 pb-3 font-semibold text-slate-500">
                    Aspecto
                  </th>
                  <th className="px-4 pb-3 text-center font-semibold text-red-400">
                    Antes
                  </th>
                  <th className="pb-3 pl-4 text-center font-semibold text-emerald-600">
                    Con Zenda
                  </th>
                </tr>
              </thead>
              <tbody>
                {BEFORE_AFTER.map((row) => (
                  <tr className="border-slate-100 border-b" key={row.label}>
                    <td className="py-3 pr-4 font-medium text-slate-700">
                      {row.label}
                    </td>
                    <td className="px-4 py-3 text-center text-red-400">
                      {row.before}
                    </td>
                    <td className="py-3 pl-4 text-center text-emerald-600">
                      {row.after}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            Empieza gratis, crece cuando est\u00e9s listo
          </h2>
          <p className="mb-8 text-slate-500">
            Plan gratis con hasta 25 contactos mensuales. Planes completos desde
            $29 USD/mes con todas las funciones de automatizaci\u00f3n.
          </p>
          <div className="mx-auto grid max-w-lg gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white p-6 text-left">
              <p className="mb-1 font-bold text-slate-900">Gratis</p>
              <p className="mb-3 font-bold text-2xl text-emerald-600">$0</p>
              <ul className="space-y-2 text-slate-500 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  Hasta 25 contactos
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  Agendado autom\u00e1tico
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  Recordatorios
                </li>
              </ul>
            </div>
            <div className="rounded-lg border-2 border-emerald-200 bg-emerald-50 p-6 text-left">
              <p className="mb-1 font-bold text-emerald-700">Pro</p>
              <p className="mb-3 font-bold text-2xl text-emerald-600">
                $29<span className="font-normal text-sm">/mes</span>
              </p>
              <ul className="space-y-2 text-slate-600 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  Contactos ilimitados
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  Todas las funciones
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  Soporte prioritario
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8">
            <Link href="/founding">
              <Button className="rounded-full bg-emerald-600 px-8 py-3 text-base text-white hover:bg-emerald-700">
                Comenzar prueba gratis{" "}
                <ArrowRight className="ml-1 inline h-4 w-4" />
              </Button>
            </Link>
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
            Tu WhatsApp listo para agendar citas autom\u00e1ticamente
          </h2>
          <p className="mb-8 text-emerald-100">
            Conecta Zenda a tu WhatsApp Business y empieza a automatizar citas
            hoy. Prueba gratis 14 d\u00edas.
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

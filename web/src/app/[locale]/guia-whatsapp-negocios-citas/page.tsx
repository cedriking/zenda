import {
  Check,
  Clock,
  DollarSign,
  MessageSquare,
  Shield,
  Zap,
} from "lucide-react";
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
  const slug = "guia-whatsapp-negocios-citas";
  return {
    title: "Guía Completa: WhatsApp para Negocios de Citas en 2025 | Zenda",
    description:
      "Todo lo que necesitas saber sobre usar WhatsApp para agendar citas en tu negocio. Automatización, recordatorios, IA, plantillas de mensajes y ROI calculado. Para LATAM.",
    alternates: {
      canonical: `https://zenda.bot/${locale}/${slug}`,
      languages: {
        ...Object.fromEntries(
          routing.locales.map((l) => [l, `https://zenda.bot/${l}/${slug}`])
        ),
        "x-default": `https://zenda.bot/es/${slug}`,
      },
    },
    openGraph: {
      title: "Guía Completa: WhatsApp para Negocios de Citas en 2025",
      description:
        "Todo sobre usar WhatsApp para agendar citas. Automatización, IA, recordatorios y ROI. Guía para LATAM.",
      url: `https://zenda.bot/${locale}/${slug}`,
      type: "website",
      images: [
        {
          url: "https://zenda.bot/api/og?locale=es",
          width: 1200,
          height: 630,
          alt: "Guía WhatsApp para Negocios de Citas — Zenda",
        },
      ],
    },
  };
}

const USE_CASES = [
  {
    industry: "Clínicas Dentales",
    stat: "35% cancelación sin automatizar",
    benefit: "Reduce cancelaciones a 12% con recordatorios WhatsApp",
  },
  {
    industry: "Salones de Belleza",
    stat: "60% de clientes prefieren WhatsApp",
    benefit: "Agendamiento automático 24/7 sin recepcionista",
  },
  {
    industry: "Spas y Bienestar",
    stat: "25% de citas perdidas por no responder",
    benefit: "IA responde al instante, agenda y confirma",
  },
  {
    industry: "Veterinarias",
    stat: "80% de clientes usan WhatsApp",
    benefit: "Recordatorios + confirmación automática",
  },
  {
    industry: "Gimnasios y Fitness",
    stat: "45% abandono por fricción en reserva",
    benefit: "Reservar clase en 30 segundos por WhatsApp",
  },
  {
    industry: "Talleres Mecánicos",
    stat: "50% de citas por WhatsApp ya",
    benefit: "Automatiza citas, confirma y recuerda",
  },
];

const FEATURES = [
  {
    icon: MessageSquare,
    title: "Agendamiento con IA",
    desc: "Tu recepcionista virtual conversa con clientes en español, entiende cuando quieren una cita y agenda automáticamente.",
  },
  {
    icon: Clock,
    title: "Recordatorios automáticos",
    desc: "Manda recordatorios 24h y 2h antes. Reduce cancelaciones hasta 40% sin esfuerzo.",
  },
  {
    icon: Zap,
    title: "Disponible 24/7",
    desc: "Tus clientes pueden agendar a las 11pm, domingo, feriado — tu recepcionista IA nunca duerme.",
  },
  {
    icon: Shield,
    title: "Sin código, sin riesgo",
    desc: "Conecta WhatsApp Business en 2 minutos. Sin desarrolladores, sin contratos, cancela cuando quieras.",
  },
  {
    icon: DollarSign,
    title: "Plan gratis disponible",
    desc: "Empieza sin pagar nada. Los planes pagos desde $29 USD/mes — menos que una hora de recepcionista.",
  },
  {
    icon: Check,
    title: "Hecho para LATAM",
    desc: "Español nativo, WhatsApp primero, moneda local. No es una adaptación — fue construido para ti.",
  },
];

export default function GuiaWhatsAppNegociosPage() {
  return (
    <div className="min-h-screen bg-white">
      <Nav variant="simple" />

      <section className="mx-auto max-w-4xl px-6 pt-20 pb-16 text-center">
        <p className="mb-4 font-semibold text-emerald-600 text-sm uppercase tracking-wide">
          Guía Completa 2025
        </p>
        <h1 className="mb-6 font-bold text-4xl text-slate-900 leading-tight md:text-5xl">
          WhatsApp para Negocios de Citas:{" "}
          <span className="text-emerald-600">
            La Guía que tu Negocio Necesita
          </span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-600">
          Todo lo que necesitas saber sobre automatizar citas por WhatsApp.
          Desde conectar tu número hasta recibir reservas automáticamente con
          IA. Hecho para negocios en Latinoamérica.
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/founding">
            <Button className="rounded-full bg-emerald-600 px-8 py-3 text-base text-white hover:bg-emerald-700">
              Comenzar gratis — 5 minutos setup
            </Button>
          </Link>
        </div>
      </section>

      <section className="border-slate-100 border-y bg-slate-50 py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-4 text-center font-bold text-2xl text-slate-900">
            Por qué WhatsApp es el canal #1 para citas en LATAM
          </h2>
          <p className="mx-auto mb-8 max-w-3xl text-center text-slate-600">
            En Latinoamérica, WhatsApp tiene más de 400 millones de usuarios.
            Tus clientes ya están ahí. La pregunta no es si usar WhatsApp — es
            cómo automatizarlo.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5 text-center">
              <p className="font-bold text-3xl text-emerald-600">98%</p>
              <p className="mt-1 text-slate-500 text-sm">
                Tasa de apertura WhatsApp (vs 20% email)
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 text-center">
              <p className="font-bold text-3xl text-emerald-600">400M+</p>
              <p className="mt-1 text-slate-500 text-sm">
                Usuarios de WhatsApp en LATAM
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 text-center">
              <p className="font-bold text-3xl text-emerald-600">-40%</p>
              <p className="mt-1 text-slate-500 text-sm">
                Cancelaciones con recordatorios WhatsApp
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-8 text-center font-bold text-2xl text-slate-900">
            Resultados por industria
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {USE_CASES.map((uc) => (
              <div
                className="rounded-xl border border-slate-200 p-5"
                key={uc.industry}
              >
                <h3 className="mb-2 font-semibold text-slate-900">
                  {uc.industry}
                </h3>
                <p className="mb-2 text-red-500 text-sm">{uc.stat}</p>
                <p className="text-emerald-600 text-sm">{uc.benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-slate-100 border-y bg-slate-50 py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-12 text-center font-bold text-2xl text-slate-900">
            Lo que incluye un recepcionista WhatsApp con IA
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                className="rounded-lg border border-slate-200 bg-white p-6"
                key={f.title}
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                  <f.icon className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="mb-2 font-semibold text-slate-900">{f.title}</h3>
                <p className="text-slate-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-8 text-center font-bold text-2xl text-slate-900">
            Cómo funciona paso a paso
          </h2>
          <div className="space-y-6">
            {[
              {
                step: "1",
                title: "Conecta tu WhatsApp Business",
                desc: "Descarga WhatsApp Business (gratis), vincúlalo a Zenda en 2 minutos. Sin código, sin configuración compleja.",
              },
              {
                step: "2",
                title: "Configura tus servicios y horarios",
                desc: 'Define qué ofreces, cuánto cuesta, y cuándo estás disponible. Ejemplo: "Corte de pelo $200 MXN, Lun-Sáb 9-19h".',
              },
              {
                step: "3",
                title: "La IA empieza a trabajar",
                desc: "Cuando un cliente escribe por WhatsApp, la IA conversa, entiende qué servicio quiere, verifica disponibilidad y agenda.",
              },
              {
                step: "4",
                title: "Recordatorios automáticos",
                desc: "Se envían recordatorios 24h y 2h antes de cada cita. Si alguien necesita reprogramar, la IA lo hace automáticamente.",
              },
              {
                step: "5",
                title: "Tú ves todo en un panel",
                desc: "Dashboard con citas del día, tasa de confirmación, y métricas. Tú siempre tienes control total.",
              },
            ].map((s) => (
              <div className="flex gap-4" key={s.step}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-600 text-lg">
                  {s.step}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{s.title}</h3>
                  <p className="mt-1 text-slate-500 text-sm">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-slate-100 border-y bg-slate-50 py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-8 text-center font-bold text-2xl text-slate-900">
            Calcula tu ROI
          </h2>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">
                    Métrica
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">
                    Sin automatizar
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-emerald-600">
                    Con Zenda
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-slate-100 border-t">
                  <td className="px-4 py-3 font-medium text-slate-700">
                    Tiempo en agendar
                  </td>
                  <td className="px-4 py-3 text-slate-400">3-5 horas/día</td>
                  <td className="px-4 py-3 font-medium text-emerald-600">
                    0 horas (automático)
                  </td>
                </tr>
                <tr className="border-slate-100 border-t">
                  <td className="px-4 py-3 font-medium text-slate-700">
                    Tasa de cancelación
                  </td>
                  <td className="px-4 py-3 text-slate-400">25-35%</td>
                  <td className="px-4 py-3 font-medium text-emerald-600">
                    8-12%
                  </td>
                </tr>
                <tr className="border-slate-100 border-t">
                  <td className="px-4 py-3 font-medium text-slate-700">
                    Disponibilidad
                  </td>
                  <td className="px-4 py-3 text-slate-400">Horario laboral</td>
                  <td className="px-4 py-3 font-medium text-emerald-600">
                    24/7
                  </td>
                </tr>
                <tr className="border-slate-100 border-t">
                  <td className="px-4 py-3 font-medium text-slate-700">
                    Tiempo de respuesta
                  </td>
                  <td className="px-4 py-3 text-slate-400">5-60 minutos</td>
                  <td className="px-4 py-3 font-medium text-emerald-600">
                    Instantáneo
                  </td>
                </tr>
                <tr className="border-slate-100 border-t">
                  <td className="px-4 py-3 font-medium text-slate-700">
                    Costo mensual
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    $8,000-15,000 MXN (personal)
                  </td>
                  <td className="px-4 py-3 font-medium text-emerald-600">
                    $0-$5,500 MXN
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-8 text-center font-bold text-2xl text-slate-900">
            Recursos relacionados
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              {
                title: "Cómo Agendar Citas por WhatsApp — Guía Completa",
                href: "/blog/como-agendar-citas-whatsapp-negocio",
              },
              {
                title: "Evitar Cancelaciones con WhatsApp Reminders",
                href: "/blog/evitar-cancelaciones-citas-whatsapp",
              },
              {
                title: "Recepcionista Virtual WhatsApp",
                href: "/recepcionista-virtual-whatsapp",
              },
              {
                title: "Automatizar Citas WhatsApp",
                href: "/automatizar-citas-whatsapp",
              },
              {
                title: "Recordatorios de Citas WhatsApp",
                href: "/recordatorios-citas-whatsapp",
              },
              {
                title: "Bot de Citas WhatsApp",
                href: "/bot-citas-whatsapp",
              },
              {
                title: "Alternativa a Calendly para WhatsApp",
                href: "/mejor-alternativa-calendly-whatsapp",
              },
              {
                title: "Recepcionista Dental WhatsApp",
                href: "/recepcionista-dental-whatsapp",
              },
            ].map((r) => (
              <Link href={r.href} key={r.href}>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 p-3 transition-colors hover:border-emerald-300 hover:bg-emerald-50">
                  <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                  <p className="text-slate-700 text-sm">{r.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-slate-100 border-t bg-slate-50 py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-8 text-center font-bold text-2xl text-slate-900">
            Preguntas frecuentes
          </h2>
          <div className="space-y-6">
            {[
              {
                q: "Necesito cambiar mi número de WhatsApp?",
                a: "No. Puedes usar tu número actual. Solo necesitas la app WhatsApp Business (gratuita) en lugar de WhatsApp regular. La migración toma 5 minutos y no pierdes nada.",
              },
              {
                q: "La IA suena natural en español?",
                a: "Sí. Zenda fue construido para Latinoamérica desde el día uno. La IA entiende español coloquial, modismos regionales y acentos. La mayoría de los clientes no notan que es IA.",
              },
              {
                q: "Puedo intervenir si algo sale mal?",
                a: "Siempre. Tú ves todas las conversaciones en tiempo real y puedes tomar el control cuando quieras. La IA es tu asistente — tú eres el jefe.",
              },
              {
                q: "Funciona en México, Argentina, Colombia?",
                a: "Sí. Zenda funciona en toda Latinoamérica. WhatsApp es universal en la región — solo necesitas conexión a internet.",
              },
              {
                q: "Qué pasa si ya tengo un sistema de citas?",
                a: "Zenda complementa tu sistema existente. La IA maneja la conversación por WhatsApp y puedes exportar las citas a tu calendario o sistema actual.",
              },
              {
                q: "Hay contrato o permanencia?",
                a: "No. Pagas mes a mes, cancelas cuando quieras. Sin contratos, sin letra pequeña. El plan gratis no tiene fecha de vencimiento.",
              },
            ].map((faq) => (
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
            Tu recepcionista WhatsApp está listo
          </h2>
          <p className="mb-8 text-emerald-100">
            Configura en 5 minutos. Plan gratis disponible. Empieza a recibir
            citas automáticas hoy.
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

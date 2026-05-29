import { CalendarCheck, Check, Clock, MessageSquare } from "lucide-react";
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
    title: "Automatizar Citas por WhatsApp | Agenda Automática 24/7 — Zenda",
    description:
      "Automatiza la agenda de citas por WhatsApp. Tu negocio responde, agenda y confirma citas automáticamente sin personal adicional. Configura en 5 minutos. Prueba gratis.",
    alternates: {
      canonical: "https://zenda.bot/es/automatizar-citas-whatsapp",
    },
    openGraph: {
      title: "Automatizar Citas por WhatsApp — Agenda Automática 24/7",
      description:
        "Deja de perder citas por respuestas lentas. Automatiza la agenda de citas por WhatsApp con IA. Prueba gratis 14 días.",
      url: "https://zenda.bot/es/automatizar-citas-whatsapp",
      type: "website",
      images: [
        {
          url: `https://zenda.bot/api/og?locale=${locale}`,
          width: 1200,
          height: 630,
          alt: "Zenda — Automatizar Citas WhatsApp",
        },
      ],
    },
  };
}

const STATS = [
  { value: "3x", label: "más citas agendadas" },
  { value: "40%", label: "menos inasistencias" },
  { value: "<5s", label: "tiempo de respuesta" },
  { value: "24/7", label: "disponibilidad" },
];

const STEPS = [
  {
    icon: MessageSquare,
    title: "Cliente escribe por WhatsApp",
    desc: "Un cliente potencial envía un mensaje preguntando por disponibilidad, precios o queriendo agendar.",
  },
  {
    icon: Clock,
    title: "Zenda responde al instante",
    desc: "La IA analiza el mensaje, consulta tu agenda y responde con opciones de horario disponibles — en segundos.",
  },
  {
    icon: CalendarCheck,
    title: "Cita confirmada automáticamente",
    desc: "El cliente elige su horario, Zenda confirma la cita y programa un recordatorio automático.",
  },
];

const RESULTS = [
  "Nunca más pierdas una cita por no contestar a tiempo",
  "Reduce el tiempo que tu equipo pasa contestando WhatsApp",
  "Elimina citas duplicadas y confusiones de horario",
  "Manda recordatorios automáticos para reducir inasistencias",
  "Funciona mientras estás ocupado con un cliente",
  "Centraliza todas las citas en un solo sistema",
];

export default function AutomatizarCitasPage() {
  return (
    <div className="min-h-screen bg-white">
      <Nav variant="simple" />

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pt-20 pb-16 text-center">
        <p className="mb-4 font-semibold text-emerald-600 text-sm uppercase tracking-wide">
          Automatizar Citas por WhatsApp
        </p>
        <h1 className="mb-6 font-bold text-4xl text-slate-900 leading-tight md:text-5xl">
          Deja de perder citas por{" "}
          <span className="text-emerald-600">no contestar a tiempo</span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-600">
          Automatiza la agenda de citas por WhatsApp. Tu negocio responde en
          segundos, agenda automáticamente y envía recordatorios — sin contratar
          personal adicional.
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/founding">
            <Button className="rounded-full bg-emerald-600 px-8 py-3 text-base text-white hover:bg-emerald-700">
              Automatizar mis citas — Gratis 14 días
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-slate-400 text-sm">
          Sin tarjeta de crédito · Configura en 5 minutos
        </p>
      </section>

      {/* Stats */}
      <section className="border-slate-100 border-y bg-slate-50 py-12">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 px-6 md:grid-cols-4">
          {STATS.map((stat) => (
            <div className="text-center" key={stat.label}>
              <p className="font-bold text-2xl text-emerald-600">
                {stat.value}
              </p>
              <p className="text-slate-500 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-4 text-center font-bold text-2xl text-slate-900">
            Cómo funciona la automatización de citas
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-slate-500">
            Tu cliente escribe, Zenda responde y agenda. Todo automático.
          </p>
          <div className="grid gap-8 md:grid-cols-3">
            {STEPS.map((step) => (
              <div className="text-center" key={step.title}>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                  <step.icon className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="mb-2 font-semibold text-slate-900">
                  {step.title}
                </h3>
                <p className="text-slate-500 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="border-slate-100 border-t bg-slate-50 py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-12 text-center font-bold text-2xl text-slate-900">
            Resultados que notarás desde el primer día
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {RESULTS.map((r) => (
              <div
                className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4"
                key={r}
              >
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                <p className="text-slate-700 text-sm">{r}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who is it for */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="mb-6 font-bold text-2xl text-slate-900">
            ¿Para quién es?
          </h2>
          <p className="text-slate-500">
            Cualquier negocio que agenda citas por WhatsApp en Latinoamérica:
            salones de belleza, clínicas dentales, barberías, spas, gimnasios,
            estudios de yoga, consultorios médicos, talleres mecánicos y más.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-emerald-600 py-16 text-center">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-4 font-bold text-2xl text-white">
            Empieza a automatizar tus citas hoy
          </h2>
          <p className="mb-8 text-emerald-100">
            Deja de perder clientes por respuestas lentas. Prueba Zenda gratis
            14 días.
          </p>
          <Link href="/founding">
            <Button className="rounded-full bg-white px-8 py-3 font-semibold text-base text-emerald-700 hover:bg-emerald-50">
              Probar gratis 14 días →
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

import { Check } from "lucide-react";
import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export function generateMetadata(): Metadata {
  return {
    title: "Recepcionista Virtual WhatsApp | Automatiza Citas 24/7 — Zenda",
    description:
      "Recepcionista virtual por WhatsApp que responde clientes, agenda citas y envía recordatorios automáticamente. Funciona 24/7 sin contratar personal. Prueba gratis 14 días.",
    alternates: {
      canonical: "https://zenda.bot/es/recepcionista-virtual-whatsapp",
    },
    openGraph: {
      title: "Recepcionista Virtual WhatsApp — Automatiza Citas 24/7",
      description:
        "Tu recepcionista virtual por WhatsApp que nunca duerme. Responde, agenda y confirma citas automáticamente. Prueba gratis.",
      url: "https://zenda.bot/es/recepcionista-virtual-whatsapp",
      type: "website",
      images: [
        {
          url: "https://zenda.bot/api/og?locale=es",
          width: 1200,
          height: 630,
          alt: "Zenda — Recepcionista Virtual WhatsApp",
        },
      ],
    },
  };
}

const FEATURES = [
  {
    title: "Responde al instante",
    desc: "Cada mensaje de WhatsApp recibe respuesta en segundos — las 24 horas, los 7 días. Sin tiempos de espera.",
  },
  {
    title: "Agenda citas automáticamente",
    desc: "Tu recepcionista virtual verifica disponibilidad y confirma la cita directamente en WhatsApp. Sin llamadas ni formularios.",
  },
  {
    title: "Recordatorios inteligentes",
    desc: "Envía recordatorios automáticos 24h y 2h antes de cada cita. Reduce las inasistencias hasta un 40%.",
  },
  {
    title: "Funciona en español",
    desc: "Entiende y responde en español perfecto. También disponible en inglés, portugués y 6 idiomas más.",
  },
  {
    title: "Sin instalación",
    desc: "No necesitas descargar nada. Funciona directamente desde tu WhatsApp Business existente.",
  },
  {
    title: "Configura en 5 minutos",
    desc: "Conecta tu WhatsApp, define tus servicios y horarios, y listo. Tu recepcionista virtual empieza a trabajar.",
  },
];

const USE_CASES = [
  { icon: "💇‍♀️", label: "Salones de belleza" },
  { icon: "🦷", label: "Clínicas dentales" },
  { icon: "💆‍♀️", label: "Spas y wellness" },
  { icon: "🏋️", label: "Gimnasios" },
  { icon: "💅", label: "Uñas y estética" },
  { icon: "✂️", label: "Barberías" },
];

const FAQS = [
  {
    q: "¿Qué es una recepcionista virtual por WhatsApp?",
    a: "Es un asistente de inteligencia artificial que responde mensajes de WhatsApp de tus clientes automáticamente. Agenda citas, responde preguntas sobre horarios y precios, y envía recordatorios — sin que tú o tu personal tengan que estar pendientes del teléfono.",
  },
  {
    q: "¿Cómo funciona?",
    a: "Conectas tu WhatsApp Business a Zenda, configuras tus servicios, horarios y precios. Cuando un cliente escribe, la IA responde en segundos, verifica disponibilidad y confirma la cita. Todo automático.",
  },
  {
    q: "¿Necesito instalar algo?",
    a: "No. Zenda funciona directamente con tu WhatsApp Business existente. Solo necesitas una computadora para la configuración inicial (5 minutos).",
  },
  {
    q: "¿Cuánto cuesta?",
    a: "Desde $29 USD/mes para un local. Ofrecemos 14 días de prueba gratis sin tarjeta de crédito. Los primeros 10 negocios reciben 50% de descuento durante 3 meses.",
  },
  {
    q: "¿Puede reemplazar a mi recepcionista?",
    a: "Zenda complementa a tu equipo. Se encarga de las tareas repetitivas (responder horarios, agendar, confirmar) para que tu personal se enfoque en atender al cliente en persona.",
  },
];

function CTAButton() {
  return (
    <Link href="/founding">
      <Button className="rounded-full bg-emerald-600 px-8 py-3 text-base text-white hover:bg-emerald-700">
        Probar gratis 14 días
      </Button>
    </Link>
  );
}

export default function RecepcionistaVirtualPage() {
  return (
    <div className="min-h-screen bg-white">
      <Nav variant="simple" />

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pt-20 pb-16 text-center">
        <p className="mb-4 font-semibold text-emerald-600 text-sm uppercase tracking-wide">
          Recepcionista Virtual WhatsApp
        </p>
        <h1 className="mb-6 font-bold text-4xl text-slate-900 leading-tight md:text-5xl">
          Tu recepcionista virtual por WhatsApp que{" "}
          <span className="text-emerald-600">nunca duerme</span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-600">
          Responde clientes, agenda citas y envía recordatorios automáticamente
          por WhatsApp. Funciona 24/7 sin contratar personal adicional.
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <CTAButton />
          <p className="text-slate-400 text-sm">
            14 días gratis · Sin tarjeta de crédito · Configura en 5 min
          </p>
        </div>
      </section>

      {/* Use cases */}
      <section className="border-slate-100 border-y bg-slate-50 py-12">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="mb-6 text-slate-500 text-sm">
            Ideal para negocios de citas en Latinoamérica
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {USE_CASES.map((uc) => (
              <span
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-700 text-sm"
                key={uc.label}
              >
                {uc.icon} {uc.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-12 text-center font-bold text-2xl text-slate-900">
            Cómo funciona
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Conecta tu WhatsApp",
                desc: "Vincula tu WhatsApp Business en 2 minutos. Sin instalar nada extra.",
              },
              {
                step: "2",
                title: "Configura servicios",
                desc: "Define tus servicios, horarios y precios. La IA aprende tu negocio.",
              },
              {
                step: "3",
                title: "Recibe más citas",
                desc: "Tu recepcionista virtual responde 24/7 y agenda cada cita automáticamente.",
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

      {/* Features */}
      <section className="border-slate-100 border-t bg-slate-50 py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-12 text-center font-bold text-2xl text-slate-900">
            Todo lo que tu recepcionista virtual hace por ti
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {FEATURES.map((f) => (
              <div
                className="rounded-xl border border-slate-200 bg-white p-6"
                key={f.title}
              >
                <div className="mb-2 flex items-center gap-2">
                  <Check className="h-5 w-5 text-emerald-500" />
                  <h3 className="font-semibold text-slate-900">{f.title}</h3>
                </div>
                <p className="text-slate-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-16 text-center">
        <div className="mx-auto max-w-3xl px-6">
          <p className="mb-4 text-3xl">📉</p>
          <p className="mb-2 font-semibold text-lg text-slate-900">
            Reducción de inasistencias hasta 40%
          </p>
          <p className="text-slate-500">
            Los negocios que usan recordatorios automáticos por WhatsApp ven
            hasta un 40% menos de citas perdidas.
          </p>
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
            Empieza a recibir más citas hoy
          </h2>
          <p className="mb-8 text-emerald-100">
            Tu recepcionista virtual por WhatsApp está lista en 5 minutos.
            Pruébala gratis 14 días.
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

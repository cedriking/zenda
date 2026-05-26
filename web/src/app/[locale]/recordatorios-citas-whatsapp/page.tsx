import { Bell, Check, Clock, MessageSquare, Send, Users } from "lucide-react";
import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export function generateMetadata(): Metadata {
  return {
    title: "Recordatorios de Citas por WhatsApp | Reduce Inasistencias — Zenda",
    description:
      "Envía recordatorios automáticos de citas por WhatsApp. Reduce inasistencias hasta un 40%. Funciona 24/7 con confirmación automática. Prueba gratis.",
    alternates: {
      canonical: "https://zenda.bot/es/recordatorios-citas-whatsapp",
    },
    openGraph: {
      title: "Recordatorios de Citas por WhatsApp — Reduce Inasistencias 40%",
      description: "Recordatorios automáticos por WhatsApp que reducen inasistencias. Confirmación y reagenda automática. Prueba gratis 14 días.",
      url: "https://zenda.bot/es/recordatorios-citas-whatsapp",
      type: "website",
      images: [{ url: "https://zenda.bot/api/og?locale=es", width: 1200, height: 630, alt: "Zenda — Recordatorios de Citas WhatsApp" }],
    },
  };
}

const STEPS = [
  { icon: MessageSquare, title: "Cliente agenda una cita", desc: "El cliente agenda por WhatsApp, teléfono o en persona. La cita se registra automáticamente." },
  { icon: Bell, title: "Recordatorios automáticos", desc: "WhatsApp envía recordatorios 24h y 2h antes de la cita. El cliente confirma con un solo mensaje." },
  { icon: Send, title: "Reagenda si no puede asistir", desc: "Si el cliente necesita cambiar la cita, la IA propone nuevos horarios disponibles al instante." },
];

const RESULTS = [
  "Reduce inasistencias hasta un 40%",
  "Los clientes confirman con un solo mensaje de WhatsApp",
  "Reagenda automáticamente si el cliente no puede asistir",
  "No más llamadas telefónicas para confirmar citas",
  "Historial completo de confirmaciones y cancelaciones",
  "Funciona para cualquier tipo de negocio de citas",
];

const FAQS = [
  { q: "¿Cómo funcionan los recordatorios por WhatsApp?", a: "Cuando un cliente agenda una cita, Zenda envía automáticamente recordatorios por WhatsApp 24 horas y 2 horas antes. El cliente puede confirmar, cancelar o reagenda directamente desde el chat." },
  { q: "¿Cuánto reducen las inasistencias?", a: "Los negocios que implementan recordatorios automáticos por WhatsApp reducen las inasistencias entre un 30% y un 40% en promedio." },
  { q: "¿El cliente necesita instalar algo?", a: "No. Los recordatorios llegan como mensajes normales de WhatsApp. El cliente solo necesita responder para confirmar o reagenda." },
  { q: "¿Puedo personalizar los mensajes de recordatorio?", a: "Sí. Puedes personalizar el tono, la frecuencia y el contenido de los recordatorios. Usar el nombre del cliente, el servicio agendado y la hora." },
  { q: "¿Qué pasa si el cliente no responde al recordatorio?", a: "Puedes configurar un segundo recordatorio o una llamada de seguimiento automática. También recibirás una notificación si el cliente no confirma." },
];

export default function RecordatoriosCitasPage() {
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
      <script dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} type="application/ld+json" />
      <Nav variant="simple" />

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pt-20 pb-16 text-center">
        <p className="mb-4 font-semibold text-emerald-600 text-sm uppercase tracking-wide">
          Recordatorios de Citas por WhatsApp
        </p>
        <h1 className="mb-6 font-bold text-4xl text-slate-900 leading-tight md:text-5xl">
          Reduce inasistencias con <span className="text-emerald-600">recordatorios automáticos</span> por WhatsApp
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-600">
          Envía recordatorios 24h y 2h antes de cada cita. El cliente confirma, cancela o reagenda directamente en WhatsApp. Sin llamadas, sin complicaciones.
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/founding">
            <Button className="rounded-full bg-emerald-600 px-8 py-3 text-base text-white hover:bg-emerald-700">
              Probar gratis — Reduce inasistencias
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-slate-400 text-sm">
          Hasta 40% menos inasistencias · Plan gratis disponible · 5 minutos
        </p>
      </section>

      {/* How it works */}
      <section className="border-slate-100 border-y bg-slate-50 py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-12 text-center font-bold text-2xl text-slate-900">
            Cómo funcionan los recordatorios
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {STEPS.map((step) => (
              <div className="text-center" key={step.title}>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                  <step.icon className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="mb-2 font-semibold text-slate-900">{step.title}</h3>
                <p className="text-slate-500 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-12 text-center font-bold text-2xl text-slate-900">
            Resultados que verás desde la primera semana
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {RESULTS.map((r) => (
              <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4" key={r}>
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                <p className="text-slate-700 text-sm">{r}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-slate-100 border-t bg-slate-50 py-12">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 px-6 md:grid-cols-4">
          {[
            { value: "40%", label: "menos inasistencias" },
            { value: "95%", label: "tasa de confirmación" },
            { value: "<3s", label: "tiempo de respuesta" },
            { value: "0", label: "llamadas manuales" },
          ].map((stat) => (
            <div className="text-center" key={stat.label}>
              <p className="font-bold text-2xl text-emerald-600">{stat.value}</p>
              <p className="text-slate-500 text-sm">{stat.label}</p>
            </div>
          ))}
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
                <p className="text-slate-500 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-emerald-600 py-16 text-center">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-4 font-bold text-2xl text-white">
            Deja de perder citas por inasistencias
          </h2>
          <p className="mb-8 text-emerald-100">
            Los recordatorios automáticos por WhatsApp reducen inasistencias hasta un 40%. Empieza gratis.
          </p>
          <Link href="/founding">
            <Button className="rounded-full bg-white px-8 py-3 font-semibold text-base text-emerald-700 hover:bg-emerald-50">
              Probar gratis →
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

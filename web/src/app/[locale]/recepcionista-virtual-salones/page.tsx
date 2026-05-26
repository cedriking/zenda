import { Check, Clock, Scissors, Star, MessageSquare, Calendar } from "lucide-react";
import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export function generateMetadata(): Metadata {
  return {
    title: "Recepcionista Virtual para Salones de Belleza | WhatsApp 24/7 — Zenda",
    description:
      "Recepcionista virtual por WhatsApp para salones de belleza, barberías y spas. Agenda citas, confirma turnos y envía recordatorios automáticamente. Prueba gratis.",
    alternates: {
      canonical: "https://zenda.bot/es/recepcionista-virtual-salones",
    },
    openGraph: {
      title: "Recepcionista Virtual para Salones de Belleza — WhatsApp 24/7",
      description: "Tu salón de belleza responde WhatsApp 24/7. Agenda citas, envía recordatorios y confirma turnos automáticamente. Prueba gratis.",
      url: "https://zenda.bot/es/recepcionista-virtual-salones",
      type: "website",
      images: [{ url: "https://zenda.bot/api/og?locale=es", width: 1200, height: 630, alt: "Zenda — Recepcionista Virtual Salones" }],
    },
  };
}

const SERVICES = [
  { icon: Scissors, label: "Barberías", desc: "Cortes, barba, afeitado clásico" },
  { icon: "✨", label: "Salones de belleza", desc: "Color, mechas, alisado, tratamientos" },
  { icon: "💅", label: "Uñas y estética", desc: "Manicura, pedicura, extensions" },
  { icon: "🧖", label: "Spas y wellness", desc: "Masajes, faciales, tratamientos" },
  { icon: "💇", label: "Peluquerías", desc: "Corte, peinado, tintes" },
  { icon: "💆", label: "Estéticas", desc: "Depilación, cejas, pestañas" },
];

const FEATURES = [
  { title: "Agenda por servicio y estilista", desc: "Cada estilista con su propia agenda. La IA asigna la cita según disponibilidad del profesional y tipo de servicio." },
  { title: "Responde preguntas de precios y servicios", desc: "Información precisa sobre todos tus servicios, precios y promociones — directamente en WhatsApp." },
  { title: "Recordatorios automáticos", desc: "Reduce las inasistencias hasta un 40% con recordatorios por WhatsApp 24h y 2h antes de la cita." },
  { title: "Gestión de horarios de饱和", desc: "Detecta cuando un estilista está ocupado y ofrece alternativas automáticamente." },
  { title: "Funciona en español perfecto", desc: "Entiende jerga local: 'mechas balayage', 'corte degradado', 'keratina'. Disponible en 9 idiomas." },
  { title: "Promociones y fidelización", desc: "Envía promociones automáticas a clientes frecuentes. Programa campañas de mantenimiento." },
];

const FAQS = [
  { q: "¿Cómo funciona para un salón de belleza?", a: "Conectas tu WhatsApp Business a Zenda, configuras tus servicios (corte, color, uñas, etc.), estilistas y horarios. Cuando un cliente escribe por WhatsApp, la IA responde con disponibilidad y agenda la cita automáticamente." },
  { q: "¿Puede manejar varios estilistas?", a: "Sí. Cada estilista tiene su propia agenda. La IA verifica disponibilidad por profesional y por servicio. Si un estilista está ocupado, ofrece alternativas." },
  { q: "¿Mis clientes necesitan instalar algo?", a: "No. Todo funciona por WhatsApp. Tus clientes escriben como siempre y reciben respuestas automáticas." },
  { q: "¿Cuánto cuesta?", a: "El plan gratis incluye hasta 25 contactos mensuales. Los planes pagados desde $29 USD/mes. Ofrecemos 50% de descuento a los primeros salones." },
  { q: "¿Puedo enviar promociones a mis clientes?", a: "Sí. Puedes programar mensajes promocionales para clientes frecuentes, fechas especiales (San Valentín, Navidad) y campañas de mantenimiento." },
];

export default function RecepcionistaSalonesPage() {
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
          Recepcionista Virtual para Salones
        </p>
        <h1 className="mb-6 font-bold text-4xl text-slate-900 leading-tight md:text-5xl">
          Tu salón atiende clientes por WhatsApp <span className="text-emerald-600">24/7 sin contratar</span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-600">
          Recepcionista virtual que agenda citas, confirma turnos y envía recordatorios para salones de belleza, barberías, spas y más. Automático por WhatsApp.
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/founding">
            <Button className="rounded-full bg-emerald-600 px-8 py-3 text-base text-white hover:bg-emerald-700">
              Probar gratis — Salones y spas
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-slate-400 text-sm">
          Plan gratis disponible · Sin tarjeta de crédito · 5 minutos
        </p>
      </section>

      {/* Service types */}
      <section className="border-slate-100 border-y bg-slate-50 py-12">
        <div className="mx-auto max-w-4xl px-6">
          <p className="mb-6 text-center text-slate-500 text-sm">
            Ideal para todo tipo de negocios de belleza y bienestar
          </p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {SERVICES.map((s) => (
              <div className="rounded-lg border border-slate-200 bg-white p-4 text-center" key={s.label}>
                <p className="mb-1 text-2xl">{typeof s.icon === 'string' ? s.icon : ''}</p>
                <p className="font-semibold text-slate-900 text-sm">{s.label}</p>
                <p className="text-slate-500 text-xs">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-12 text-center font-bold text-2xl text-slate-900">
            Todo lo que Zenda hace por tu salón
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {FEATURES.map((f) => (
              <div className="rounded-xl border border-slate-200 bg-white p-6" key={f.title}>
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
            Más citas, menos trabajo para tu salón
          </h2>
          <p className="mb-8 text-emerald-100">
            Tu recepcionista virtual por WhatsApp está lista en 5 minutos. Empieza con el plan gratis.
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

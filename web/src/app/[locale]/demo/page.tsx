import { Check, MessageCircle, Smartphone, Zap } from "lucide-react";
import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export function generateMetadata(): Metadata {
  return {
    title: "Ver Zenda en Acción — Demo por WhatsApp | Zenda",
    description:
      "Mira cómo Zenda agenda citas automáticamente por WhatsApp. Conversación real con IA. Prueba gratis.",
    alternates: {
      canonical: "https://zenda.bot/es/demo",
    },
    openGraph: {
      title: "Ver Zenda en Acción — Demo por WhatsApp",
      description: "Mira cómo la IA de Zenda agenda citas por WhatsApp automáticamente.",
      url: "https://zenda.bot/es/demo",
      type: "website",
    },
  };
}

const CHAT_MESSAGES = [
  { from: "client", text: "Hola! Quisiera una cita para un corte de pelo", time: "10:32 AM" },
  { from: "zenda", text: "¡Hola María! 👋 Te atiendo enseguida.\n\nPara un corte de pelo, tenemos disponibilidad:\n\n📅 Hoy a las 3:00 PM con Carlos\n📅 Mañana a las 11:00 AM con Laura\n📅 Jueves a las 5:00 PM con Carlos\n\n¿Cuál prefieres?", time: "10:32 AM" },
  { from: "client", text: "Hoy a las 3 con Carlos por favor", time: "10:33 AM" },
  { from: "zenda", text: "✅ ¡Listo! Tu cita está agendada:\n\n💇 Corte de pelo\n👤 Carlos\n📅 Hoy, 3:00 PM\n📍 Salón Beauty Studio\n\nTe enviaré un recordatorio 2 horas antes. ¿Necesitas algo más?", time: "10:33 AM" },
  { from: "client", text: "Cuánto cuesta?", time: "10:33 AM" },
  { from: "zenda", text: "El corte de pelo con Carlos cuesta $250 MXN.\n\nTambién tenemos estos servicios:\n✂️ Corte + barba — $350\n💇 Corte + lavado — $300\n💆 Corte + tratamiento — $500\n\n¿Te gustaría agregar algo?", time: "10:34 AM" },
  { from: "client", text: "No, solo el corte. Gracias!", time: "10:34 AM" },
  { from: "zenda", text: "¡Perfecto! Te esperamos hoy a las 3:00 PM. 😊\n\nSi necesitas cambiar tu cita, escríbeme y te ayudo.", time: "10:34 AM" },
];

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-white">
      <Nav variant="simple" />

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pt-16 pb-10 text-center">
        <p className="mb-4 font-semibold text-emerald-600 text-sm uppercase tracking-wide">
          Demo en Vivo
        </p>
        <h1 className="mb-4 font-bold text-3xl text-slate-900 leading-tight md:text-4xl">
          Así funciona Zenda por WhatsApp
        </h1>
        <p className="mx-auto mb-6 max-w-xl text-slate-600">
          Mira cómo un cliente agenda una cita en menos de 2 minutos — sin que nadie del salón toque el teléfono.
        </p>
      </section>

      {/* WhatsApp Chat Simulation */}
      <section className="mx-auto max-w-md px-4 pb-12">
        <div className="overflow-hidden rounded-2xl border border-green-200 bg-green-50 shadow-lg">
          {/* WhatsApp header */}
          <div className="flex items-center gap-3 bg-green-600 px-4 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm text-white">Beauty Studio</p>
              <p className="text-green-100 text-xs">en línea</p>
            </div>
          </div>

          {/* Chat messages */}
          <div className="space-y-2 bg-[#e5ddd5] px-3 py-4" style={{ backgroundImage: "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><rect fill=\"%23e5ddd5\" width=\"100\" height=\"100\"/></svg>')" }}>
            {CHAT_MESSAGES.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.from === "client" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 shadow-sm ${
                    msg.from === "client"
                      ? "rounded-tr-none bg-green-100"
                      : "rounded-tl-none bg-white"
                  }`}
                >
                  <p className="text-sm text-slate-800 whitespace-pre-line">{msg.text}</p>
                  <p className={`mt-1 text-right text-[10px] ${msg.from === "client" ? "text-green-700" : "text-slate-400"}`}>
                    {msg.time} {msg.from === "client" && "✓✓"}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* WhatsApp input bar */}
          <div className="flex items-center gap-2 bg-green-50 px-3 py-2">
            <div className="flex-1 rounded-full bg-white px-4 py-2 text-slate-400 text-sm">
              Escribe un mensaje...
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-600">
              <Zap className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>
        <p className="mt-3 text-center text-slate-400 text-xs">
          Conversación simulada — tu negocio funciona igual que esto
        </p>
      </section>

      {/* What just happened */}
      <section className="bg-slate-50 py-12">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-8 text-center font-bold text-xl text-slate-900">
            Lo que acaba de pasar — en 2 minutos
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: MessageCircle, title: "Cliente escribe", desc: "Un cliente escribe por WhatsApp como siempre." },
              { icon: Smartphone, title: "Zenda responde", desc: "La IA entiende, consulta la agenda y propone horarios." },
              { icon: Check, title: "Cita agendada", desc: "Confirmación automática + recordatorio programado." },
            ].map((step) => (
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-center" key={step.title}>
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                  <step.icon className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="mb-1 font-semibold text-slate-900 text-sm">{step.title}</h3>
                <p className="text-slate-500 text-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-emerald-600 py-12 text-center">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-3 font-bold text-2xl text-white">
            Tu negocio puede hacer esto hoy
          </h2>
          <p className="mb-6 text-emerald-100">
            Conecta tu WhatsApp Business en 5 minutos. Plan gratis disponible.
          </p>
          <Link href="/founding">
            <Button className="rounded-full bg-white px-8 py-3 font-semibold text-base text-emerald-700 hover:bg-emerald-50">
              Probar gratis →
            </Button>
          </Link>
          <p className="mt-4 text-emerald-200 text-xs">
            $0/mes · Sin tarjeta de crédito · Funciona con tu WhatsApp
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}

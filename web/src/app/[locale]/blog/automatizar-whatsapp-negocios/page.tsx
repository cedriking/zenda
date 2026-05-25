import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";

export function generateMetadata(): Metadata {
  return {
    title:
      "Como Automatizar WhatsApp para tu Negocio en 2025 | Guía Completa | Zenda",
    description:
      "Guía paso a paso para automatizar WhatsApp Business en tu salón, clínica o spa. Aprende a configurar respuestas automáticas, agendar citas y reducir ausencias sin conocimientos técnicos.",
    alternates: {
      canonical: "https://zenda.bot/blog/automatizar-whatsapp-negocios",
    },
    openGraph: {
      title: "Como Automatizar WhatsApp para tu Negocio en 2025",
      description:
        "Guía completa para automatizar WhatsApp Business. Respuestas automáticas, citas y recordatorios.",
      url: "https://zenda.bot/blog/automatizar-whatsapp-negocios",
      type: "article",
    },
  };
}

export default function AutomatizarWhatsAppBlogPage() {
  return (
    <div className="min-h-screen bg-white">
      <Nav variant="simple" />

      <article className="mx-auto max-w-3xl px-6 py-16">
        <header className="mb-12">
          <p className="mb-3 font-semibold text-emerald-600 text-sm uppercase tracking-wide">
            Guía Completa 2025
          </p>
          <h1 className="mb-4 font-bold text-3xl text-slate-900 leading-tight md:text-4xl">
            Como Automatizar WhatsApp para tu Negocio en 2025
          </h1>
          <p className="text-slate-500">
            La guía definitiva para automatizar tu WhatsApp Business sin
            complicaciones técnicas.
          </p>
        </header>

        <section className="mb-10">
          <p className="mb-4 text-lg text-slate-700 leading-relaxed">
            Si tu negocio recibe mensajes por WhatsApp — consultas de precios,
            pedidos de hora, preguntas de horario — estás perdiendo tiempo y
            dinero si lo haces todo manualmente.
          </p>
          <p className="mb-4 text-slate-700 leading-relaxed">
            En esta guía te explico <strong>como automatizar WhatsApp</strong>{" "}
            paso a paso, sin necesidad de programar ni contratar a nadie.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            Que significa automatizar WhatsApp
          </h2>
          <p className="mb-4 text-slate-700 leading-relaxed">
            Automatizar WhatsApp significa que un software responde y gestiona
            las conversaciones con tus clientes automáticamente. No es un bot
            genérico — es un asistente entrenado específicamente para tu
            negocio.
          </p>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6">
            <h3 className="mb-3 font-bold text-emerald-900">
              Que puede hacer un WhatsApp automatizado:
            </h3>
            <ul className="space-y-2 text-emerald-800 text-sm">
              <li>
                ✅ Responder consultas de precios y servicios automáticamente
              </li>
              <li>✅ Agendar citas directamente en la conversación</li>
              <li>✅ Enviar recordatorios antes de cada cita</li>
              <li>✅ Confirmar y reagendar cancelaciones</li>
              <li>✅ Contestar fuera de horario laboral</li>
              <li>✅ Gestionar múltiples clientes al mismo tiempo</li>
            </ul>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            Para que tipos de negocios funciona
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <h3 className="mb-2 font-bold text-slate-900">
                Salones de Belleza
              </h3>
              <p className="text-slate-600 text-sm">
                Agendar cortes, tintes, manicura. Recordar al cliente 24h antes.
                Ofrecer hora cuando alguien cancela.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <h3 className="mb-2 font-bold text-slate-900">
                Clínicas Médicas
              </h3>
              <p className="text-slate-600 text-sm">
                Consultas, seguimientos, telemedicina. Reducir ausencias con
                confirmación automática.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <h3 className="mb-2 font-bold text-slate-900">Spas y Masajes</h3>
              <p className="text-slate-600 text-sm">
                Reservas de tratamientos, paquetes, promociones. Disponibilidad
                actualizada en tiempo real.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <h3 className="mb-2 font-bold text-slate-900">Dentistas</h3>
              <p className="text-slate-600 text-sm">
                Limpiezas, urgencias, ortodoncia. Recordatorios y seguimiento
                post-tratamiento.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            Paso a paso: como empezar
          </h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 font-bold text-lg text-white">
                1
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  Descarga Zenda (gratis por 14 días)
                </h3>
                <p className="mt-1 text-slate-600 text-sm leading-relaxed">
                  Descarga la app para Mac o Windows desde zenda.bot. No
                  necesitas tarjeta de crédito para la prueba.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 font-bold text-lg text-white">
                2
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  Conecta tu WhatsApp Business
                </h3>
                <p className="mt-1 text-slate-600 text-sm leading-relaxed">
                  Abre la app, escanea el código QR con tu WhatsApp Business. En
                  30 segundos está conectado. No cambias de número.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 font-bold text-lg text-white">
                3
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  Configura tus servicios y horarios
                </h3>
                <p className="mt-1 text-slate-600 text-sm leading-relaxed">
                  Ingresa los servicios que ofreces (corte, tinte, consulta,
                  etc.), la duración de cada uno y los horarios disponibles.
                  Zenda usa esta información para agendar automáticamente.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 font-bold text-lg text-white">
                4
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Listo</h3>
                <p className="mt-1 text-slate-600 text-sm leading-relaxed">
                  Cuando un cliente escriba por WhatsApp, Zenda responde
                  automáticamente, consulta disponibilidad y agenda la cita. Tu
                  solo ves el calendario actualizado.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            Cuanto vas a ahorrar
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center">
              <div className="mb-2 font-black text-3xl text-emerald-600">
                2h/día
              </div>
              <p className="text-slate-600 text-sm">
                Menos tiempo contestando mensajes
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center">
              <div className="mb-2 font-black text-3xl text-emerald-600">
                40%
              </div>
              <p className="text-slate-600 text-sm">
                Menos ausencias con recordatorios
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center">
              <div className="mb-2 font-black text-3xl text-emerald-600">
                24/7
              </div>
              <p className="text-slate-600 text-sm">Disponibilidad total</p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-6 font-bold text-2xl text-slate-900">
            Preguntas Frecuentes
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900">
                Necesito saber programar?
              </h3>
              <p className="mt-1 text-slate-600 text-sm">
                No. Zenda es una app de escritorio — descargas, conectas tu
                WhatsApp y listo. No hay código ni configuraciones técnicas.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">
                Mis clientes van a saber que es un bot?
              </h3>
              <p className="mt-1 text-slate-600 text-sm">
                Zenda responde de forma natural y conversacional. Tus clientes
                sienten que hablan con una persona atenta y rápida.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">
                Puedo tomar el control cuando quiera?
              </h3>
              <p className="mt-1 text-slate-600 text-sm">
                Si. Siempre puedes responder manualmente desde tu WhatsApp.
                Zenda solo responde cuando tu no lo haces.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">
                Funciona en mi país?
              </h3>
              <p className="mt-1 text-slate-600 text-sm">
                Si. Zenda funciona en cualquier país donde WhatsApp esté
                disponible. Habla 9 idiomas incluyendo español, inglés,
                portugués y francés.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-slate-900 p-8 text-center">
          <h2 className="mb-3 font-bold text-2xl text-white">
            Empieza a automatizar tu WhatsApp hoy
          </h2>
          <p className="mb-6 text-slate-400">
            14 días gratis. Sin tarjeta de crédito. Funciona con tu WhatsApp
            actual.
          </p>
          <Link
            className="inline-block rounded-full bg-emerald-500 px-8 py-3 font-semibold text-white transition-colors hover:bg-emerald-600"
            href="/founding"
          >
            Comenzar prueba gratis
          </Link>
        </section>
      </article>

      <Footer />
    </div>
  );
}

import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const slug = "whatsapp-salon-belleza";

  if (locale !== "es") {
    return {
      title:
        "WhatsApp para Salones de Belleza: Agenda Más Citas y Mantén Tu Silla Ocupada | Zenda",
      description:
        "Cómo los salones de belleza usan WhatsApp para agendar más citas, reducir inasistencias 40% y responder clientes al instante. Guía gratis con configuración en 5 minutos.",
      robots: { index: false, follow: false },
      alternates: {
        canonical: `https://zenda.bot/es/blog/${slug}`,
      },
    };
  }

  return {
    title:
      "WhatsApp para Salones de Belleza: Agenda Más Citas y Mantén Tu Silla Ocupada | Zenda",
    description:
      "Cómo los salones de belleza usan WhatsApp para agendar más citas, reducir inasistencias 40% y responder clientes al instante. Guía gratis con configuración en 5 minutos.",
    alternates: {
      canonical: `https://zenda.bot/${locale}/blog/${slug}`,
      languages: {
        ...Object.fromEntries(
          routing.locales.map((l) => [l, `https://zenda.bot/${l}/blog/${slug}`])
        ),
        "x-default": `https://zenda.bot/en/blog/${slug}`,
      },
    },
    openGraph: {
      title:
        "WhatsApp para Salones de Belleza: Agenda Más Citas y Mantén Tu Silla Ocupada",
      description:
        "Salones de belleza que automatizan WhatsApp llenan 40% más espacios vacíos. Descubre cómo.",
      url: `https://zenda.bot/${locale}/blog/${slug}`,
      type: "article",
    },
  };
}

export default function WhatsAppSalonBellezaBlogPage() {
  return (
    <div className="min-h-screen bg-white">
      <Nav variant="simple" />

      <article className="mx-auto max-w-3xl px-6 py-16">
        <header className="mb-12">
          <p className="mb-3 font-semibold text-emerald-600 text-sm uppercase tracking-wide">
            Para Salones de Belleza
          </p>
          <h1 className="mb-4 font-bold text-3xl text-slate-900 leading-tight md:text-4xl">
            WhatsApp para Salones de Belleza: Agenda Más Citas y Mantén Tu Silla
            Ocupada
          </h1>
          <p className="text-slate-500">
            Cómo automatizar tu salón con WhatsApp para llenar espacios vacíos,
            reducir inasistencias y responder clientes en segundos — no horas.
          </p>
        </header>

        <section className="mb-10">
          <p className="mb-4 text-lg text-slate-700 leading-relaxed">
            Cada dueño de salón conoce la frustración: una clienta reserva una
            sesión de color de 2 horas y no llega. Eso es $800-1,500 MXN de
            ingreso perdido, más la estilista sentada sin hacer nada. Multiplica
            eso por 5-10 inasistencias por semana y estás dejando $20,000-60,000
            MXN sobre la mesa cada mes.
          </p>
          <p className="mb-4 text-slate-700 leading-relaxed">
            Mientras tanto, clientas potenciales te escriben por WhatsApp
            preguntando &quot;¿cuánto cuesta un corte?&quot; y &quot;¿tienes
            disponibilidad mañana?&quot;. Si no respondes en minutos, agendan en
            otro lado.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            El problema con gestionar WhatsApp manualmente
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-slate-200 border-b">
                  <th className="py-3 pr-4 text-left font-semibold text-slate-600">
                    Tarea
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">
                    Manual
                  </th>
                  <th className="py-3 pl-4 text-left font-semibold text-emerald-600">
                    Con Zenda
                  </th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                <tr className="border-slate-100 border-b">
                  <td className="py-3 pr-4 font-medium">
                    Responder &quot;¿cuánto cuesta un corte?&quot;
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    2-5 min por mensaje
                  </td>
                  <td className="py-3 pl-4 font-medium text-emerald-600">
                    Instantáneo, 24/7
                  </td>
                </tr>
                <tr className="border-slate-100 border-b">
                  <td className="py-3 pr-4 font-medium">
                    Ver disponibilidad y agendar
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    Abrir agenda, buscar espacio, confirmar
                  </td>
                  <td className="py-3 pl-4 font-medium text-emerald-600">
                    Se agenda automáticamente
                  </td>
                </tr>
                <tr className="border-slate-100 border-b">
                  <td className="py-3 pr-4 font-medium">
                    Enviar recordatorios de cita
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    Mensajes manuales cada mañana
                  </td>
                  <td className="py-3 pl-4 font-medium text-emerald-600">
                    Automático 24h + 2h antes
                  </td>
                </tr>
                <tr className="border-slate-100 border-b">
                  <td className="py-3 pr-4 font-medium">
                    Llenar cupos cancelados
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    Publicar en stories, rezar
                  </td>
                  <td className="py-3 pl-4 font-medium text-emerald-600">
                    Auto-mensaje a lista de espera
                  </td>
                </tr>
                <tr className="border-slate-100 border-b">
                  <td className="py-3 pr-4 font-medium">
                    Atender consultas fuera de horario
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    Responder al día siguiente (cliente ya se fue)
                  </td>
                  <td className="py-3 pl-4 font-medium text-emerald-600">
                    Respuesta instantánea, agenda cita
                  </td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium">Costo</td>
                  <td className="px-4 py-3 text-slate-500">
                    2+ horas/día de tu tiempo
                  </td>
                  <td className="py-3 pl-4 font-medium text-emerald-600">
                    Desde $29 USD/mes
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            Cuánto ingreso estás perdiendo
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center">
              <div className="mb-2 font-black text-3xl text-emerald-600">
                $6,000
              </div>
              <p className="text-emerald-800 text-sm">
                MXN/mes perdidos por inasistencias (salón pequeño)
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center">
              <div className="mb-2 font-black text-3xl text-emerald-600">
                $12,000
              </div>
              <p className="text-emerald-800 text-sm">
                MXN/mes perdidos por respuestas lentas
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center">
              <div className="mb-2 font-black text-3xl text-emerald-600">
                $9,000
              </div>
              <p className="text-emerald-800 text-sm">
                MXN/mes recuperados con automatización
              </p>
            </div>
          </div>
          <p className="mt-3 text-slate-500 text-xs">
            Basado en salón promedio: 20 citas/semana, $400 MXN valor promedio,
            20% tasa de inasistencia, 40% reducción con recordatorios.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            Lo que Zenda maneja automáticamente
          </h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 font-bold text-lg text-white">
                1
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  Cotizaciones instantáneas
                </h3>
                <p className="mt-1 text-slate-600 text-sm leading-relaxed">
                  Cuando una clienta pregunta &quot;¿cuánto cuesta un
                  balayage?&quot;, Zenda responde al instante con el precio, la
                  duración y los horarios disponibles. Sin perder clientas por
                  respuestas lentas.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 font-bold text-lg text-white">
                2
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  Agendamiento inteligente
                </h3>
                <p className="mt-1 text-slate-600 text-sm leading-relaxed">
                  La clienta dice &quot;necesito un corte y secado esta
                  semana&quot;. Zenda revisa tu disponibilidad en tiempo real y
                  ofrece 3 opciones. La clienta elige una — se agenda
                  automáticamente. Tú lo ves en tu calendario.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 font-bold text-lg text-white">
                3
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  Recordatorios con dos toques
                </h3>
                <p className="mt-1 text-slate-600 text-sm leading-relaxed">
                  24 horas antes: &quot;Hola María, tu cita de color es mañana a
                  las 3pm con Ana. ¿Confirmas?&quot; 2 horas antes: &quot;¡Nos
                  vemos en 2 horas!&quot; Dos recordatorios = 40% menos
                  inasistencias.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 font-bold text-lg text-white">
                4
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  Recuperación de cancelaciones
                </h3>
                <p className="mt-1 text-slate-600 text-sm leading-relaxed">
                  Cuando alguien cancela, Zenda automáticamente escribe a
                  clientas que buscaron ese horario: &quot;Se canceló una cita
                  para el viernes a las 4pm — ¿la quieres?&quot; Los espacios
                  vacíos se llenan solos.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            Servicios que más se benefician
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <h3 className="font-bold text-slate-900">Servicios de cabello</h3>
              <p className="text-slate-600 text-sm">
                Cortes, color, balayage, alisados de keratina — citas de alto
                valor donde las inasistencias duelen más
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <h3 className="font-bold text-slate-900">Servicios de uñas</h3>
              <p className="text-slate-600 text-sm">
                Manicuras, pedicuras, gel, acrílicas — alto volumen, fáciles de
                rellenar cancelaciones
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <h3 className="font-bold text-slate-900">
                Tratamientos faciales
              </h3>
              <p className="text-slate-600 text-sm">
                Faciales, peels, microdermoabrasión — las clientas suelen
                necesitar sesiones de seguimiento, perfecto para reagenda
                automática
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <h3 className="font-bold text-slate-900">Depilación</h3>
              <p className="text-slate-600 text-sm">
                Clientas regulares cada 4-6 semanas — mensajes de recall
                automáticos las mantienen regresando
              </p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            Configuración en 5 minutos
          </h2>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <ol className="space-y-3 text-slate-700">
              <li>
                <strong>Descarga Zenda</strong> — Mac o Windows, 14 días gratis,
                sin tarjeta de crédito
              </li>
              <li>
                <strong>Conecta tu WhatsApp</strong> — escanea el código QR con
                WhatsApp Business, 30 segundos
              </li>
              <li>
                <strong>Agrega tus servicios</strong> — lista los servicios,
                precios y duración de cada uno
              </li>
              <li>
                <strong>Configura tus horarios</strong> — define la
                disponibilidad de cada estilista
              </li>
              <li>
                <strong>Listo</strong> — Zenda empieza a responder clientas,
                agendar citas y enviar recordatorios automáticamente
              </li>
            </ol>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-6 font-bold text-2xl text-slate-900">
            Preguntas frecuentes
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900">
                ¿Mis clientas notarán que es automático?
              </h3>
              <p className="mt-1 text-slate-600 text-sm">
                Zenda responde de forma conversacional y natural. Las clientas
                sienten que están chateando con tu recepción — rápido, útil y
                siempre disponible.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">
                ¿Puedo seguir respondiendo manualmente?
              </h3>
              <p className="mt-1 text-slate-600 text-sm">
                Siempre. Puedes entrar a cualquier conversación en cualquier
                momento. Zenda solo maneja los mensajes cuando no estás
                disponible o no respondes.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">
                ¿Funciona con varias estilistas?
              </h3>
              <p className="mt-1 text-slate-600 text-sm">
                Sí. Configura cada estilista con su propio horario y servicios.
                Las clientas pueden pedir una estilista específica y Zenda
                verifica su disponibilidad.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">¿Cuánto cuesta?</h3>
              <p className="mt-1 text-slate-600 text-sm">
                Desde $29 USD/mes (plan Solo). Con una sola cita de color
                salvada, cubres el costo de todo el mes. 14 días de prueba
                gratuita sin tarjeta de crédito.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-slate-900 p-8 text-center">
          <h2 className="mb-3 font-bold text-2xl text-white">
            Mantén tu silla ocupada esta semana
          </h2>
          <p className="mb-6 text-slate-400">
            14 días gratis. Sin tarjeta de crédito. Funciona con tu WhatsApp
            actual. Configuración en 5 minutos.
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

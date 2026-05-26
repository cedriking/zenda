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
  const slug = "whatsapp-dentista-citas";
  return {
    title:
      "WhatsApp para Dentistas: Reduce Cancelaciones y Llena tu Agenda | Zenda",
    description:
      "Cómo las clínicas dentales usan WhatsApp para reducir cancelaciones 40%, llenar cupos de última hora y captar más pacientes. Guía con calculadora de ROI.",
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
      title: "WhatsApp para Dentistas: Reduce Cancelaciones y Llena tu Agenda",
      description:
        "Clínicas dentales que usan WhatsApp automation reducen cancelaciones 40%. Mira los números.",
      url: `https://zenda.bot/${locale}/blog/${slug}`,
      type: "article",
    },
  };
}

export default function WhatsAppDentistaCitasBlogPage() {
  return (
    <div className="min-h-screen bg-white">
      <Nav variant="simple" />

      <article className="mx-auto max-w-3xl px-6 py-16">
        <header className="mb-12">
          <p className="mb-3 font-semibold text-emerald-600 text-sm uppercase tracking-wide">
            Para Clínicas Dentales
          </p>
          <h1 className="mb-4 font-bold text-3xl text-slate-900 leading-tight md:text-4xl">
            WhatsApp para Dentistas: Reduce Cancelaciones y Llena tu Agenda
          </h1>
          <p className="text-slate-500">
            La guía completa para automatizar tu clínica dental con WhatsApp —
            con números reales, cálculo de ROI y configuración en 5 minutos.
          </p>
        </header>

        <section className="mb-10">
          <p className="mb-4 text-lg text-slate-700 leading-relaxed">
            Las clínicas dentales tienen un problema único de agenda. Las citas
            son largas (30-90 minutos), de alto valor ($1,500-$8,000+ MXN), y
            los pacientes frecuentemente cancelan o no llegan. Una silla vacía
            durante una hora no es solo ingreso perdido — es un recurso
            desperdiciado.
          </p>
          <p className="mb-4 text-slate-700 leading-relaxed">
            La consulta dental promedio pierde{" "}
            <strong>$2,000-4,500 MXN por no-show</strong>. Con tasas de
            inasistencia del 15-25%, eso representa $30,000-75,000 MXN en
            ingresos perdidos mensuales. La automatización por WhatsApp reduce
            eso a la mitad.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            Por qué WhatsApp funciona específicamente para dentistas
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
              <h3 className="mb-2 font-bold text-emerald-900">
                Los pacientes ya te escriben
              </h3>
              <p className="text-emerald-800 text-sm">
                La mayoría de tus pacientes ya te contactan por WhatsApp para
                citas, preguntas sobre procedimientos y seguimientos. Solo estás
                automatizando lo que ya sucede.
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
              <h3 className="mb-2 font-bold text-emerald-900">
                Citas de alto valor
              </h3>
              <p className="text-emerald-800 text-sm">
                Una sola cita salvada (consulta de implante, endodoncia, visita
                ortodóntica) puede valer $3,000-8,000 MXN. Incluso prevenir un
                no-show por semana paga todo el servicio.
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
              <h3 className="mb-2 font-bold text-emerald-900">
                Recall y seguimiento
              </h3>
              <p className="text-emerald-800 text-sm">
                La odontología requiere visitas regulares (limpiezas cada 6
                meses, ajustes ortodónticos mensuales). WhatsApp hace las
                campañas de recall instantáneas y gratis.
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
              <h3 className="mb-2 font-bold text-emerald-900">
                Seguros y programación
              </h3>
              <p className="text-emerald-800 text-sm">
                Los pacientes tienen dudas sobre cobertura del seguro o
                necesitan reprogramar. Las respuestas automáticas las manejan
                24/7 sin tiempo del personal.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            Calculadora de ROI para clínicas dentales
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-slate-200 border-b">
                  <th className="py-3 pr-4 text-left font-semibold text-slate-600">
                    Tamaño de Clínica
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">
                    Citas/Semana
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">
                    Valor Promedio
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">
                    Pérdida Mensual
                  </th>
                  <th className="py-3 pl-4 text-left font-semibold text-emerald-600">
                    Ahorro con Zenda
                  </th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                <tr className="border-slate-100 border-b">
                  <td className="py-3 pr-4 font-medium">Dentista individual</td>
                  <td className="px-4 py-3 text-slate-500">30</td>
                  <td className="px-4 py-3 text-slate-500">$2,000</td>
                  <td className="px-4 py-3 text-slate-500">$36,000</td>
                  <td className="py-3 pl-4 font-medium text-emerald-600">
                    $21,600
                  </td>
                </tr>
                <tr className="border-slate-100 border-b">
                  <td className="py-3 pr-4 font-medium">
                    Clínica pequeña (2 dentistas)
                  </td>
                  <td className="px-4 py-3 text-slate-500">60</td>
                  <td className="px-4 py-3 text-slate-500">$2,500</td>
                  <td className="px-4 py-3 text-slate-500">$90,000</td>
                  <td className="py-3 pl-4 font-medium text-emerald-600">
                    $54,000
                  </td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium">
                    Clínica grande (4+ dentistas)
                  </td>
                  <td className="px-4 py-3 text-slate-500">120</td>
                  <td className="px-4 py-3 text-slate-500">$3,000</td>
                  <td className="px-4 py-3 text-slate-500">$216,000</td>
                  <td className="py-3 pl-4 font-medium text-emerald-600">
                    $129,600
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-slate-500 text-xs">
            Basado en tasa de no-show del 20%, reducción del 40% con
            recordatorios WhatsApp. Cifras mensuales (4.3 semanas). Montos en
            MXN.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            5 formas de usar WhatsApp en tu clínica dental
          </h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 font-bold text-lg text-white">
                1
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  Confirmación automática de citas
                </h3>
                <p className="mt-1 text-slate-600 text-sm leading-relaxed">
                  24 horas antes de cada cita, Zenda envía un WhatsApp con la
                  fecha, hora, procedimiento y nombre del dentista. El paciente
                  toca Confirmar o Reprogramar. Los pacientes confirmados llegan
                  el 95% de las veces.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 font-bold text-lg text-white">
                2
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  Llenado automático de cancelaciones
                </h3>
                <p className="mt-1 text-slate-600 text-sm leading-relaxed">
                  Cuando un paciente cancela, Zenda automáticamente escribe a tu
                  lista de espera: &quot;Tenemos un espacio mañana a las 2pm
                  para una limpieza. ¿Lo quieres?&quot; El primero en responder
                  obtiene el cupo. Cero tiempo de silla vacío.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 font-bold text-lg text-white">
                3
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  Campañas de recall cada 6 meses
                </h3>
                <p className="mt-1 text-slate-600 text-sm leading-relaxed">
                  Mensaje automático 2 semanas antes del recall: &quot;Hola
                  [nombre], es tiempo de tu limpieza semestral. ¿Quieres
                  agendar?&quot; Un toque para reservar — sin llamadas, sin
                  buzones de voz.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 font-bold text-lg text-white">
                4
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  Seguimiento post-tratamiento
                </h3>
                <p className="mt-1 text-slate-600 text-sm leading-relaxed">
                  24 horas después de un procedimiento, Zenda verifica:
                  &quot;¿Cómo te sientes después de tu [procedimiento]? Responde
                  si tienes alguna duda.&quot; Detecta complicaciones temprano y
                  demuestra que te importan tus pacientes.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 font-bold text-lg text-white">
                5
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  Captación de pacientes 24/7
                </h3>
                <p className="mt-1 text-slate-600 text-sm leading-relaxed">
                  Los pacientes nuevos buscan dentistas fuera de horario
                  laboral. Zenda responde sus preguntas, explica servicios y
                  precios, y agenda una consulta — incluso a las 10pm de un
                  domingo. Amaneces con la agenda llena.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            Procedimientos que más se benefician
          </h2>
          <ul className="space-y-3 text-slate-700">
            <li>
              <strong>Limpiezas dentales:</strong> Alto volumen, fáciles de
              rellenar cancelaciones, perfectas para recall automatizado
            </li>
            <li>
              <strong>Ajustes ortodónticos:</strong> Visitas mensuales durante
              12-24 meses — recordatorios automáticos previenen citas perdidas
            </li>
            <li>
              <strong>Endodoncias y extracciones:</strong> Alto valor, los
              pacientes suelen estar nerviosos y cancelar — un recordatorio +
              mensaje de calma ayuda
            </li>
            <li>
              <strong>Consultas de implantes:</strong> Valor de $3,000+ MXN por
              cita. Un no-show evitado paga un mes completo de Zenda
            </li>
            <li>
              <strong>Blanqueamiento dental:</strong> Procedimiento electivo —
              los pacientes necesitan un empujón para confirmar y asistir
            </li>
            <li>
              <strong>Odontopediatría:</strong> Los padres están ocupados; los
              recordatorios automáticos reducen las cancelaciones por &quot;se
              me olvidó&quot;
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            Configuración en 5 minutos
          </h2>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <ol className="space-y-3 text-slate-700">
              <li>
                <strong>Descarga Zenda</strong> — Mac o Windows, 14 días gratis
              </li>
              <li>
                <strong>Conecta tu WhatsApp Business</strong> — escanea el
                código QR en 30 segundos, mantén tu número existente
              </li>
              <li>
                <strong>Agrega tus servicios dentales</strong> — limpiezas,
                consultas, empastes, blanqueamiento, etc. con duración y precio
              </li>
              <li>
                <strong>Configura los horarios</strong> — define las horas de
                cada dentista, pausas y bloques de procedimientos
              </li>
              <li>
                <strong>Activa los recordatorios</strong> — Zenda envía
                automáticamente recordatorios 24h y 2h antes con botones de
                confirmar/reprogramar
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
                ¿Se integra con mi software de gestión dental?
              </h3>
              <p className="mt-1 text-slate-600 text-sm">
                Zenda tiene su propio calendario y sistema de citas integrado.
                Puedes configurar múltiples dentistas, tipos de servicio y
                bloques horarios sin necesitar otro software.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">
                ¿Los datos de mis pacientes están seguros?
              </h3>
              <p className="mt-1 text-slate-600 text-sm">
                Zenda se conecta a tu cuenta de WhatsApp Business y procesa los
                mensajes localmente en tu dispositivo. No hay datos de pacientes
                en servidores externos más allá de lo que WhatsApp ya maneja.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">
                ¿Puedo personalizar los mensajes de recordatorio?
              </h3>
              <p className="mt-1 text-slate-600 text-sm">
                Sí. Zenda aprende de tu negocio y adapta los mensajes a tu tono.
                También puedes configurar mensajes específicos para diferentes
                procedimientos (ej: un mensaje tranquilizador para
                procedimientos que generan ansiedad).
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">¿Cuánto cuesta?</h3>
              <p className="mt-1 text-slate-600 text-sm">
                Desde $29 USD/mes (plan Solo). Con una sola cita de implante
                salvada, cubres el costo de todo el año. 14 días de prueba
                gratuita sin tarjeta de crédito.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-slate-900 p-8 text-center">
          <h2 className="mb-3 font-bold text-2xl text-white">
            Deja de perder ingresos por inasistencias
          </h2>
          <p className="mb-6 text-slate-400">
            14 días gratis. Sin tarjeta de crédito. Funciona con tu WhatsApp
            actual. Una cita salvada paga todo el mes.
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

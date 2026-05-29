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
  const slug = "como-agendar-citas-whatsapp-negocio";

  if (locale !== "es") {
    return {
      title:
        "Cómo Agendar Citas por WhatsApp en tu Negocio (Guía 2025) | Zenda",
      description:
        "Guía paso a paso para agendar citas por WhatsApp automáticamente. Configura en 5 minutos, reduce cancelaciones 40% y aumenta reservas. Para clínicas, salones, spas y más.",
      robots: { index: false, follow: false },
      alternates: {
        canonical: `https://zenda.bot/es/blog/${slug}`,
      },
    };
  }

  return {
    title: "Cómo Agendar Citas por WhatsApp en tu Negocio (Guía 2025) | Zenda",
    description:
      "Guía paso a paso para agendar citas por WhatsApp automáticamente. Configura en 5 minutos, reduce cancelaciones 40% y aumenta reservas. Para clínicas, salones, spas y más.",
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
      title: "Cómo Agendar Citas por WhatsApp en tu Negocio (Guía 2025)",
      description:
        "Guía paso a paso para automatizar citas por WhatsApp. Configura en 5 minutos, reduce cancelaciones 40%.",
      url: `https://zenda.bot/${locale}/blog/${slug}`,
      type: "article",
    },
  };
}

export default function ComoAgendarCitasWhatsAppBlogPage() {
  return (
    <div className="min-h-screen bg-white">
      <Nav variant="simple" />

      <article className="mx-auto max-w-3xl px-6 py-16">
        <header className="mb-12">
          <p className="mb-3 font-semibold text-emerald-600 text-sm uppercase tracking-wide">
            Guía Práctica
          </p>
          <h1 className="mb-4 font-bold text-3xl text-slate-900 leading-tight md:text-4xl">
            Cómo Agendar Citas por WhatsApp en tu Negocio — Guía Completa 2025
          </h1>
          <p className="text-slate-500">
            Paso a paso para automatizar tus citas por WhatsApp. Desde conectar
            tu número hasta recibir reservas automáticamente — sin código, sin
            complicaciones.
          </p>
        </header>

        <section className="mb-10">
          <p className="mb-4 text-lg text-slate-700 leading-relaxed">
            El 95% de tus clientes en Latinoamérica usan WhatsApp. Cuando
            quieren una cita, no llaman — escriben. Si no respondes en 5
            minutos, van a otro negocio. Esta guía te muestra cómo convertir
            WhatsApp en tu mejor recepcionista.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            El problema de agendar citas manualmente
          </h2>
          <p className="mb-4 text-slate-700 leading-relaxed">
            Agendar citas a mano parece simple hasta que calculas el costo real:
          </p>
          <ul className="mb-4 list-inside list-disc space-y-2 text-slate-700">
            <li>
              <strong>15-30 minutos por cita</strong> — intercambiar mensajes,
              verificar horario, confirmar
            </li>
            <li>
              <strong>10-20 citas por día</strong> — son 3-5 horas diarias solo
              en WhatsApp
            </li>
            <li>
              <strong>Mensajes fuera de horario</strong> — te escriben a las
              10pm, 7am, domingos
            </li>
            <li>
              <strong>Errores humanos</strong> — doble reserva, hora equivocada,
              cliente olvidado
            </li>
            <li>
              <strong>20-30% de cancelaciones</strong> — sin recordatorio,
              simplemente no llegan
            </li>
          </ul>
          <p className="text-slate-700 leading-relaxed">
            Si pagas a alguien $8,000-15,000 MXN/mes para agendar, es un gasto
            enorme. Si lo haces tú, es tiempo que no estás atendiendo clientes.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            Método 1: Automatización con IA (recomendado)
          </h2>
          <p className="mb-4 text-slate-700 leading-relaxed">
            La forma más fácil: un recepcionista de IA que conversa con tus
            clientes por WhatsApp y agenda automáticamente.
          </p>
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
            <h3 className="mb-3 font-bold text-emerald-900">
              Cómo funciona con Zenda
            </h3>
            <ol className="list-inside list-decimal space-y-3 text-emerald-800">
              <li>
                <strong>Conectas tu WhatsApp Business</strong> — 2 minutos, sin
                código
              </li>
              <li>
                <strong>Configuras servicios y horarios</strong> — &quot;Corte
                de pelo $200, Lun-Vie 9-18h&quot;
              </li>
              <li>
                <strong>La IA conversa con clientes</strong> — &quot;Hola,
                quiero una cita para corte el viernes&quot;
              </li>
              <li>
                <strong>Verifica disponibilidad</strong> — revisa tu agenda
                automáticamente
              </li>
              <li>
                <strong>Confirma la cita</strong> — &quot;Tu cita es viernes a
                las 3pm. Confirmo?&quot;
              </li>
              <li>
                <strong>Envía recordatorio</strong> — 24h y 2h antes
                automáticamente
              </li>
            </ol>
          </div>
          <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-slate-600 text-sm">
              <strong>Tiempo de setup:</strong> 5 minutos |
              <strong> Costo:</strong> Desde $0 (plan gratis) |
              <strong> Resultado:</strong> Citas automáticas 24/7
            </p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            Método 2: Links de WhatsApp con formulario
          </h2>
          <p className="mb-4 text-slate-700 leading-relaxed">
            Si prefieres algo más simple, puedes crear un link de WhatsApp con
            mensaje prellenado:
          </p>
          <div className="mb-4 overflow-hidden rounded-xl bg-slate-900 p-4">
            <code className="text-emerald-400 text-sm">
              wa.me/5215512345678?text=Hola,%20quiero%20agendar%20una%20cita
            </code>
          </div>
          <p className="mb-4 text-slate-700 leading-relaxed">
            <strong>Limitaciones:</strong> Solo abre el chat — tú o alguien de
            tu equipo debe responder y agendar manualmente. No escala, no
            funciona fuera de horario, y los mensajes se pierden.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            Método 3: WhatsApp Business con catálogo
          </h2>
          <p className="mb-4 text-slate-700 leading-relaxed">
            La app gratuita de WhatsApp Business permite respuestas rápidas y
            etiquetas, pero:
          </p>
          <ul className="list-inside list-disc space-y-2 text-slate-700">
            <li>
              <strong>No agenda automáticamente</strong> — solo organiza
              conversaciones
            </li>
            <li>
              <strong>Solo un dispositivo</strong> — no puedes compartir entre
              empleados
            </li>
            <li>
              <strong>Sin recordatorios automáticos</strong> — debes mandarlos a
              mano
            </li>
            <li>
              <strong>Sin IA</strong> — no puede entender solicitudes de citas
              en lenguaje natural
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            Comparación de métodos
          </h2>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">
                    Característica
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">
                    Manual
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">
                    Link WA
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">
                    WA Business
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-emerald-600">
                    IA (Zenda)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-slate-100 border-t">
                  <td className="px-4 py-3 font-medium text-slate-700">
                    Agendado automático
                  </td>
                  <td className="px-4 py-3 text-slate-400">No</td>
                  <td className="px-4 py-3 text-slate-400">No</td>
                  <td className="px-4 py-3 text-slate-400">No</td>
                  <td className="px-4 py-3 font-medium text-emerald-600">Sí</td>
                </tr>
                <tr className="border-slate-100 border-t">
                  <td className="px-4 py-3 font-medium text-slate-700">
                    Funciona 24/7
                  </td>
                  <td className="px-4 py-3 text-slate-400">No</td>
                  <td className="px-4 py-3 text-slate-400">Sí</td>
                  <td className="px-4 py-3 text-slate-400">No</td>
                  <td className="px-4 py-3 font-medium text-emerald-600">Sí</td>
                </tr>
                <tr className="border-slate-100 border-t">
                  <td className="px-4 py-3 font-medium text-slate-700">
                    Recordatorios
                  </td>
                  <td className="px-4 py-3 text-slate-400">Manual</td>
                  <td className="px-4 py-3 text-slate-400">No</td>
                  <td className="px-4 py-3 text-slate-400">No</td>
                  <td className="px-4 py-3 font-medium text-emerald-600">
                    Automático
                  </td>
                </tr>
                <tr className="border-slate-100 border-t">
                  <td className="px-4 py-3 font-medium text-slate-700">
                    Escala con el negocio
                  </td>
                  <td className="px-4 py-3 text-slate-400">No</td>
                  <td className="px-4 py-3 text-slate-400">Parcial</td>
                  <td className="px-4 py-3 text-slate-400">No</td>
                  <td className="px-4 py-3 font-medium text-emerald-600">Sí</td>
                </tr>
                <tr className="border-slate-100 border-t">
                  <td className="px-4 py-3 font-medium text-slate-700">
                    Costo
                  </td>
                  <td className="px-4 py-3 text-slate-400">Tu tiempo</td>
                  <td className="px-4 py-3 text-slate-400">Gratis</td>
                  <td className="px-4 py-3 text-slate-400">Gratis</td>
                  <td className="px-4 py-3 font-medium text-emerald-600">
                    Desde $0
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            Cuánto dinero pierdes sin automatizar
          </h2>
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <h3 className="mb-3 font-bold text-amber-900">
              Calculadora rápida
            </h3>
            <div className="space-y-2 text-amber-800 text-sm">
              <p>
                • Si cobras $500 por cita y haces 15/día = $7,500/día en citas
              </p>
              <p>• Con 25% de cancelación = pierdes $1,875/día ($37,500/mes)</p>
              <p>
                • Con 10% de clientes que se van por no responder = $750/día
                ($15,000/mes)
              </p>
              <p className="font-bold">
                • Total potencial perdido: $52,500 MXN/mes
              </p>
              <p className="mt-3 font-bold text-emerald-700">
                Con automatización: reduces cancelaciones a 10% y respondes al
                instante. Ahorro estimado: $35,000+ MXN/mes.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            Preguntas frecuentes
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="mb-2 font-semibold text-slate-900">
                Necesito saber programar para automatizar WhatsApp?
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                No. Con Zenda, conectas tu WhatsApp Business en 2 minutos y
                configuras servicios con una interfaz visual. Sin código, sin
                desarrolladores.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-slate-900">
                Funciona con mi número de WhatsApp actual?
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Sí, pero necesitas WhatsApp Business (gratuito). Puedes migrar
                tu número actual a Business en 5 minutos sin perder nada.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-slate-900">
                Los clientes saben que habla una IA?
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                La conversación es tan natural que la mayoría no nota la
                diferencia. Siempre puedes intervenir cuando quieras — tú tienes
                el control.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-slate-900">
                Cuánto cuesta?
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Zenda tiene plan gratis para empezar. Los planes pagos comienzan
                desde $29 USD/mes — menos de lo que pagas por una hora de
                recepcionista.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-10 rounded-2xl bg-emerald-600 p-8 text-center">
          <h2 className="mb-3 font-bold text-2xl text-white">
            Empieza a agendar citas por WhatsApp hoy
          </h2>
          <p className="mb-6 text-emerald-100">
            Configura en 5 minutos. Plan gratis disponible. Sin tarjeta de
            crédito.
          </p>
          <Link href="/founding">
            <button
              className="rounded-full bg-white px-8 py-3 font-semibold text-emerald-700 hover:bg-emerald-50"
              type="button"
            >
              Probar Zenda gratis →
            </button>
          </Link>
        </section>
      </article>

      <Footer />
    </div>
  );
}

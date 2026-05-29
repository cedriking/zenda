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
  const slug = "evitar-cancelaciones-citas-whatsapp";

  if (locale !== "es") {
    return {
      title:
        "Cómo Evitar Cancelaciones de Citas con WhatsApp (Reduce 40%) | Zenda",
      description:
        "Reduce cancelaciones de citas hasta 40% con recordatorios por WhatsApp. Estrategias probadas, plantillas de mensajes y automatización para clínicas, salones y spas.",
      robots: { index: false, follow: false },
      alternates: {
        canonical: `https://zenda.bot/es/blog/${slug}`,
      },
    };
  }

  return {
    title:
      "Cómo Evitar Cancelaciones de Citas con WhatsApp (Reduce 40%) | Zenda",
    description:
      "Reduce cancelaciones de citas hasta 40% con recordatorios por WhatsApp. Estrategias probadas, plantillas de mensajes y automatización para clínicas, salones y spas.",
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
      title: "Cómo Evitar Cancelaciones de Citas con WhatsApp (Reduce 40%)",
      description:
        "Reduce cancelaciones hasta 40% con recordatorios WhatsApp. Estrategias, plantillas y automatización.",
      url: `https://zenda.bot/${locale}/blog/${slug}`,
      type: "article",
    },
  };
}

export default function EvitarCancelacionesWhatsAppBlogPage() {
  return (
    <div className="min-h-screen bg-white">
      <Nav variant="simple" />

      <article className="mx-auto max-w-3xl px-6 py-16">
        <header className="mb-12">
          <p className="mb-3 font-semibold text-emerald-600 text-sm uppercase tracking-wide">
            Reducir Cancelaciones
          </p>
          <h1 className="mb-4 font-bold text-3xl text-slate-900 leading-tight md:text-4xl">
            Cómo Evitar Cancelaciones de Citas con WhatsApp — Reduce hasta 40%
          </h1>
          <p className="text-slate-500">
            Estrategias probadas, plantillas de mensajes y automatización para
            que tus clientes lleguen a sus citas. Funciona para clínicas,
            salones, spas y cualquier negocio basado en citas.
          </p>
        </header>

        <section className="mb-10">
          <p className="mb-4 text-lg text-slate-700 leading-relaxed">
            Las cancelaciones de última hora son el mayor dolor de los negocios
            de citas. Un estudio de la AMA encontró que el promedio de
            cancelaciones es del 23%. En algunos sectores como salud dental,
            llega al 35%. Pero hay una solución simple que reduce cancelaciones
            hasta 40%: recordatorios por WhatsApp.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            Cuánto te cuestan las cancelaciones
          </h2>
          <div className="mb-6 overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">
                    Negocio
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">
                    Cancelación promedio
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">
                    Pérdida mensual estimada
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-slate-100 border-t">
                  <td className="px-4 py-3 text-slate-700">Clínica dental</td>
                  <td className="px-4 py-3 text-slate-600">30-35%</td>
                  <td className="px-4 py-3 font-medium text-red-600">
                    $25,000-50,000 MXN
                  </td>
                </tr>
                <tr className="border-slate-100 border-t">
                  <td className="px-4 py-3 text-slate-700">Salón de belleza</td>
                  <td className="px-4 py-3 text-slate-600">20-25%</td>
                  <td className="px-4 py-3 font-medium text-red-600">
                    $10,000-25,000 MXN
                  </td>
                </tr>
                <tr className="border-slate-100 border-t">
                  <td className="px-4 py-3 text-slate-700">Spa</td>
                  <td className="px-4 py-3 text-slate-600">25-30%</td>
                  <td className="px-4 py-3 font-medium text-red-600">
                    $15,000-35,000 MXN
                  </td>
                </tr>
                <tr className="border-slate-100 border-t">
                  <td className="px-4 py-3 text-slate-700">Veterinaria</td>
                  <td className="px-4 py-3 text-slate-600">15-20%</td>
                  <td className="px-4 py-3 font-medium text-red-600">
                    $8,000-18,000 MXN
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            5 estrategias probadas para reducir cancelaciones
          </h2>

          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
            <h3 className="mb-2 font-bold text-emerald-900">
              1. Recordatorio 24 horas antes (el más efectivo)
            </h3>
            <p className="mb-3 text-emerald-800 text-sm">
              Un simple mensaje 24h antes reduce cancelaciones 29%. Las personas
              olvidan citas — no es mala intención.
            </p>
            <div className="rounded-lg bg-white p-3 text-slate-700 text-sm">
              <p className="italic">
                &quot;Hola [nombre]! Te recordamos tu cita de [servicio] mañana
                a las [hora]. Para confirmar, reponde SÍ. Para reprogramar,
                responde con la nueva fecha. ¡Te esperamos! 🙏&quot;
              </p>
            </div>
          </div>

          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
            <h3 className="mb-2 font-bold text-emerald-900">
              2. Recordatorio 2 horas antes (catch los olvidadizos)
            </h3>
            <p className="mb-3 text-emerald-800 text-sm">
              Para citas de alto valor (dental, spa premium), un segundo
              recordatorio 2h antes salva otra 8-12% de cancelaciones.
            </p>
            <div className="rounded-lg bg-white p-3 text-slate-700 text-sm">
              <p className="italic">
                &quot;[Nombre], tu cita de [servicio] es en 2 horas ([hora]).
                Estamos en [dirección]. Si necesitas cancelar, avísanos para
                ofrecer el horario a alguien más. ¡Nos vemos! 😊&quot;
              </p>
            </div>
          </div>

          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
            <h3 className="mb-2 font-bold text-emerald-900">
              3. Política de cancelación clara (reduce las &quot;casuales&quot;)
            </h3>
            <p className="mb-3 text-emerald-800 text-sm">
              Cuando los clientes saben que hay una política de cancelación,
              piensan dos veces antes de no llegar. No necesita ser punitiva —
              solo clara.
            </p>
            <div className="rounded-lg bg-white p-3 text-slate-700 text-sm">
              <p className="italic">
                &quot;Agradecemos que nos avises con al menos 4 horas de
                anticipación si necesitas cancelar o reprogramar. Así podemos
                ofrecer tu horario a otro cliente que lo necesita. 🤝&quot;
              </p>
            </div>
          </div>

          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
            <h3 className="mb-2 font-bold text-emerald-900">
              4. Lista de espera automática (recupera citas canceladas)
            </h3>
            <p className="mb-3 text-emerald-800 text-sm">
              Cuando alguien cancela, automáticamente avisa al siguiente en
              espera. Un negocio dental recuperó 60% de citas canceladas así.
            </p>
          </div>

          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
            <h3 className="mb-2 font-bold text-emerald-900">
              5. Confirmación bidireccional (filtro adicional)
            </h3>
            <p className="mb-3 text-emerald-800 text-sm">
              Pedir confirmación activa (responde SÍ/NO) identifica quienes
              realmente van a venir. Los que no responden son candidatos para
              reprogramar.
            </p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            Automatización vs manual
          </h2>
          <p className="mb-4 text-slate-700 leading-relaxed">
            Puedes mandar recordatorios manualmente, pero para 20+ citas por día
            es imposible. La automatización por WhatsApp lo hace sin esfuerzo:
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <h3 className="mb-2 font-bold text-red-900">Manual</h3>
              <ul className="list-inside list-disc space-y-1 text-red-800 text-sm">
                <li>30+ minutos diarios en recordatorios</li>
                <li>Olvidos y errores</li>
                <li>No escala</li>
                <li>Cuesta tu tiempo o el de un empleado</li>
              </ul>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <h3 className="mb-2 font-bold text-emerald-900">
                Automatizado (Zenda)
              </h3>
              <ul className="list-inside list-disc space-y-1 text-emerald-800 text-sm">
                <li>Configuras una vez, funciona siempre</li>
                <li>Recordatorios 24h y 2h automáticos</li>
                <li>Escala ilimitada</li>
                <li>Desde $0/mes</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            Resultados reales
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 p-5 text-center">
              <p className="font-bold text-3xl text-emerald-600">-40%</p>
              <p className="mt-1 text-slate-500 text-sm">
                Reducción en cancelaciones con recordatorios WhatsApp
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 p-5 text-center">
              <p className="font-bold text-3xl text-emerald-600">98%</p>
              <p className="mt-1 text-slate-500 text-sm">
                Tasa de lectura de mensajes WhatsApp (vs 20% email)
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 p-5 text-center">
              <p className="font-bold text-3xl text-emerald-600">5 min</p>
              <p className="mt-1 text-slate-500 text-sm">
                Configuración completa para empezar a reducir cancelaciones
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
                Por qué WhatsApp y no SMS o email?
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                WhatsApp tiene 98% de tasa de apertura en LATAM vs 20% de email
                y 45% de SMS. Además, tus clientes ya usan WhatsApp — no
                necesitan instalar nada nuevo.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-slate-900">
                Es legal mandar recordatorios por WhatsApp?
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Sí, siempre que el cliente haya agendado contigo. Es información
                de servicio, no publicidad no solicitada. Zenda cumple con las
                políticas de WhatsApp Business.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-slate-900">
                Cuántos recordatorios debo enviar?
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                El sweet spot es 2: uno 24h antes y otro 2h antes. Más de eso
                puede ser molesto. Menos de eso no es suficiente para citas de
                alto valor.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-slate-900">
                Funciona para cualquier tipo de negocio?
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Sí. Clínicas dentales, salones, spas, veterinarias, talleres
                mecánicos, gimnasios, consultorios — cualquier negocio basado en
                citas se beneficia de recordatorios WhatsApp.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-10 rounded-2xl bg-emerald-600 p-8 text-center">
          <h2 className="mb-3 font-bold text-2xl text-white">
            Reduce tus cancelaciones hoy
          </h2>
          <p className="mb-6 text-emerald-100">
            Configura recordatorios automáticos por WhatsApp en 5 minutos. Plan
            gratis disponible.
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

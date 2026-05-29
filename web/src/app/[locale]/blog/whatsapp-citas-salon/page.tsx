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
  const slug = "whatsapp-citas-salon";

  if (locale !== "es") {
    return {
      title:
        "Como Usar WhatsApp para Agendar Citas en tu Salón de Belleza | Zenda",
      description:
        "Guía completa para automatizar citas por WhatsApp en salones, clínicas y spas. Reduce ausencias, ahorra tiempo y consigue más clientes con un recepcionista AI.",
      robots: { index: false, follow: false },
      alternates: {
        canonical: `https://zenda.bot/es/blog/${slug}`,
      },
    };
  }

  return {
    title:
      "Como Usar WhatsApp para Agendar Citas en tu Salón de Belleza | Zenda",
    description:
      "Guía completa para automatizar citas por WhatsApp en salones, clínicas y spas. Reduce ausencias, ahorra tiempo y consigue más clientes con un recepcionista AI.",
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
      title: "Como Usar WhatsApp para Agendar Citas en tu Salón de Belleza",
      description:
        "Guía completa para automatizar citas por WhatsApp. Reduce ausencias y ahorra tiempo.",
      url: `https://zenda.bot/${locale}/blog/${slug}`,
      type: "article",
    },
  };
}

export default function WhatsAppCitasBlogPage() {
  return (
    <div className="min-h-screen bg-white">
      <Nav variant="simple" />

      <article className="mx-auto max-w-3xl px-6 py-16">
        {/* Header */}
        <header className="mb-12">
          <p className="mb-3 font-semibold text-emerald-600 text-sm uppercase tracking-wide">
            Guía para Negocios
          </p>
          <h1 className="mb-4 font-bold text-3xl text-slate-900 leading-tight md:text-4xl">
            Como Usar WhatsApp para Agendar Citas en tu Salón de Belleza
          </h1>
          <p className="text-slate-500">
            Guía completa para automatizar tus citas por WhatsApp y nunca más
            perder un cliente.
          </p>
        </header>

        {/* Intro */}
        <section className="mb-10">
          <p className="mb-4 text-lg text-slate-700 leading-relaxed">
            El 90% de tus clientes prefieren agendar por WhatsApp. Pero
            contestar mensaje por mensaje te quita horas al día, y si no
            respondes rápido, el cliente se va con la competencia.
          </p>
          <p className="mb-4 text-slate-700 leading-relaxed">
            En esta guía te explico como automatizar tus citas por WhatsApp sin
            perder el toque personal, para que tu salon este disponible 24/7 sin
            que tu levantes un dedo.
          </p>
        </section>

        {/* Why WhatsApp */}
        <section className="mb-10">
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            Por que WhatsApp es el mejor canal para tus citas
          </h2>
          <ul className="space-y-3 text-slate-700">
            <li className="flex gap-3">
              <span className="mt-1 flex-shrink-0 font-bold text-emerald-500">
                +
              </span>
              <div>
                <strong>Tus clientes ya lo usan.</strong> No necesitan descargar
                nada nuevo ni crear cuentas. Solo mandan un mensaje y listo.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="mt-1 flex-shrink-0 font-bold text-emerald-500">
                +
              </span>
              <div>
                <strong>Respuesta inmediata.</strong> El 70% de los clientes
                esperan respuesta en menos de 5 minutos. Si no contestas, se
                van.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="mt-1 flex-shrink-0 font-bold text-emerald-500">
                +
              </span>
              <div>
                <strong>Confirmación automatica.</strong> Envía recordatorios y
                confirmaciones sin esfuerzo manual.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="mt-1 flex-shrink-0 font-bold text-emerald-500">
                +
              </span>
              <div>
                <strong>Cero comisión.</strong> A diferencia de plataformas como
                Uber o Booking, WhatsApp no te cobra por cada reserva.
              </div>
            </li>
          </ul>
        </section>

        {/* Manual vs Automatic */}
        <section className="mb-10">
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            Manual vs. Automatico: La diferencia
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
                    Con Zenda AI
                  </th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                <tr className="border-slate-100 border-b">
                  <td className="py-3 pr-4 font-medium">
                    Responder &quot;Tienen hora?&quot;
                  </td>
                  <td className="px-4 py-3 text-slate-500">2-5 min</td>
                  <td className="py-3 pl-4 font-medium text-emerald-600">
                    Instantáneo
                  </td>
                </tr>
                <tr className="border-slate-100 border-b">
                  <td className="py-3 pr-4 font-medium">Agendar cita</td>
                  <td className="px-4 py-3 text-slate-500">
                    Abrir calendario, buscar hora
                  </td>
                  <td className="py-3 pl-4 font-medium text-emerald-600">
                    Automático
                  </td>
                </tr>
                <tr className="border-slate-100 border-b">
                  <td className="py-3 pr-4 font-medium">Recordar al cliente</td>
                  <td className="px-4 py-3 text-slate-500">
                    Mensaje manual por la mañana
                  </td>
                  <td className="py-3 pl-4 font-medium text-emerald-600">
                    Auto 24h antes
                  </td>
                </tr>
                <tr className="border-slate-100 border-b">
                  <td className="py-3 pr-4 font-medium">
                    Reagendar cancelación
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    Esperar a que alguien más pida hora
                  </td>
                  <td className="py-3 pl-4 font-medium text-emerald-600">
                    Ofrecer hora automáticamente
                  </td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium">Disponibilidad</td>
                  <td className="px-4 py-3 text-slate-500">
                    Horario de atención
                  </td>
                  <td className="py-3 pl-4 font-medium text-emerald-600">
                    24/7
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* How to start */}
        <section className="mb-10">
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            Como empezar en 3 pasos
          </h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 font-bold text-lg text-white">
                1
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Descarga Zenda</h3>
                <p className="mt-1 text-slate-600 text-sm leading-relaxed">
                  Descarga la app para Mac o Windows. Es gratis por 14 días, sin
                  tarjeta de crédito.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 font-bold text-lg text-white">
                2
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  Conecta tu WhatsApp
                </h3>
                <p className="mt-1 text-slate-600 text-sm leading-relaxed">
                  Escanea el código QR con tu WhatsApp Business. Zenda se
                  conecta directamente, sin cambiar tu número.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 font-bold text-lg text-white">
                3
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  Zenda hace el resto
                </h3>
                <p className="mt-1 text-slate-600 text-sm leading-relaxed">
                  Cuando un cliente escribe pidiendo hora, Zenda responde
                  automáticamente, consulta tu disponibilidad y agenda la cita.
                  Tu solo revisas el calendario.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Results */}
        <section className="mb-10">
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            Resultados que puedes esperar
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center">
              <div className="mb-2 font-black text-3xl text-emerald-600">
                40%
              </div>
              <p className="text-slate-600 text-sm">
                Menos ausencias con recordatorios automáticos
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center">
              <div className="mb-2 font-black text-3xl text-emerald-600">
                2h+
              </div>
              <p className="text-slate-600 text-sm">
                Ahorro diario en gestión de citas
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center">
              <div className="mb-2 font-black text-3xl text-emerald-600">
                24/7
              </div>
              <p className="text-slate-600 text-sm">
                Disponibilidad para tus clientes
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-10">
          <h2 className="mb-6 font-bold text-2xl text-slate-900">
            Preguntas Frecuentes
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900">
                Necesito cambiar mi número de WhatsApp?
              </h3>
              <p className="mt-1 text-slate-600 text-sm">
                No. Zenda se conecta a tu WhatsApp Business existente. No
                necesitas un número nuevo ni cambiar nada.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">
                Mis clientes notaran que es un bot?
              </h3>
              <p className="mt-1 text-slate-600 text-sm">
                Zenda responde de forma natural y conversacional. Tus clientes
                sienten que hablan con una persona atenta y rápida.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Cuanto cuesta?</h3>
              <p className="mt-1 text-slate-600 text-sm">
                Desde $29 USD/mes con 14 días gratis. Sin tarjeta de crédito
                para empezar. Los clientes fundadores obtienen 50% de descuento
                los primeros 3 meses.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">
                Funciona para clínicas y spas tambien?
              </h3>
              <p className="mt-1 text-slate-600 text-sm">
                Si. Zenda funciona para cualquier negocio basado en citas:
                salones de belleza, spas, clínicas médicas, dentistas, barberos,
                y más.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-2xl bg-slate-900 p-8 text-center">
          <h2 className="mb-3 font-bold text-2xl text-white">
            Empieza a automatizar tus citas hoy
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

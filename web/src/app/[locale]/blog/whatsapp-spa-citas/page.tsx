import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { routing } from "@/i18n/routing";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const slug = "whatsapp-spa-citas";
  return {
    title:
      "WhatsApp para Spas: Automatiza Citas y Aumenta tus Ingresos | Zenda",
    description:
      "Cómo los spas usan WhatsApp para automatizar reservas, reducir cancelaciones 40% y aumentar ingresos. Guía con calculadora de ROI y configuración en 5 minutos.",
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
      title: "WhatsApp para Spas: Automatiza Citas y Aumenta tus Ingresos",
      description:
        "Spas que automatizan WhatsApp reducen cancelaciones 40% y aumentan reservas. Descubre cómo.",
      url: `https://zenda.bot/${locale}/blog/${slug}`,
      type: "article",
    },
  };
}

export default function WhatsAppSpaCitasBlogPage() {
  return (
    <div className="min-h-screen bg-white">
      <Nav variant="simple" />

      <article className="mx-auto max-w-3xl px-6 py-16">
        <header className="mb-12">
          <p className="mb-3 font-semibold text-emerald-600 text-sm uppercase tracking-wide">
            Para Spas y Centros de Bienestar
          </p>
          <h1 className="mb-4 font-bold text-3xl text-slate-900 leading-tight md:text-4xl">
            WhatsApp para Spas: Automatiza Citas y Aumenta tus Ingresos
          </h1>
          <p className="text-slate-500">
            Cómo los spas y centros de bienestar usan WhatsApp para llenar su
            agenda, reducir cancelaciones y fidelizar clientes — con ROI
            calculado y configuración en 5 minutos.
          </p>
        </header>

        <section className="mb-10">
          <p className="mb-4 text-lg text-slate-700 leading-relaxed">
            Los spas tienen un problema costoso: las cancelaciones de última
            hora. Un masaje de 60 minutos cancelado son $500-1,200 MXN perdidos,
            más el terapeuta sin trabajar. Con tasas de cancelación del 20-30%,
            los spas pierden $15,000-40,000 MXN mensuales.
          </p>
          <p className="mb-4 text-slate-700 leading-relaxed">
            Mientras tanto, clientes potenciales te escriben a las 9pm
            preguntando &quot;¿tienen disponibilidad para un facial
            mañana?&quot; Si no respondes al instante, reservan en otro spa.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            Por qué WhatsApp funciona para spas
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
              <h3 className="mb-2 font-bold text-emerald-900">
                Citas de alto valor
              </h3>
              <p className="text-emerald-800 text-sm">
                Los tratamientos de spa cuestan $500-2,500 MXN. Una sola cita
                salvada de un paquete premium paga semanas de servicio.
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
              <h3 className="mb-2 font-bold text-emerald-900">
                Clientas que repiten
              </h3>
              <p className="text-emerald-800 text-sm">
                Las clientas de spa vuelven cada 2-4 semanas. Mensajes de recall
                automáticos las mantienen regresando sin que tengas que llamar.
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
              <h3 className="mb-2 font-bold text-emerald-900">
                Venta cruzada de tratamientos
              </h3>
              <p className="text-emerald-800 text-sm">
                &quot;Después de tu facial, ¿te gustaría agregar un masaje
                relajante por solo $200 más?&quot; WhatsApp facilita el upsell
                automático.
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
              <h3 className="mb-2 font-bold text-emerald-900">
                Temporadas y promociones
              </h3>
              <p className="text-emerald-800 text-sm">
                Campañas de Día de la Madre, San Valentín, fin de año — envía
                promociones por WhatsApp a toda tu base de clientes en segundos.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            Cuánto gana tu spa con automatización
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-slate-200 border-b">
                  <th className="py-3 pr-4 text-left font-semibold text-slate-600">
                    Tamaño del Spa
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">
                    Citas/Semana
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">
                    Ticket Promedio
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
                  <td className="py-3 pr-4 font-medium">
                    Spa pequeño (2 cabinas)
                  </td>
                  <td className="px-4 py-3 text-slate-500">20</td>
                  <td className="px-4 py-3 text-slate-500">$700</td>
                  <td className="px-4 py-3 text-slate-500">$12,040</td>
                  <td className="py-3 pl-4 font-medium text-emerald-600">
                    $7,224
                  </td>
                </tr>
                <tr className="border-slate-100 border-b">
                  <td className="py-3 pr-4 font-medium">
                    Spa mediano (4 cabinas)
                  </td>
                  <td className="px-4 py-3 text-slate-500">45</td>
                  <td className="px-4 py-3 text-slate-500">$900</td>
                  <td className="px-4 py-3 text-slate-500">$34,830</td>
                  <td className="py-3 pl-4 font-medium text-emerald-600">
                    $20,898
                  </td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium">
                    Spa grande (6+ cabinas)
                  </td>
                  <td className="px-4 py-3 text-slate-500">80</td>
                  <td className="px-4 py-3 text-slate-500">$1,100</td>
                  <td className="px-4 py-3 text-slate-500">$75,680</td>
                  <td className="py-3 pl-4 font-medium text-emerald-600">
                    $45,408
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-slate-500 text-xs">
            Basado en 25% tasa de cancelación, 40% reducción con WhatsApp.
            Cifras mensuales (4.3 semanas). Montos en MXN.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            5 automatizaciones esenciales para spas
          </h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 font-bold text-lg text-white">
                1
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  Reserva automática 24/7
                </h3>
                <p className="mt-1 text-slate-600 text-sm leading-relaxed">
                  La clienta escribe &quot;quiero un masaje relajante este
                  sábado&quot;. Zenda verifica disponibilidad, muestra opciones
                  y confirma la reserva — todo automáticamente, incluso a
                  medianoche.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 font-bold text-lg text-white">
                2
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  Confirmación y recordatorios
                </h3>
                <p className="mt-1 text-slate-600 text-sm leading-relaxed">
                  24 horas antes: &quot;Hola Laura, tu facial hidratante es
                  mañana a las 11am. ¿Confirmas?&quot; 2 horas antes: un toque
                  final. Dos recordatorios reducen cancelaciones 40%.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 font-bold text-lg text-white">
                3
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  Llenado de cancelaciones
                </h3>
                <p className="mt-1 text-slate-600 text-sm leading-relaxed">
                  Alguien cancela y Zenda escribe a tu lista de espera: &quot;Se
                  liberó un espacio para body scrub el viernes a las 3pm. ¿Lo
                  quieres?&quot; La primera en responder lo obtiene.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 font-bold text-lg text-white">
                4
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Upsell de paquetes</h3>
                <p className="mt-1 text-slate-600 text-sm leading-relaxed">
                  Al confirmar una cita: &quot;¿Sabías que agregando un masaje
                  de pies a tu facial obtienes 15% de descuento en el
                  paquete?&quot; Aumenta el ticket promedio automáticamente.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 font-bold text-lg text-white">
                5
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  Campañas de fidelización
                </h3>
                <p className="mt-1 text-slate-600 text-sm leading-relaxed">
                  Clientas que no visitan en 30 días reciben: &quot;Te
                  extrañamos. Ten un 20% de descuento en tu próximo tratamiento.
                  ¿Cuándo te gustaría venir?&quot; Reactiva clientas inactivas
                  automáticamente.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            Tratamientos que más se benefician
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <h3 className="font-bold text-slate-900">Masajes terapéuticos</h3>
              <p className="text-slate-600 text-sm">
                Alto valor, alta demanda. Las cancelaciones duerten más. Los
                recordatorios las reducen drásticamente.
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <h3 className="font-bold text-slate-900">
                Faciales y tratamientos faciales
              </h3>
              <p className="text-slate-600 text-sm">
                Requieren sesiones múltiples. La reagenda automática mantiene el
                ciclo de tratamiento completo.
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <h3 className="font-bold text-slate-900">
                Paquetes de día de spa
              </h3>
              <p className="text-slate-600 text-sm">
                Tickets de $2,000+ MXN. Una cancelación evitada paga meses del
                servicio.
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <h3 className="font-bold text-slate-900">
                Tratamientos corporales
              </h3>
              <p className="text-slate-600 text-sm">
                Exfoliaciones, envolturas, drenaje linfático — clientas
                regulares que regresan con mensajes de recall.
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
                <strong>Descarga Zenda</strong> — Mac o Windows, 14 días gratis
              </li>
              <li>
                <strong>Conecta tu WhatsApp Business</strong> — escanea QR en 30
                segundos
              </li>
              <li>
                <strong>Agrega tus tratamientos</strong> — lista servicios,
                duración y precios
              </li>
              <li>
                <strong>Configura tus terapeutas</strong> — horarios y
                especialidades de cada uno
              </li>
              <li>
                <strong>Activa recordatorios</strong> — Zenda empieza a
                confirmar citas y llenar cancelaciones
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
                ¿Mis clientas notarán que es un bot?
              </h3>
              <p className="mt-1 text-slate-600 text-sm">
                Zenda responde de forma natural y conversacional. Las clientas
                sienten que hablan con tu recepción — rápida, amable y siempre
                disponible.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">
                ¿Puedo enviar promociones por WhatsApp?
              </h3>
              <p className="mt-1 text-slate-600 text-sm">
                Sí. Configura campañas para fechas especiales (Día de la Madre,
                San Valentín) o para reactivar clientas inactivas. Todo
                automatizado desde Zenda.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">
                ¿Funciona con múltiples terapeutas?
              </h3>
              <p className="mt-1 text-slate-600 text-sm">
                Sí. Cada terapeuta con su horario y especialidades. Las clientas
                pueden pedir un terapeuta específico.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">¿Cuánto cuesta?</h3>
              <p className="mt-1 text-slate-600 text-sm">
                Desde $29 USD/mes (plan Solo). Un solo paquete de spa salvado
                paga todo el año. 14 días gratis sin tarjeta de crédito.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-slate-900 p-8 text-center">
          <h2 className="mb-3 font-bold text-2xl text-white">
            Llena cada cabina, cada día
          </h2>
          <p className="mb-6 text-slate-400">
            14 días gratis. Sin tarjeta de crédito. Funciona con tu WhatsApp
            actual. Un solo tratamiento salvado paga el mes.
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

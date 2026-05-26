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
  const slug = "whatsapp-lavado-auto-detailing";
  return {
    title:
      "Citas por WhatsApp para Auto Detailing y Car Wash | Automatiza con Zenda",
    description:
      "Automatiza las citas de tu negocio de lavado de autos y detailing por WhatsApp. Agenda servicios, coordina entregas y envía recordatorios.",
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
      title: "Auto Detailing y Car Wash por WhatsApp | Zenda",
      description:
        "Agenda lavados, detailing y pulidos automáticamente por WhatsApp. Recepcionista virtual para auto care.",
      url: `https://zenda.bot/${locale}/blog/${slug}`,
      siteName: "Zenda",
      type: "article",
      locale: locale === "es" ? "es_MX" : "en_US",
    },
  };
}

export default function BlogLavadoAuto() {
  return (
    <>
      <Nav />
      <article className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="mb-4 font-bold text-3xl text-slate-900 tracking-tight sm:text-4xl">
          Cómo Agendar Citas por WhatsApp para Auto Detailing y Car Wash (Guía
          2025)
        </h1>
        <p className="mb-8 text-lg text-slate-600">
          Los dueños de autos quieren agendar su lavado o detailing cuando
          tienen tiempo, no cuando tú puedes contestar. Automatiza por WhatsApp
          y captura más clientes.
        </p>

        <section className="mb-10">
          <h2 className="mb-3 font-semibold text-2xl text-slate-900">
            ¿Por qué tu negocio de auto care necesita WhatsApp automatizado?
          </h2>
          <p className="mb-4 text-slate-700 leading-relaxed">
            El cliente quiere su auto limpio para el fin de semana. Te escribe
            el jueves a las 9pm para agendar un detailing completo para el
            viernes. Si no contestas hasta mañana, ya buscó otro lugar.
          </p>
          <ul className="mb-4 list-disc space-y-2 pl-6 text-slate-700">
            <li>
              <strong>40% más servicios agendados</strong> — captura demanda
              fuera de horario
            </li>
            <li>
              <strong>Cero confusiones</strong> — el cliente sabe exactamente
              qué servicio agendó y a qué hora
            </li>
            <li>
              <strong>35% menos no-shows</strong> — recordatorios automáticos
            </li>
            <li>
              <strong>Más upsells</strong> — "¿Quieres agregar encerado por solo
              $200 más?"
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 font-semibold text-2xl text-slate-900">
            Los problemas de agendar manualmente
          </h2>
          <ul className="mb-4 list-disc space-y-2 pl-6 text-slate-700">
            <li>
              <strong>Estás lavando un auto y no contestas</strong> — las manos
              mojadas no usan celular
            </li>
            <li>
              <strong>El cliente no sabe la diferencia de servicios</strong> —
              pide "lavado completo" pero quería detailing
            </li>
            <li>
              <strong>Horarios que se empalman</strong> — aceptas 3 autos a la
              misma hora
            </li>
            <li>
              <strong>No avisas cuando está listo</strong> — el cliente llama a
              cada rato preguntando
            </li>
            <li>
              <strong>Precios confusos</strong> — "¿cuánto sale el pulido de mi
              Jetta 2020?"
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 font-semibold text-2xl text-slate-900">
            Cómo funciona Zenda para auto detailing
          </h2>
          <ol className="mb-4 list-decimal space-y-3 pl-6 text-slate-700">
            <li>
              <strong>El cliente manda mensaje</strong> — "Hola, quiero un
              detailing para mi auto"
            </li>
            <li>
              <strong>Zenda muestra los servicios</strong> — lavado básico,
              completo, detailing interior, exterior, pulido, cerámica
            </li>
            <li>
              <strong>Pregunta el tipo de vehículo</strong> — sedan, SUV,
              camioneta, deportivo (afecta precio y tiempo)
            </li>
            <li>
              <strong>Muestra precios y duración</strong> — "Detailing completo
              sedan: $2,500, 4 horas"
            </li>
            <li>
              <strong>Agenda la cita</strong> — el cliente elige fecha y hora
            </li>
            <li>
              <strong>Aviso de auto listo</strong> — "Tu auto está listo. Puedes
              pasar a recogerlo."
            </li>
            <li>
              <strong>Seguimiento</strong> — "Para mantener el brillo del
              pulido, evita estacionarte bajo árboles. ¿Te gustaría agendar tu
              próximo lavado en 2 semanas?"
            </li>
          </ol>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 font-semibold text-2xl text-slate-900">
            Servicios que puedes agendar
          </h2>
          <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-white p-3">
                <p className="font-medium text-slate-900">Lavado básico</p>
                <p className="text-slate-600 text-sm">20-30 min</p>
              </div>
              <div className="rounded-lg bg-white p-3">
                <p className="font-medium text-slate-900">Lavado completo</p>
                <p className="text-slate-600 text-sm">45-60 min</p>
              </div>
              <div className="rounded-lg bg-white p-3">
                <p className="font-medium text-slate-900">Detailing interior</p>
                <p className="text-slate-600 text-sm">2-3 horas</p>
              </div>
              <div className="rounded-lg bg-white p-3">
                <p className="font-medium text-slate-900">Detailing exterior</p>
                <p className="text-slate-600 text-sm">2-3 horas</p>
              </div>
              <div className="rounded-lg bg-white p-3">
                <p className="font-medium text-slate-900">Detailing completo</p>
                <p className="text-slate-600 text-sm">4-6 horas</p>
              </div>
              <div className="rounded-lg bg-white p-3">
                <p className="font-medium text-slate-900">Pulido + Encerado</p>
                <p className="text-slate-600 text-sm">3-5 horas</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 font-semibold text-2xl text-slate-900">
            Funcionalidades especiales para auto care
          </h2>
          <div className="space-y-4">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <h3 className="font-medium text-green-900">
                Precios por tipo de vehículo
              </h3>
              <p className="mt-1 text-green-800 text-sm">
                El precio cambia según el tamaño del auto. Zenda pregunta el
                tipo de vehículo y muestra el precio correcto automáticamente.
                Sedan: $1,500. SUV: $1,800. Camioneta: $2,200. Sin explicarle a
                cada cliente.
              </p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <h3 className="font-medium text-amber-900">Upsell automático</h3>
              <p className="mt-1 text-amber-800 text-sm">
                Cuando el cliente agenda un lavado básico, Zenda pregunta: "Por
                $100 más puedes agregar encerado. ¿Te interesa?" Y cuando agenda
                detailing: "¿Quieres agregar protección cerámica por $3,000 más?
                Dura hasta 2 años." Aumenta el ticket promedio.
              </p>
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h3 className="font-medium text-blue-900">Aviso de auto listo</h3>
              <p className="mt-1 text-blue-800 text-sm">
                Cuando terminas el servicio, marcas "listo" y Zenda avisa
                automáticamente al cliente: "Tu auto está listo para recoger."
                El cliente no tiene que estar llamando cada hora.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 font-semibold text-2xl text-slate-900">
            Cómo empezar
          </h2>
          <ol className="mb-4 list-decimal space-y-2 pl-6 text-slate-700">
            <li>
              <strong>Regístrate</strong> en{" "}
              <Link
                className="font-medium text-blue-600 underline"
                href="/founding"
              >
                zenda.bot/founding
              </Link>
            </li>
            <li>
              <strong>Conecta tu WhatsApp Business</strong>
            </li>
            <li>
              <strong>Configura tus servicios</strong> — lavados, detailing,
              pulidos
            </li>
            <li>
              <strong>Define precios por tipo de vehículo</strong>
            </li>
            <li>
              <strong>Activa upsells y avisos de auto listo</strong>
            </li>
          </ol>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 font-semibold text-2xl text-slate-900">
            Preguntas frecuentes
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-slate-900">
                ¿Funciona para lavaderos con varias sucursales?
              </h3>
              <p className="text-slate-700">
                Sí. Cada sucursal tiene su propia agenda. El cliente elige la
                ubicación más cercana y ve los horarios disponibles de esa
                sucursal.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-slate-900">
                ¿Puedo manejar el servicio a domicilio?
              </h3>
              <p className="text-slate-700">
                Sí. Configuras zonas de cobertura y el servicio a domicilio como
                un servicio más. Zenda muestra disponibilidad según la zona del
                cliente.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-slate-900">¿Cuánto cuesta?</h3>
              <p className="text-slate-700">
                Desde $29 USD/mes — menos de un detailing básico. Si capturas un
                cliente más por semana que antes se perdía, el retorno es
                inmediato.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-blue-200 bg-blue-50 p-8 text-center">
          <h2 className="mb-2 font-bold text-2xl text-blue-900">
            Más autos, menos tiempo en el celular
          </h2>
          <p className="mb-6 text-blue-700">
            Automatiza tu negocio de auto detailing por WhatsApp y enfócate en
            hacer brillar los autos.
          </p>
          <Link
            className="inline-block rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
            href="/founding"
          >
            Comenzar gratis →
          </Link>
        </section>
      </article>
      <Footer />
    </>
  );
}

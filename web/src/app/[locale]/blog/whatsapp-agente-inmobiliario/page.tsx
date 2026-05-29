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
  const slug = "whatsapp-agente-inmobiliario";

  if (locale !== "es") {
    return {
      title:
        "Agente Inmobiliario por WhatsApp: Agenda Visitas y Cierres Automáticos | Zenda",
      description:
        "Automatiza tu agencia inmobiliaria por WhatsApp. Agenda visitas, califica prospectos y coordina cierres 24/7 con recepcionista virtual.",
      robots: { index: false, follow: false },
      alternates: {
        canonical: `https://zenda.bot/es/blog/${slug}`,
      },
    };
  }

  return {
    title:
      "Agente Inmobiliario por WhatsApp: Agenda Visitas y Cierres Automáticos | Zenda",
    description:
      "Automatiza tu agencia inmobiliaria por WhatsApp. Agenda visitas, califica prospectos y coordina cierres 24/7 con recepcionista virtual.",
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
        "Agente Inmobiliario por WhatsApp: Automatiza Visitas y Cierres | Zenda",
      description:
        "Agenda visitas de propiedades, califica prospectos y coordina cierres automáticamente por WhatsApp. Recepcionista virtual 24/7.",
      url: `https://zenda.bot/${locale}/blog/${slug}`,
      siteName: "Zenda",
      type: "article",
      locale: locale === "es" ? "es_MX" : "en_US",
    },
  };
}

export default function BlogAgenteInmobiliario() {
  return (
    <>
      <Nav />
      <article className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="mb-4 font-bold text-3xl text-slate-900 tracking-tight sm:text-4xl">
          Cómo un Agente Inmobiliario Puede Automatizar Citas por WhatsApp (Guía
          2025)
        </h1>
        <p className="mb-8 text-lg text-slate-600">
          Los agentes inmobiliarios que responden rápido por WhatsApp cierran
          más deals. Descubre cómo automatizar visitas, calificar prospectos y
          coordinar cierres sin estar pegado al celular.
        </p>

        <section className="mb-10">
          <h2 className="mb-3 font-semibold text-2xl text-slate-900">
            ¿Por qué tu agencia inmobiliaria necesita WhatsApp automatizado?
          </h2>
          <p className="mb-4 text-slate-700 leading-relaxed">
            El cliente interesado en una propiedad manda WhatsApp a 5 agentes a
            la vez. El primero que responda y le agende una visita, gana. Si
            tardas 2 horas en contestar porque estás enseñando otra casa, ya
            perdiste ese prospecto.
          </p>
          <p className="mb-4 text-slate-700 leading-relaxed">
            Las agencias inmobiliarias que automatizan su atención por WhatsApp
            reportan:
          </p>
          <ul className="mb-4 list-disc space-y-2 pl-6 text-slate-700">
            <li>
              <strong>60% más visitas agendadas</strong> — respuesta inmediata
              cuando el prospecto muestra interés
            </li>
            <li>
              <strong>40% más cierres</strong> — el seguimiento automático no
              deja enfriar leads
            </li>
            <li>
              <strong>Calificación automática</strong> — solo visitas
              presenciales con prospectos calificados
            </li>
            <li>
              <strong>Coordinación con propietarios</strong> — confirma visitas
              con el dueño automáticamente
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 font-semibold text-2xl text-slate-900">
            Los problemas de atender prospectos manualmente
          </h2>
          <ul className="mb-4 list-disc space-y-2 pl-6 text-slate-700">
            <li>
              <strong>Prospectos que se pierden</strong> — estás en una visita y
              no puedes contestar los otros 10 mensajes
            </li>
            <li>
              <strong>Visitantes no calificados</strong> — llegan a ver un
              departamento de $3M cuando su presupuesto es $1M
            </li>
            <li>
              <strong>Visitas que no se confirman</strong> — el cliente dice
              "ahí llego" pero nunca aparece
            </li>
            <li>
              <strong>Seguimiento inconsistente</strong> — después de la visita,
              nadie le da seguimiento al prospecto
            </li>
            <li>
              <strong>Coordinación caótica con propietarios</strong> — llamar al
              dueño para cada visita es pérdida de tiempo
            </li>
            <li>
              <strong>No respondes fines de semana</strong> — cuando más gente
              busca casas, no hay quien conteste
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 font-semibold text-2xl text-slate-900">
            Cómo funciona Zenda para agentes inmobiliarios
          </h2>
          <ol className="mb-4 list-decimal space-y-3 pl-6 text-slate-700">
            <li>
              <strong>El prospecto manda mensaje</strong> — "Hola, vi el
              departamento en Polanco, ¿aún está disponible?"
            </li>
            <li>
              <strong>Zenda confirma disponibilidad</strong> — responde al
              instante con información de la propiedad
            </li>
            <li>
              <strong>Califica al prospecto</strong> — pregunta presupuesto,
              fecha de mudanza, necesidades específicas
            </li>
            <li>
              <strong>Agenda la visita</strong> — muestra horarios disponibles y
              coordina con el propietario
            </li>
            <li>
              <strong>Recordatorio</strong> — envía ubicación y detalles 24h
              antes de la visita
            </li>
            <li>
              <strong>Seguimiento post-visita</strong> — "¿Le gustó la
              propiedad? ¿Tiene preguntas adicionales?"
            </li>
            <li>
              <strong>Documento faltantes</strong> — solicita documentos
              automáticamente para el proceso de renta/venta
            </li>
          </ol>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 font-semibold text-2xl text-slate-900">
            Tipos de propiedades y servicios que puedes gestionar
          </h2>
          <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-white p-3">
                <p className="font-medium text-slate-900">
                  Visita de propiedad
                </p>
                <p className="text-slate-600 text-sm">30-60 min</p>
              </div>
              <div className="rounded-lg bg-white p-3">
                <p className="font-medium text-slate-900">Firma de contrato</p>
                <p className="text-slate-600 text-sm">1-2 horas</p>
              </div>
              <div className="rounded-lg bg-white p-3">
                <p className="font-medium text-slate-900">Sesión fotográfica</p>
                <p className="text-slate-600 text-sm">1-3 horas</p>
              </div>
              <div className="rounded-lg bg-white p-3">
                <p className="font-medium text-slate-900">
                  Avalúo / Inspección
                </p>
                <p className="text-slate-600 text-sm">2-4 horas</p>
              </div>
              <div className="rounded-lg bg-white p-3">
                <p className="font-medium text-slate-900">Entrega de llaves</p>
                <p className="text-slate-600 text-sm">30 min</p>
              </div>
              <div className="rounded-lg bg-white p-3">
                <p className="font-medium text-slate-900">
                  Videollamada (tour virtual)
                </p>
                <p className="text-slate-600 text-sm">20-30 min</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 font-semibold text-2xl text-slate-900">
            Casos de uso especiales para bienes raíces
          </h2>
          <div className="space-y-4">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <h3 className="font-medium text-green-900">
                Calificación automática de leads
              </h3>
              <p className="mt-1 text-green-800 text-sm">
                Antes de agendar una visita, Zenda pregunta: presupuesto, fecha
                deseada, número de personas, mascotas, y si tiene fiador. Solo
                agenda visitas presenciales con prospectos que cumplen los
                requisitos. Ahoras horas semanales en visitas que no cierran.
              </p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <h3 className="font-medium text-amber-900">
                Coordinación con propietarios
              </h3>
              <p className="mt-1 text-amber-800 text-sm">
                Cuando un prospecto agenda una visita, Zenda notifica
                automáticamente al propietario: "Tienen visita el jueves a las
                4pm. ¿Confirma?" Si el dueño cancela, se notifica al prospecto y
                se reagenda automáticamente.
              </p>
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h3 className="font-medium text-blue-900">
                Seguimiento de documento faltantes
              </h3>
              <p className="mt-1 text-blue-800 text-sm">
                Después de que el prospecto acepta la propiedad, Zenda envía la
                lista de documentos necesarios y hace seguimiento automático:
                "Recuerde que falta su comprobante de ingresos. ¿Puede enviarlo
                esta semana?" Hasta que el expediente esté completo.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 font-semibold text-2xl text-slate-900">
            Ejemplo: Agencia "Hogar Perfecto"
          </h2>
          <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-6">
            <p className="mb-2 font-medium text-slate-900">Antes de Zenda:</p>
            <ul className="mb-4 list-disc space-y-1 pl-6 text-slate-700 text-sm">
              <li>3 agentes, 40 propiedades en catálogo</li>
              <li>
                8-12 visitas semanales, muchas con prospectos no calificados
              </li>
              <li>30% de las visitas no se presentaban</li>
              <li>Seguimiento manual inconsistente — leads se enfriaban</li>
              <li>Fines de semana sin respuesta = prospectos perdidos</li>
            </ul>
            <p className="mb-2 font-medium text-slate-900">
              Con Zenda (1 mes después):
            </p>
            <ul className="list-disc space-y-1 pl-6 text-slate-700 text-sm">
              <li>18-22 visitas semanales (solo prospectos calificados)</li>
              <li>5% no-show (recordatorios + confirmación previa)</li>
              <li>Seguimiento automático post-visita a los 2 días</li>
              <li>Visitas agendadas los domingos (antes: 0)</li>
              <li>Agenda de propiedad actualizada en tiempo real</li>
            </ul>
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
              <strong>Configura tus propiedades</strong> — sube las que están
              disponibles con sus datos
            </li>
            <li>
              <strong>Define las preguntas de calificación</strong> —
              presupuesto, fecha, requisitos
            </li>
            <li>
              <strong>Configura la coordinación con propietarios</strong>
            </li>
            <li>
              <strong>Activa el seguimiento automático</strong> post-visita
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
                ¿Funciona para venta y renta?
              </h3>
              <p className="text-slate-700">
                Sí. Puedes configurar flujos distintos para venta y renta, con
                preguntas de calificación diferentes y documentos requeridos
                específicos para cada uno.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-slate-900">
                ¿Puedo manejar varios agentes inmobiliarios?
              </h3>
              <p className="text-slate-700">
                Sí. Cada agente tiene su horario y propiedades asignadas. Zenda
                distribuye las visitas automáticamente según disponibilidad y
                zona.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-slate-900">
                ¿Se integra con portales inmobiliarios?
              </h3>
              <p className="text-slate-700">
                Cuando un prospecto llega desde un portal, el flujo es el mismo:
                manda WhatsApp y Zenda lo atiende. Puedes configurar respuestas
                específicas según la propiedad que le interese.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-slate-900">¿Cuánto cuesta?</h3>
              <p className="text-slate-700">
                Desde $29 USD/mes — una sola comisión de una renta paga todo un
                año de Zenda. Si un prospecto que antes se perdía ahora agenda
                visita y cierra, el retorno es inmediato.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-blue-200 bg-blue-50 p-8 text-center">
          <h2 className="mb-2 font-bold text-2xl text-blue-900">
            Más visitas, más cierres, menos tiempo en el celular
          </h2>
          <p className="mb-6 text-blue-700">
            Automatiza tu agencia inmobiliaria por WhatsApp y enfócate en cerrar
            deals, no en contestar mensajes.
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

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
  const slug = "whatsapp-sesiones-fotograficas";

  if (locale !== "es") {
    return {
      title:
        "Agendar Sesiones Fotográficas por WhatsApp | Automatiza tu Estudio con Zenda",
      description:
        "Automatiza las sesiones de tu estudio fotográfico por WhatsApp. Agenda sesiones, confirma horarios y envía galerías automáticamente.",
      robots: { index: false, follow: false },
      alternates: {
        canonical: `https://zenda.bot/es/blog/${slug}`,
      },
    };
  }

  return {
    title:
      "Agendar Sesiones Fotográficas por WhatsApp | Automatiza tu Estudio con Zenda",
    description:
      "Automatiza las sesiones de tu estudio fotográfico por WhatsApp. Agenda sesiones, confirma horarios y envía galerías automáticamente.",
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
        "Sesiones Fotográficas por WhatsApp: Agenda Automáticamente | Zenda",
      description:
        "Agenda sesiones fotográficas, confirma horarios y envía recordatorios automáticamente por WhatsApp. Recepcionista virtual para fotógrafos.",
      url: `https://zenda.bot/${locale}/blog/${slug}`,
      siteName: "Zenda",
      type: "article",
      locale: locale === "es" ? "es_MX" : "en_US",
    },
  };
}

export default function BlogSesionesFotograficas() {
  return (
    <>
      <Nav />
      <article className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="mb-4 font-bold text-3xl text-slate-900 tracking-tight sm:text-4xl">
          Cómo Agendar Sesiones Fotográficas por WhatsApp (Guía 2025)
        </h1>
        <p className="mb-8 text-lg text-slate-600">
          Los fotógrafos que automatizan sus sesiones por WhatsApp agendan más
          clientes y pierden menos tiempo coordinando. Descubre cómo hacerlo.
        </p>

        <section className="mb-10">
          <h2 className="mb-3 font-semibold text-2xl text-slate-900">
            ¿Por qué tu estudio fotográfico necesita agendar por WhatsApp?
          </h2>
          <p className="mb-4 text-slate-700 leading-relaxed">
            Cuando alguien quiere fotos — de XV años, boda, bebé, o estudio
            profesional — lo primero que hace es buscar en WhatsApp. Si no
            respondes rápido, buscan otro fotógrafo. Y si no puedes confirmarles
            horario y lugar de inmediato, se van.
          </p>
          <p className="mb-4 text-slate-700 leading-relaxed">
            Los fotógrafos que automatizan sus sesiones por WhatsApp reportan:
          </p>
          <ul className="mb-4 list-disc space-y-2 pl-6 text-slate-700">
            <li>
              <strong>50% más sesiones agendadas</strong> — capturan leads que
              antes se perdían
            </li>
            <li>
              <strong>35% menos no-shows</strong> — recordatorios automáticos
              con ubicación
            </li>
            <li>
              <strong>3 horas ahorradas al día</strong> — sin coordinar horarios
              manualmente
            </li>
            <li>
              <strong>Más clientes recurrentes</strong> — seguimiento automático
              y promociones
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 font-semibold text-2xl text-slate-900">
            Los problemas de agendar sesiones manualmente
          </h2>
          <ul className="mb-4 list-disc space-y-2 pl-6 text-slate-700">
            <li>
              <strong>Estás en una sesión y no puedes contestar</strong> — el
              cliente escribe "¿cuándo tienen?" y no respondes hasta la noche
            </li>
            <li>
              <strong>Coordinar locación y horario es un caos</strong> — ida y
              vuelta de mensajes para definir dónde y a qué hora
            </li>
            <li>
              <strong>No sabes qué tipo de sesión quiere</strong> — "quiero
              fotos" pero no dices si es retrato, producto, evento, boda
            </li>
            <li>
              <strong>Clientes que no se presentan</strong> — agendaron pero
              nunca llegaron, y ese horario se perdió
            </li>
            <li>
              <strong>Seguimiento post-sesión</strong> — nunca avisas cuando las
              fotos están listas, o lo haces semanas después
            </li>
            <li>
              <strong>No puedes responder de noche</strong> — las novias planean
              bodas a las 11pm
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 font-semibold text-2xl text-slate-900">
            Cómo funciona Zenda para fotógrafos
          </h2>
          <ol className="mb-4 list-decimal space-y-3 pl-6 text-slate-700">
            <li>
              <strong>El cliente manda mensaje</strong> — "Hola, quiero cotizar
              una sesión de fotos para mi bebé"
            </li>
            <li>
              <strong>Zenda pregunta el tipo de sesión</strong> — ¿recién
              nacido, bautizo, primer año, maternidad?
            </li>
            <li>
              <strong>Muestra paquetes disponibles</strong> — con precios y lo
              que incluye cada uno
            </li>
            <li>
              <strong>Agenda la sesión</strong> — el cliente elige fecha y
              horario entre los disponibles
            </li>
            <li>
              <strong>Envía preparación</strong> — "Recomendaciones para tu
              sesión: ropa clara, llegar 10 min antes, ubicación..."
            </li>
            <li>
              <strong>Recordatorio</strong> — 24h antes con ubicación y
              confirmación
            </li>
            <li>
              <strong>Aviso de galería lista</strong> — "Tus fotos ya están
              listas. Puedes verlas aquí..."
            </li>
          </ol>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 font-semibold text-2xl text-slate-900">
            Tipos de sesiones que puedes agendar
          </h2>
          <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-white p-3">
                <p className="font-medium text-slate-900">Fotos de estudio</p>
                <p className="text-slate-600 text-sm">1-2 horas</p>
              </div>
              <div className="rounded-lg bg-white p-3">
                <p className="font-medium text-slate-900">Bodas</p>
                <p className="text-slate-600 text-sm">
                  8-12 horas (evento completo)
                </p>
              </div>
              <div className="rounded-lg bg-white p-3">
                <p className="font-medium text-slate-900">XV años</p>
                <p className="text-slate-600 text-sm">4-6 horas</p>
              </div>
              <div className="rounded-lg bg-white p-3">
                <p className="font-medium text-slate-900">Recién nacido</p>
                <p className="text-slate-600 text-sm">2-3 horas</p>
              </div>
              <div className="rounded-lg bg-white p-3">
                <p className="font-medium text-slate-900">
                  Producto / E-commerce
                </p>
                <p className="text-slate-600 text-sm">2-4 horas</p>
              </div>
              <div className="rounded-lg bg-white p-3">
                <p className="font-medium text-slate-900">
                  Retrato profesional
                </p>
                <p className="text-slate-600 text-sm">30-60 min</p>
              </div>
            </div>
          </div>
          <p className="text-slate-700 leading-relaxed">
            Cada tipo de sesión se configura con su duración, precio, y
            recomendaciones de preparación. Zenda usa esta información para dar
            una experiencia profesional desde el primer mensaje.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 font-semibold text-2xl text-slate-900">
            Casos de uso especiales
          </h2>
          <div className="space-y-4">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <h3 className="font-medium text-green-900">
                Cotización automática
              </h3>
              <p className="mt-1 text-green-800 text-sm">
                El cliente describe lo que necesita y Zenda genera una
                cotización basada en tus paquetes predefinidos. Si es algo
                personalizado, te notifica para que le des precio. Así no
                pierdes tiempo cotizando cosas que ya tienes paquetizadas.
              </p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <h3 className="font-medium text-amber-900">
                Preparación pre-sesión
              </h3>
              <p className="mt-1 text-amber-800 text-sm">
                48 horas antes de la sesión, Zenda envía automáticamente las
                recomendaciones: qué ropa llevar, si hay cambio de outfit,
                dirección exacta con mapa, y número de contacto de emergencia.
                Menos confusiones, mejores fotos.
              </p>
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h3 className="font-medium text-blue-900">
                Aviso de galería + venta de impresiones
              </h3>
              <p className="mt-1 text-blue-800 text-sm">
                Cuando las fotos están listas, Zenda avisa al cliente y puede
                incluir opciones de impresión: "Tu galería está lista. ¿Te
                interesa un álbum impreso o canvas? Tenemos paquetes desde
                $500." Genera ventas adicionales sin esfuerzo.
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
              <strong>Configura tus paquetes</strong> — tipos de sesión, precios
              y duración
            </li>
            <li>
              <strong>Sube tus locaciones</strong> — estudio, exterior, o ambas
            </li>
            <li>
              <strong>Configura mensajes de preparación</strong> para cada tipo
              de sesión
            </li>
            <li>
              <strong>Activa recordatorios</strong> y aviso de galería lista
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
                ¿Puedo personalizar las respuestas según el tipo de sesión?
              </h3>
              <p className="text-slate-700">
                Sí. Cada tipo de sesión tiene su propio flujo: preguntas
                diferentes, precios distintos, y mensajes de preparación
                personalizados.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-slate-900">
                ¿Funciona para fotógrafos freelance?
              </h3>
              <p className="text-slate-700">
                Especialmente. Si eres tú solo, no hay nadie que conteste cuando
                estás disparando. Zenda responde por ti y agenda las sesiones en
                tus huecos disponibles.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-slate-900">
                ¿Puedo enviar la galería de fotos por WhatsApp?
              </h3>
              <p className="text-slate-700">
                Zenda envía el enlace a tu galería en línea (Google Drive,
                Pixieset, SmugMug, etc.) con un mensaje personalizado. No envía
                archivos pesados por WhatsApp.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-slate-900">¿Cuánto cuesta?</h3>
              <p className="text-slate-700">
                Desde $29 USD/mes — menos de lo que cobras por una sesión de
                retrato. Si una sola sesión que antes se perdía ahora se agenda,
                ya pagó el plan.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-blue-200 bg-blue-50 p-8 text-center">
          <h2 className="mb-2 font-bold text-2xl text-blue-900">
            Más sesiones, menos coordinación
          </h2>
          <p className="mb-6 text-blue-700">
            Automatiza tu estudio fotográfico por WhatsApp y enfócate en lo que
            más te gusta: crear imágenes increíbles.
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

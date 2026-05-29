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
  const slug = "whatsapp-citas-salon-belleza";

  if (locale !== "es") {
    return {
      title:
        "Citas por WhatsApp para Salón de Belleza | Agenda Automáticamente con Zenda",
      description:
        "Automatiza las citas de tu salón de belleza por WhatsApp. Agenda cortes, manicura, tratamientos faciales y más automáticamente.",
      robots: { index: false, follow: false },
      alternates: {
        canonical: `https://zenda.bot/es/blog/${slug}`,
      },
    };
  }

  return {
    title:
      "Citas por WhatsApp para Salón de Belleza | Agenda Automáticamente con Zenda",
    description:
      "Automatiza las citas de tu salón de belleza por WhatsApp. Agenda cortes, manicura, tratamientos faciales y más automáticamente.",
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
      title: "Citas por WhatsApp para Salón de Belleza | Zenda",
      description:
        "Agenda cortes, manicura y tratamientos automáticamente por WhatsApp. Recepcionista virtual para salones de belleza.",
      url: `https://zenda.bot/${locale}/blog/${slug}`,
      siteName: "Zenda",
      type: "article",
      locale: locale === "es" ? "es_MX" : "en_US",
    },
  };
}

export default function BlogSalonBelleza() {
  return (
    <>
      <Nav />
      <article className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="mb-4 font-bold text-3xl text-slate-900 tracking-tight sm:text-4xl">
          Cómo Agendar Citas por WhatsApp en tu Salón de Belleza (Guía 2025)
        </h1>
        <p className="mb-8 text-lg text-slate-600">
          Las clientas quieren agendar su cita cuando se acuerdan — a las 11pm
          del domingo, en el transporte, entre reuniones. Si no puedes
          responderles, se van con el salón de la competencia.
        </p>

        <section className="mb-10">
          <h2 className="mb-3 font-semibold text-2xl text-slate-900">
            ¿Por qué tu salón necesita WhatsApp automatizado?
          </h2>
          <p className="mb-4 text-slate-700 leading-relaxed">
            La mayoría de tus clientas te escriben por WhatsApp. Quieren saber
            precios, disponibilidad y agendar rápido. Si no respondes en el
            momento, la competencia sí.
          </p>
          <ul className="mb-4 list-disc space-y-2 pl-6 text-slate-700">
            <li>
              <strong>45% más citas agendadas</strong> — respuesta inmediata
              24/7
            </li>
            <li>
              <strong>30% menos espacios vacíos</strong> — lista de espera
              automática para cancelaciones
            </li>
            <li>
              <strong>Cero no-shows</strong> — confirmación + recordatorio por
              WhatsApp
            </li>
            <li>
              <strong>Más ventas de productos</strong> — promoción automática
              post-servicio
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 font-semibold text-2xl text-slate-900">
            Los problemas de agendar manualmente
          </h2>
          <ul className="mb-4 list-disc space-y-2 pl-6 text-slate-700">
            <li>
              <strong>Estás con una clienta y no puedes contestar</strong> — la
              otra se va a otro salón
            </li>
            <li>
              <strong>Preguntas repetitivas</strong> — "¿cuánto cuesta el
              balayage?", "¿tienen punta mancuerna?", "¿aceptan tarjeta?"
            </li>
            <li>
              <strong>Citas que se empalman</strong> — la agenda en papel se
              equivoca
            </li>
            <li>
              <strong>Clientas que no llegan</strong> — no confirmaron y el
              espacio se pierde
            </li>
            <li>
              <strong>No puedes rellenar cancelaciones</strong> — alguien
              cancela a última hora y nadie ocupa su lugar
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 font-semibold text-2xl text-slate-900">
            Cómo funciona Zenda para salones de belleza
          </h2>
          <ol className="mb-4 list-decimal space-y-3 pl-6 text-slate-700">
            <li>
              <strong>La clienta manda mensaje</strong> — "Hola, quiero una cita
              para balayage"
            </li>
            <li>
              <strong>Zenda muestra servicios</strong> — balayage, mechas,
              tintes, cortes, tratamientos
            </li>
            <li>
              <strong>Pregunta la estilista</strong> — si tienen preferencia por
              alguien en específico
            </li>
            <li>
              <strong>Muestra horarios disponibles</strong> — la clienta elige
              el que le queda
            </li>
            <li>
              <strong>Confirma la cita</strong> — con servicio, profesional,
              fecha y hora
            </li>
            <li>
              <strong>Recordatorio</strong> — 24h antes con confirmación
            </li>
            <li>
              <strong>Post-servicio</strong> — "¿Cómo te quedó? Recuerda usar el
              shampoo sin sulfatos. ¡Te esperamos de vuelta!"
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
                <p className="font-medium text-slate-900">Corte + styling</p>
                <p className="text-slate-600 text-sm">45-60 min</p>
              </div>
              <div className="rounded-lg bg-white p-3">
                <p className="font-medium text-slate-900">Color / Tinte</p>
                <p className="text-slate-600 text-sm">2-3 horas</p>
              </div>
              <div className="rounded-lg bg-white p-3">
                <p className="font-medium text-slate-900">Balayage / Mechas</p>
                <p className="text-slate-600 text-sm">3-4 horas</p>
              </div>
              <div className="rounded-lg bg-white p-3">
                <p className="font-medium text-slate-900">
                  Manicura / Pedicura
                </p>
                <p className="text-slate-600 text-sm">45-90 min</p>
              </div>
              <div className="rounded-lg bg-white p-3">
                <p className="font-medium text-slate-900">Tratamiento facial</p>
                <p className="text-slate-600 text-sm">60-90 min</p>
              </div>
              <div className="rounded-lg bg-white p-3">
                <p className="font-medium text-slate-900">Maquillaje</p>
                <p className="text-slate-600 text-sm">45-60 min</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 font-semibold text-2xl text-slate-900">
            Funcionalidades especiales para salones
          </h2>
          <div className="space-y-4">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <h3 className="font-medium text-green-900">
                Agenda por profesional
              </h3>
              <p className="mt-1 text-green-800 text-sm">
                Cada estilista tiene su propio horario. La clienta elige con
                quién quiere y Zenda muestra solo los espacios de esa persona.
                Si alguien cancela con la estilista A, la lista de espera solo
                avisa a quienes querían con ella.
              </p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <h3 className="font-medium text-amber-900">
                Recordatorio de retoque
              </h3>
              <p className="mt-1 text-amber-800 text-sm">
                4 semanas después de un color, Zenda envía automáticamente: "Tu
                raíz ya debe estar creciendo. ¿Quieres agendar tu retoque?"
                Genera citas recurrentes sin que tengas que rastrear cada
                clienta.
              </p>
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h3 className="font-medium text-blue-900">
                Venta de productos post-servicio
              </h3>
              <p className="mt-1 text-blue-800 text-sm">
                Después de cada servicio, Zenda puede recomendar productos:
                "Para mantener tu color, te recomendamos nuestro shampoo sin
                sulfatos ($250). ¿Te lo guardamos para tu próxima visita?"
                Genera ingresos adicionales.
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
              <strong>Configura tus servicios</strong> — cortes, color, uñas,
              faciales, maquillaje
            </li>
            <li>
              <strong>Agrega a tu equipo</strong> — cada estilista con su
              horario
            </li>
            <li>
              <strong>Activa recordatorios de retoque</strong> para color
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
                ¿Funciona para barberías también?
              </h3>
              <p className="text-slate-700">
                Sí, perfectamente. Tenemos una guía específica para barberías.
                Los flujos son los mismos: servicios, profesionales, horarios y
                recordatorios.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-slate-900">
                ¿Puedo manejar paquetes (cita + tratamiento)?
              </h3>
              <p className="text-slate-700">
                Sí. Creas paquetes como "Corte + facial" o "Novia completa" y
                Zenda los muestra como opciones. La agenda se ajusta
                automáticamente a la duración del paquete.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-slate-900">¿Cuánto cuesta?</h3>
              <p className="text-slate-700">
                Desde $29 USD/mes — menos de lo que cobras por un balayage. Si
                recuperas una sola clienta que iba a cambiar de salón, ya pagó
                el plan.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-blue-200 bg-blue-50 p-8 text-center">
          <h2 className="mb-2 font-bold text-2xl text-blue-900">
            Más clientas, menos espacios vacíos
          </h2>
          <p className="mb-6 text-blue-700">
            Automatiza tu salón de belleza por WhatsApp y enfócate en hacer
            felices a tus clientas.
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

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
  const slug = "whatsapp-citas-barberia";

  if (locale !== "es") {
    return {
      title: "Agendar Citas por WhatsApp en Barbería | Automatiza con Zenda",
      description:
        "Aprende cómo automatizar las citas de tu barbería por WhatsApp. Reduce ausencias, acepta reservas 24/7 y crece tu negocio con recepcionista virtual.",
      robots: { index: false, follow: false },
      alternates: {
        canonical: `https://zenda.bot/es/blog/${slug}`,
      },
    };
  }

  return {
    title: "Agendar Citas por WhatsApp en Barbería | Automatiza con Zenda",
    description:
      "Aprende cómo automatizar las citas de tu barbería por WhatsApp. Reduce ausencias, acepta reservas 24/7 y crece tu negocio con recepcionista virtual.",
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
      title: "Agendar Citas por WhatsApp en Barbería | Zenda",
      description:
        "Automatiza las citas de tu barbería por WhatsApp. Reccepcionista virtual que agenda, confirma y recuerda citas 24/7.",
      url: `https://zenda.bot/${locale}/blog/${slug}`,
      siteName: "Zenda",
      type: "article",
      locale: locale === "es" ? "es_MX" : "en_US",
    },
  };
}

export default function BlogCitasBarberia() {
  return (
    <>
      <Nav />
      <article className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="mb-4 font-bold text-3xl text-slate-900 tracking-tight sm:text-4xl">
          Cómo Agendar Citas por WhatsApp en tu Barbería (Guía Completa 2025)
        </h1>
        <p className="mb-8 text-lg text-slate-600">
          Las barberías que usan WhatsApp para agendar citas tienen una ventaja
          enorme. Descubre cómo automatizar todo el proceso y llenar tu agenda
          sin estar pegado al teléfono.
        </p>

        <section className="mb-10">
          <h2 className="mb-3 font-semibold text-2xl text-slate-900">
            ¿Por qué tu barbería necesita agendar por WhatsApp?
          </h2>
          <p className="mb-4 text-slate-700 leading-relaxed">
            En Latinoamérica, el 95% de tus clientes usa WhatsApp. Cuando
            quieren cortarse el pelo, no llaman — mandan mensaje. Pero responder
            cada "¿a qué horas tienes?" toma tiempo que podrías usar cortando
            pelo.
          </p>
          <p className="mb-4 text-slate-700 leading-relaxed">
            Las barberías que automatizan sus citas por WhatsApp reportan:
          </p>
          <ul className="mb-4 list-disc space-y-2 pl-6 text-slate-700">
            <li>
              <strong>40% menos ausencias</strong> — los recordatorios
              automáticos reducen los no-shows
            </li>
            <li>
              <strong>3x más reservas</strong> — los clientes agendan a
              cualquier hora, no solo en horario de atención
            </li>
            <li>
              <strong>2 horas ahorradas al día</strong> — sin contestar mensajes
              uno por uno
            </li>
            <li>
              <strong>Más clientes recurrentes</strong> — seguimiento automático
              cada 3-4 semanas
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 font-semibold text-2xl text-slate-900">
            El problema de agendar citas manualmente
          </h2>
          <p className="mb-4 text-slate-700 leading-relaxed">
            Si eres barbero, conoces la rutina: estás en medio de un corte de
            pelo y suena el celular. Es un cliente preguntando si tienes lugar a
            las 5. Tienes que soltar la máquina, revisar la agenda, responder...
            y mientras tanto tu cliente actual espera.
          </p>
          <p className="mb-4 text-slate-700 leading-relaxed">
            Los problemas más comunes al agendar manualmente:
          </p>
          <ul className="mb-4 list-disc space-y-2 pl-6 text-slate-700">
            <li>
              <strong>Mensajes perdidos</strong> — entre los grupos de WhatsApp
              y los chats personales, se te pierden clientes
            </li>
            <li>
              <strong>Citas duplicadas</strong> — anotas mal la hora y llegan
              dos personas al mismo tiempo
            </li>
            <li>
              <strong>No-shows</strong> — el cliente olvida su cita y tú pierdes
              dinero
            </li>
            <li>
              <strong>No puedes responder de noche</strong> — los que quieren
              agendar a las 11pm se van con la competencia
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 font-semibold text-2xl text-slate-900">
            La solución: Recepcionista virtual por WhatsApp
          </h2>
          <p className="mb-4 text-slate-700 leading-relaxed">
            Un recepcionista virtual como Zenda se conecta a tu WhatsApp
            Business y maneja todo automáticamente:
          </p>
          <ol className="mb-4 list-decimal space-y-3 pl-6 text-slate-700">
            <li>
              <strong>El cliente manda mensaje</strong> — "Quiero un corte,
              ¿cuándo tienes?"
            </li>
            <li>
              <strong>Zenda responde al instante</strong> — muestra los horarios
              disponibles del día
            </li>
            <li>
              <strong>El cliente elige su hora</strong> — se confirma
              automáticamente en tu agenda
            </li>
            <li>
              <strong>Recordatorio automático</strong> — se envía 24 horas antes
              y 1 hora antes
            </li>
            <li>
              <strong>Si necesita reagendar</strong> — el cliente puede cambiar
              su cita por WhatsApp sin llamarte
            </li>
          </ol>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 font-semibold text-2xl text-slate-900">
            Ejemplo: Barbería "Los Clásicos"
          </h2>
          <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-6">
            <p className="mb-2 font-medium text-slate-900">
              Situación antes de Zenda:
            </p>
            <ul className="mb-4 list-disc space-y-1 pl-6 text-slate-700 text-sm">
              <li>15-20 citas diarias, agendadas por WhatsApp manualmente</li>
              <li>3-5 no-shows por semana ($$$ perdidos)</li>
              <li>Barbero interrumpido constantemente por mensajes</li>
              <li>Cero reservas después de las 9pm</li>
            </ul>
            <p className="mb-2 font-medium text-slate-900">
              Situación con Zenda (1 mes después):
            </p>
            <ul className="list-disc space-y-1 pl-6 text-slate-700 text-sm">
              <li>22-25 citas diarias (reservas 24/7)</li>
              <li>1-2 no-shows por semana (recordatorios automáticos)</li>
              <li>Barbero enfocado 100% en cortar pelo</li>
              <li>5-8 reservas nocturnas que antes no existían</li>
            </ul>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 font-semibold text-2xl text-slate-900">
            Cómo configurar Zenda en tu barbería
          </h2>
          <p className="mb-4 text-slate-700 leading-relaxed">
            El proceso toma menos de 10 minutos:
          </p>
          <ol className="mb-4 list-decimal space-y-2 pl-6 text-slate-700">
            <li>
              <strong>Regístrate gratis</strong> en{" "}
              <Link
                className="font-medium text-blue-600 underline"
                href="/founding"
              >
                zenda.bot/founding
              </Link>
            </li>
            <li>
              <strong>Conecta tu WhatsApp Business</strong> — Zenda se integra
              directamente
            </li>
            <li>
              <strong>Configura tus servicios</strong> — corte clásico, fade,
              barba, cejas, etc. con precios y duración
            </li>
            <li>
              <strong>Define tu horario</strong> — días y horas disponibles
            </li>
            <li>
              <strong>Activa los recordatorios</strong> — 24h antes y 1h antes
            </li>
          </ol>
          <p className="text-slate-700 leading-relaxed">
            Tus clientes empiezan a agendar inmediatamente —{" "}
            <strong>sin descargar nada, sin cambiar de app</strong>. Todo
            funciona desde el WhatsApp que ya usan.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 font-semibold text-2xl text-slate-900">
            ¿Cuánto cuesta?
          </h2>
          <p className="mb-4 text-slate-700 leading-relaxed">
            Zenda tiene planes desde <strong>$29 USD/mes</strong> — menos de lo
            que cobras por un corte de pelo. Si evitas solo 2 no-shows al mes,
            ya pagó el plan completo.
          </p>
          <p className="mb-4 text-slate-700 leading-relaxed">
            Y con el programa de founders, los primeros clientes obtienen acceso
            prioritario + precio congelado de por vida.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 font-semibold text-2xl text-slate-900">
            Preguntas frecuentes
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-slate-900">
                ¿Mis clientes necesitan descargar algo?
              </h3>
              <p className="text-slate-700">
                No. Todo funciona por WhatsApp. Tus clientes agendan como
                siempre mandaron un mensaje — la diferencia es que ahora reciben
                respuesta inmediata.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-slate-900">
                ¿Puedo seguir respondiendo mensajes yo mismo?
              </h3>
              <p className="text-slate-700">
                Sí. Zenda solo responde cuando no puedes. Puedes configurar
                horarios o palabras clave para tomar el control cuando quieras.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-slate-900">
                ¿Funciona con mi número de WhatsApp actual?
              </h3>
              <p className="text-slate-700">
                Sí, se conecta a tu WhatsApp Business existente. No necesitas un
                número nuevo.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-slate-900">
                ¿Funciona en México, Colombia, Argentina...?
              </h3>
              <p className="text-slate-700">
                Sí, Zenda funciona en toda Latinoamérica. Solo necesitas
                conexión a internet y WhatsApp Business.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-blue-200 bg-blue-50 p-8 text-center">
          <h2 className="mb-2 font-bold text-2xl text-blue-900">
            Empieza a agendar citas automáticamente
          </h2>
          <p className="mb-6 text-blue-700">
            Deja de perder clientes y tiempo contestando WhatsApp. Prueba Zenda
            gratis.
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

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
  const slug = "whatsapp-citas-taller-mecanico";
  return {
    title:
      "Agendar Citas por WhatsApp en Taller Mecánico | Automatiza con Zenda",
    description:
      "Automatiza las citas de tu taller mecánico por WhatsApp. Recibe solicitudes de servicio 24/7, reduce tiempos muertos y organiza tu agenda automáticamente.",
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
      title: "Agendar Citas por WhatsApp en Taller Mecánico | Zenda",
      description:
        "Automatiza las citas de tu taller mecánico por WhatsApp. Recepcionista virtual que agenda, confirma y recuerda citas 24/7.",
      url: `https://zenda.bot/${locale}/blog/${slug}`,
      siteName: "Zenda",
      type: "article",
      locale: locale === "es" ? "es_MX" : "en_US",
    },
  };
}

export default function BlogCitasTallerMecanico() {
  return (
    <>
      <Nav />
      <article className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="mb-4 font-bold text-3xl text-slate-900 tracking-tight sm:text-4xl">
          Cómo Agendar Citas por WhatsApp en tu Taller Mecánico (Guía 2025)
        </h1>
        <p className="mb-8 text-lg text-slate-600">
          Los talleres mecánicos que usan WhatsApp para agendar citas atienden
          más autos y pierden menos tiempo. Descubre cómo automatizar todo el
          proceso.
        </p>

        <section className="mb-10">
          <h2 className="mb-3 font-semibold text-2xl text-slate-900">
            ¿Por qué tu taller mecánico necesita agendar por WhatsApp?
          </h2>
          <p className="mb-4 text-slate-700 leading-relaxed">
            Los dueños de auto prefieren mandar un WhatsApp antes que llamar.
            Quieren saber cuándo pueden llevar su carro, cuánto va a costar, y
            cuándo estará listo. Si no respondes rápido, se van a otro taller.
          </p>
          <p className="mb-4 text-slate-700 leading-relaxed">
            Los talleres mecánicos que automatizan sus citas por WhatsApp
            reportan:
          </p>
          <ul className="mb-4 list-disc space-y-2 pl-6 text-slate-700">
            <li>
              <strong>35% más autos atendidos</strong> — mejor organización de
              la agenda
            </li>
            <li>
              <strong>50% menos tiempo en el teléfono</strong> — el mecánico se
              enfoca en reparar
            </li>
            <li>
              <strong>Menos autos sin recoger</strong> — recordatorios
              automáticos cuando el auto está listo
            </li>
            <li>
              <strong>Clientes más satisfechos</strong> — respuesta inmediata
              24/7
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 font-semibold text-2xl text-slate-900">
            Los problemas de agendar manualmente en un taller
          </h2>
          <p className="mb-4 text-slate-700 leading-relaxed">
            Si trabajas en un taller mecánico, conoces estos problemas:
          </p>
          <ul className="mb-4 list-disc space-y-2 pl-6 text-slate-700">
            <li>
              <strong>Sobrebooking</strong> — llegan 5 carros a las 8am porque
              no hay agenda organizada
            </li>
            <li>
              <strong>Clientes que no llegan</strong> — agendaron pero nunca
              aparecieron, y ese espacio se perdió
            </li>
            <li>
              <strong>Mensajes sin responder</strong> — estás debajo de un auto
              y no puedes contestar el celular
            </li>
            <li>
              <strong>No sabes qué necesita cada auto</strong> — el cliente
              manda "necesito servicio" pero no dices si es aceite, frenos, o
              revisión general
            </li>
            <li>
              <strong>Autos olvidados</strong> — el trabajo ya está hecho pero
              el cliente no viene por su carro
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 font-semibold text-2xl text-slate-900">
            La solución: Recepcionista virtual para talleres mecánicos
          </h2>
          <p className="mb-4 text-slate-700 leading-relaxed">
            Un recepcionista virtual como Zenda se conecta a tu WhatsApp
            Business y maneja todo automáticamente:
          </p>
          <ol className="mb-4 list-decimal space-y-3 pl-6 text-slate-700">
            <li>
              <strong>El cliente manda mensaje</strong> — "Necesito un cambio de
              aceite, ¿cuándo pueden?"
            </li>
            <li>
              <strong>Zenda pregunta el servicio</strong> — ¿aceite, frenos,
              suspensión, revisión general?
            </li>
            <li>
              <strong>Muestra horarios disponibles</strong> — el cliente elige
              el que le convenga
            </li>
            <li>
              <strong>Confirma la cita</strong> — con fecha, hora, y tipo de
              servicio
            </li>
            <li>
              <strong>Recordatorio</strong> — se envía 24h antes para evitar
              no-shows
            </li>
            <li>
              <strong>Aviso de listo</strong> — cuando el auto está reparado,
              avisa automáticamente al cliente
            </li>
          </ol>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 font-semibold text-2xl text-slate-900">
            Servicios que puedes agendar automáticamente
          </h2>
          <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-white p-3">
                <p className="font-medium text-slate-900">Cambio de aceite</p>
                <p className="text-slate-600 text-sm">30-45 min</p>
              </div>
              <div className="rounded-lg bg-white p-3">
                <p className="font-medium text-slate-900">Frenos</p>
                <p className="text-slate-600 text-sm">2-4 horas</p>
              </div>
              <div className="rounded-lg bg-white p-3">
                <p className="font-medium text-slate-900">Suspensión</p>
                <p className="text-slate-600 text-sm">3-5 horas</p>
              </div>
              <div className="rounded-lg bg-white p-3">
                <p className="font-medium text-slate-900">Revisión general</p>
                <p className="text-slate-600 text-sm">1-2 horas</p>
              </div>
              <div className="rounded-lg bg-white p-3">
                <p className="font-medium text-slate-900">
                  Alineación y balanceo
                </p>
                <p className="text-slate-600 text-sm">45-60 min</p>
              </div>
              <div className="rounded-lg bg-white p-3">
                <p className="font-medium text-slate-900">Transmisión</p>
                <p className="text-slate-600 text-sm">1-2 días</p>
              </div>
            </div>
          </div>
          <p className="text-slate-700 leading-relaxed">
            Cada servicio se configura con su duración estimada. Zenda usa esta
            información para mostrar horarios disponibles reales —{" "}
            <strong>sin sobrebooking, sin citas que se empalmen</strong>.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 font-semibold text-2xl text-slate-900">
            Ejemplo: Taller "Motor Perfecto"
          </h2>
          <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-6">
            <p className="mb-2 font-medium text-slate-900">Antes de Zenda:</p>
            <ul className="mb-4 list-disc space-y-1 pl-6 text-slate-700 text-sm">
              <li>8-12 autos por día, agenda en libreta</li>
              <li>2-3 no-shows por semana (espacio perdido)</li>
              <li>Mecánico interrumpe trabajo para contestar WhatsApp</li>
              <li>Autos listos sin recoger — cliente no sabe que ya está</li>
            </ul>
            <p className="mb-2 font-medium text-slate-900">
              Con Zenda (1 mes después):
            </p>
            <ul className="list-disc space-y-1 pl-6 text-slate-700 text-sm">
              <li>12-15 autos por día (mejor distribución de agenda)</li>
              <li>0-1 no-shows (recordatorios automáticos)</li>
              <li>Mecánico enfocado 100% en reparar</li>
              <li>Autos recogidos más rápido (aviso automático)</li>
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
              <strong>Configura tus servicios</strong> — aceite, frenos,
              revisión, etc. con duración
            </li>
            <li>
              <strong>Define tu horario</strong> — incluyendo sábados si
              trabajas
            </li>
            <li>
              <strong>Activa</strong> y empieza a recibir citas automáticamente
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
                ¿Funciona para talleres pequeños?
              </h3>
              <p className="text-slate-700">
                Sí, especialmente. Si eres tú solo o con 1-2 mecánicos,
                organizar la agenda es aún más importante. Zenda te ayuda a
                maximizar cada hora de trabajo.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-slate-900">
                ¿Puedo agregar varios mecánicos?
              </h3>
              <p className="text-slate-700">
                Sí. Puedes configurar cada mecánico con sus horarios y
                especialidades. Zenda asigna las citas automáticamente según
                disponibilidad.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-slate-900">
                ¿Qué pasa si el trabajo tarda más de lo esperado?
              </h3>
              <p className="text-slate-700">
                Puedes reagendar las citas afectadas desde tu panel. Los
                clientes reciben notificación automática con la nueva hora.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-slate-900">¿Cuánto cuesta?</h3>
              <p className="text-slate-700">
                Desde $29 USD/mes — menos de un cambio de aceite. Si evitas un
                solo no-show o un auto que ocupa espacio extra, ya pagó el plan.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-blue-200 bg-blue-50 p-8 text-center">
          <h2 className="mb-2 font-bold text-2xl text-blue-900">
            Organiza tu taller mecánico automáticamente
          </h2>
          <p className="mb-6 text-blue-700">
            Deja de perder tiempo contestando WhatsApp y organiza tu agenda.
            Prueba Zenda gratis.
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

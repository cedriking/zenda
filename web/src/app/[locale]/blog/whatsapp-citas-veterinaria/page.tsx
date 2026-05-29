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
  const slug = "whatsapp-citas-veterinaria";

  if (locale !== "es") {
    return {
      title:
        "Agendar Citas por WhatsApp en Clínica Veterinaria | Automatiza con Zenda",
      description:
        "Automatiza las citas de tu clínica veterinaria por WhatsApp. Agenda consultas, vacunas y cirugías 24/7 con recepcionista virtual.",
      robots: { index: false, follow: false },
      alternates: {
        canonical: `https://zenda.bot/es/blog/${slug}`,
      },
    };
  }

  return {
    title:
      "Agendar Citas por WhatsApp en Clínica Veterinaria | Automatiza con Zenda",
    description:
      "Automatiza las citas de tu clínica veterinaria por WhatsApp. Agenda consultas, vacunas y cirugías 24/7 con recepcionista virtual.",
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
      title: "Agendar Citas por WhatsApp en Clínica Veterinaria | Zenda",
      description:
        "Automatiza las citas de tu veterinaria por WhatsApp. Recepcionista virtual que agenda consultas y cirugías 24/7.",
      url: `https://zenda.bot/${locale}/blog/${slug}`,
      siteName: "Zenda",
      type: "article",
      locale: locale === "es" ? "es_MX" : "en_US",
    },
  };
}

export default function BlogCitasVeterinaria() {
  return (
    <>
      <Nav />
      <article className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="mb-4 font-bold text-3xl text-slate-900 tracking-tight sm:text-4xl">
          Cómo Agendar Citas por WhatsApp en tu Clínica Veterinaria (Guía 2025)
        </h1>
        <p className="mb-8 text-lg text-slate-600">
          Las clínicas veterinarias que automatizan sus citas por WhatsApp
          atienden más pacientes y reducen las cancelaciones. Descubre cómo
          hacerlo.
        </p>

        <section className="mb-10">
          <h2 className="mb-3 font-semibold text-2xl text-slate-900">
            ¿Por qué tu veterinaria necesita agendar por WhatsApp?
          </h2>
          <p className="mb-4 text-slate-700 leading-relaxed">
            Cuando la mascota de alguien se enferma, lo primero que hace el
            dueño es buscar en WhatsApp. Si tu clínica no responde rápido,
            buscan otra. Y si no respondes de noche o los domingos, pierdes
            clientes de emergencia.
          </p>
          <p className="mb-4 text-slate-700 leading-relaxed">
            Las veterinarias que automatizan citas por WhatsApp reportan:
          </p>
          <ul className="mb-4 list-disc space-y-2 pl-6 text-slate-700">
            <li>
              <strong>45% menos cancelaciones</strong> — recordatorios
              automáticos por WhatsApp
            </li>
            <li>
              <strong>30% más consultas</strong> — los dueños agendan cuando les
              conviene, no solo en horario de oficina
            </li>
            <li>
              <strong>Emergencias mejor gestionadas</strong> — el sistema
              clasifica urgencias y cita regular
            </li>
            <li>
              <strong>Triage automático</strong> — pregunta síntomas antes de la
              cita para que el vet esté preparado
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 font-semibold text-2xl text-slate-900">
            Los problemas de agendar manualmente en veterinaria
          </h2>
          <ul className="mb-4 list-disc space-y-2 pl-6 text-slate-700">
            <li>
              <strong>Consultas que se empalman</strong> — un perro con tos y un
              gato en la misma sala no es buena idea
            </li>
            <li>
              <strong>Vacunas atrasadas</strong> — el dueño olvida cuándo le
              toca la siguiente dosis
            </li>
            <li>
              <strong>El veterinario contesta WhatsApp</strong> — con guantes
              puestos, entre cirugías
            </li>
            <li>
              <strong>Emergencias sin atención</strong> — de noche o fines de
              semana no hay quien responda
            </li>
            <li>
              <strong>Historial perdido</strong> — "¿ya le pusimos la
              desparasitante?" y no hay registro
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 font-semibold text-2xl text-slate-900">
            Cómo funciona Zenda para clínicas veterinarias
          </h2>
          <ol className="mb-4 list-decimal space-y-3 pl-6 text-slate-700">
            <li>
              <strong>El dueño manda mensaje</strong> — "Mi perro no quiere
              comer, ¿puedo llevarlo?"
            </li>
            <li>
              <strong>Zenda pregunta el motivo</strong> — ¿consulta general,
              vacuna, urgencia, cirugía?
            </li>
            <li>
              <strong>Clasifica la urgencia</strong> — si es emergencia, avisa
              al veterinario inmediatamente
            </li>
            <li>
              <strong>Muestra horarios disponibles</strong> — el dueño elige
              cuándo le conviene
            </li>
            <li>
              <strong>Recordatorio</strong> — se envía 24h antes
            </li>
            <li>
              <strong>Seguimiento post-consulta</strong> — "¿Cómo sigue su
              mascota? Recuerde la próxima vacuna el..."
            </li>
          </ol>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 font-semibold text-2xl text-slate-900">
            Servicios veterinarios que puedes agendar
          </h2>
          <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-white p-3">
                <p className="font-medium text-slate-900">Consulta general</p>
                <p className="text-slate-600 text-sm">20-30 min</p>
              </div>
              <div className="rounded-lg bg-white p-3">
                <p className="font-medium text-slate-900">Vacunación</p>
                <p className="text-slate-600 text-sm">15-20 min</p>
              </div>
              <div className="rounded-lg bg-white p-3">
                <p className="font-medium text-slate-900">Esterilización</p>
                <p className="text-slate-600 text-sm">Cirugía (medio día)</p>
              </div>
              <div className="rounded-lg bg-white p-3">
                <p className="font-medium text-slate-900">Desparasitación</p>
                <p className="text-slate-600 text-sm">10-15 min</p>
              </div>
              <div className="rounded-lg bg-white p-3">
                <p className="font-medium text-slate-900">Urgencia</p>
                <p className="text-slate-600 text-sm">Variable</p>
              </div>
              <div className="rounded-lg bg-white p-3">
                <p className="font-medium text-slate-900">Estética canina</p>
                <p className="text-slate-600 text-sm">1-3 horas</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 font-semibold text-2xl text-slate-900">
            Casos de uso especiales
          </h2>
          <div className="space-y-4">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <h3 className="font-medium text-green-900">
                Recordatorio de vacunas
              </h3>
              <p className="mt-1 text-green-800 text-sm">
                Cuando un cachorro recibe su primera vacuna, Zenda programa
                automáticamente el recordatorio para la siguiente dosis. Los
                dueños reciben un mensaje 3 días antes: "Recuerde que a
                [nombre_mascota] le toca su refuerzo el viernes."
              </p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <h3 className="font-medium text-amber-900">
                Clasificación de emergencias
              </h3>
              <p className="mt-1 text-amber-800 text-sm">
                Si el dueño reporta síntomas graves (dificultad para respirar,
                sangrado, convulsiones), Zenda marca la cita como urgente y
                avisa al veterinario por teléfono de inmediato.
              </p>
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h3 className="font-medium text-blue-900">
                Post-consulta automática
              </h3>
              <p className="mt-1 text-blue-800 text-sm">
                48 horas después de la consulta, Zenda envía un mensaje: "¿Cómo
                sigue [nombre_mascota]? Si tiene alguna duda, puede responder
                este mensaje." Mejora la relación con el cliente sin esfuerzo.
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
              <strong>Configura servicios</strong> — consulta, vacunas,
              cirugías, estética
            </li>
            <li>
              <strong>Define horarios por veterinario</strong>
            </li>
            <li>
              <strong>Activa recordatorios</strong> para vacunas y seguimientos
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
                ¿Puedo separar perros y gatos en la agenda?
              </h3>
              <p className="text-slate-700">
                Sí. Puedes configurar bloques de tiempo específicos para cada
                tipo de animal, evitando que perros y gatos coincidan en la sala
                de espera.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-slate-900">
                ¿Funciona para emergencias fuera de horario?
              </h3>
              <p className="text-slate-700">
                Sí. Zenda responde 24/7. Para emergencias, puede enviar un
                mensaje automático con el número de la guardia o instrucciones
                de qué hacer.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-slate-900">
                ¿Puedo manejar varias veterinarias?
              </h3>
              <p className="text-slate-700">
                Sí. Cada ubicación tiene su propio workspace con agenda,
                servicios y personal independiente.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-slate-900">¿Cuánto cuesta?</h3>
              <p className="text-slate-700">
                Desde $29 USD/mes — menos de una consulta. Si una sola vacuna
                recordada automáticamente trae al cliente de vuelta, ya pagó el
                plan.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-blue-200 bg-blue-50 p-8 text-center">
          <h2 className="mb-2 font-bold text-2xl text-blue-900">
            Mejor atención para más mascotas
          </h2>
          <p className="mb-6 text-blue-700">
            Automatiza las citas de tu clínica veterinaria y enfócate en lo que
            más importa: tus pacientes.
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

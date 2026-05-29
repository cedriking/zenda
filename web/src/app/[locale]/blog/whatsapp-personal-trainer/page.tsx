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
  const slug = "whatsapp-personal-trainer";

  if (locale !== "es") {
    return {
      title:
        "Personal Trainer por WhatsApp: Agenda Sesiones Automáticamente | Zenda",
      description:
        "Automatiza las sesiones de tu servicio de personal trainer por WhatsApp. Agenda entrenamientos, confirma asistencia y envía rutinas automáticamente.",
      robots: { index: false, follow: false },
      alternates: {
        canonical: `https://zenda.bot/es/blog/${slug}`,
      },
    };
  }

  return {
    title:
      "Personal Trainer por WhatsApp: Agenda Sesiones Automáticamente | Zenda",
    description:
      "Automatiza las sesiones de tu servicio de personal trainer por WhatsApp. Agenda entrenamientos, confirma asistencia y envía rutinas automáticamente.",
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
      title: "Personal Trainer: Agenda Sesiones por WhatsApp | Zenda",
      description:
        "Agenda entrenamientos, confirma asistencia y envía rutinas automáticamente por WhatsApp. Recepcionista virtual para trainers.",
      url: `https://zenda.bot/${locale}/blog/${slug}`,
      siteName: "Zenda",
      type: "article",
      locale: locale === "es" ? "es_MX" : "en_US",
    },
  };
}

export default function BlogPersonalTrainer() {
  return (
    <>
      <Nav />
      <article className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="mb-4 font-bold text-3xl text-slate-900 tracking-tight sm:text-4xl">
          Cómo un Personal Trainer Puede Agendar Sesiones por WhatsApp (Guía
          2025)
        </h1>
        <p className="mb-8 text-lg text-slate-600">
          Los entrenadores personales que automatizan su agenda por WhatsApp
          tienen más clientes y menos cancelaciones. Descubre cómo hacerlo.
        </p>

        <section className="mb-10">
          <h2 className="mb-3 font-semibold text-2xl text-slate-900">
            ¿Por qué necesitas agendar por WhatsApp como personal trainer?
          </h2>
          <p className="mb-4 text-slate-700 leading-relaxed">
            Tus clientes te escriben a cualquier hora: "¿mañana a las 7?", "no
            puedo hoy, ¿jueves?", "¿me pasas la rutina de piernas?". Si estás
            entrenando a otro cliente, no puedes responder. Y si tardas horas,
            la motivación se les baja.
          </p>
          <p className="mb-4 text-slate-700 leading-relaxed">
            Los entrenadores que automatizan por WhatsApp reportan:
          </p>
          <ul className="mb-4 list-disc space-y-2 pl-6 text-slate-700">
            <li>
              <strong>40% menos cancelaciones</strong> — recordatorios
              automáticos y confirmación previa
            </li>
            <li>
              <strong>25% más clientes</strong> — capturan leads fuera de
              horario
            </li>
            <li>
              <strong>2 horas ahorradas al día</strong> — sin coordinar horarios
              manualmente
            </li>
            <li>
              <strong>Mejor retención</strong> — seguimiento automático cuando
              un cliente falla una sesión
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 font-semibold text-2xl text-slate-900">
            Los problemas de agendar sesiones manualmente
          </h2>
          <ul className="mb-4 list-disc space-y-2 pl-6 text-slate-700">
            <li>
              <strong>Estás con un cliente y no puedes contestar</strong> — los
              demás esperan y se desmotivan
            </li>
            <li>
              <strong>Citas que se empalman</strong> — anotas mal y llegan dos
              clientes a la misma hora
            </li>
            <li>
              <strong>Cancelaciones de última hora</strong> — el cliente avisa 5
              min antes y perdiste ese espacio
            </li>
            <li>
              <strong>No hay lista de espera</strong> — si alguien cancela,
              nadie ocupa su lugar
            </li>
            <li>
              <strong>Sin seguimiento</strong> — el cliente no viene desde hace
              2 semanas y nadie le escribe
            </li>
            <li>
              <strong>Coordinación grupal</strong> — las clases grupales son un
              caos de mensajes para confirmar quién va
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 font-semibold text-2xl text-slate-900">
            Cómo funciona Zenda para personal trainers
          </h2>
          <ol className="mb-4 list-decimal space-y-3 pl-6 text-slate-700">
            <li>
              <strong>El cliente manda mensaje</strong> — "Hola, quiero
              entrenar, ¿cuándo tienes?"
            </li>
            <li>
              <strong>Zenda pregunta el objetivo</strong> — ¿perder peso, ganar
              masa, rehabilitación, funcional?
            </li>
            <li>
              <strong>Muestra horarios disponibles</strong> — el cliente elige
              el que le convenga
            </li>
            <li>
              <strong>Confirma la sesión</strong> — con fecha, hora y tipo de
              entrenamiento
            </li>
            <li>
              <strong>Recordatorio</strong> — se envía 24h antes y 2h antes
            </li>
            <li>
              <strong>Si cancela</strong> — avisa automáticamente al siguiente
              en lista de espera
            </li>
            <li>
              <strong>Seguimiento post-sesión</strong> — "¿Cómo te sentiste?
              Recuerda hidratarte y descansar."
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
                <p className="font-medium text-slate-900">Personal 1-a-1</p>
                <p className="text-slate-600 text-sm">45-60 min</p>
              </div>
              <div className="rounded-lg bg-white p-3">
                <p className="font-medium text-slate-900">Pareja / Duo</p>
                <p className="text-slate-600 text-sm">60 min</p>
              </div>
              <div className="rounded-lg bg-white p-3">
                <p className="font-medium text-slate-900">Grupal (3-8)</p>
                <p className="text-slate-600 text-sm">45-60 min</p>
              </div>
              <div className="rounded-lg bg-white p-3">
                <p className="font-medium text-slate-900">Evaluación inicial</p>
                <p className="text-slate-600 text-sm">30-45 min</p>
              </div>
              <div className="rounded-lg bg-white p-3">
                <p className="font-medium text-slate-900">Online / Virtual</p>
                <p className="text-slate-600 text-sm">45 min (videollamada)</p>
              </div>
              <div className="rounded-lg bg-white p-3">
                <p className="font-medium text-slate-900">Plan de nutrición</p>
                <p className="text-slate-600 text-sm">30 min (consulta)</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 font-semibold text-2xl text-slate-900">
            Funcionalidades especiales para trainers
          </h2>
          <div className="space-y-4">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <h3 className="font-medium text-green-900">
                Lista de espera automática
              </h3>
              <p className="mt-1 text-green-800 text-sm">
                Cuando un cliente cancela, Zenda avisa automáticamente al
                siguiente en lista de espera: "Se liberó un espacio mañana a las
                7am. ¿Te interesa?" Maximizas cada espacio en tu agenda.
              </p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <h3 className="font-medium text-amber-900">
                Seguimiento de inactividad
              </h3>
              <p className="mt-1 text-amber-800 text-sm">
                Si un cliente no entrena en 5 días, Zenda le envía un mensaje:
                "Hace tiempo que no entrenamos. ¿Todo bien? Si necesitas
                reagendar, dime cuándo te viene." Recuperas clientes que de otra
                forma se perderían.
              </p>
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h3 className="font-medium text-blue-900">
                Envío de rutinas post-sesión
              </h3>
              <p className="mt-1 text-blue-800 text-sm">
                Después de cada sesión, Zenda puede enviar automáticamente la
                rutina del día o ejercicios de recuperación. El cliente siente
                atención personalizada sin que tengas que escribirlo cada vez.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 font-semibold text-2xl text-slate-900">
            Ejemplo: Trainer "FitLife"
          </h2>
          <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-6">
            <p className="mb-2 font-medium text-slate-900">Antes de Zenda:</p>
            <ul className="mb-4 list-disc space-y-1 pl-6 text-slate-700 text-sm">
              <li>12-15 sesiones semanales, agenda en notas del celular</li>
              <li>3-4 cancelaciones por semana (espacio perdido)</li>
              <li>Trainer interrumpido durante sesiones por mensajes</li>
              <li>Clientes inactivos sin seguimiento</li>
            </ul>
            <p className="mb-2 font-medium text-slate-900">
              Con Zenda (1 mes después):
            </p>
            <ul className="list-disc space-y-1 pl-6 text-slate-700 text-sm">
              <li>18-22 sesiones semanales (lista de espera llena huecos)</li>
              <li>1-2 cancelaciones (recordatorios + confirmación)</li>
              <li>Trainer 100% enfocado en el cliente presente</li>
              <li>Clientes inactivos reciben seguimiento automático</li>
              <li>Nuevos clientes captados fuera de horario (24/7)</li>
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
              <strong>Configura tus servicios</strong> — personal, duo, grupal,
              online, evaluación
            </li>
            <li>
              <strong>Define tu horario</strong> — incluyendo fines de semana si
              entrenas
            </li>
            <li>
              <strong>Activa lista de espera</strong> y seguimiento de
              inactividad
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
                ¿Funciona para trainers que van a domicilio?
              </h3>
              <p className="text-slate-700">
                Sí. Puedes configurar zonas de cobertura y horarios por zona.
                Zenda muestra disponibilidad según la ubicación del cliente.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-slate-900">
                ¿Puedo manejar paquetes (8 sesiones, 12 sesiones)?
              </h3>
              <p className="text-slate-700">
                Sí. Configuras paquetes y Zenda lleva el conteo de sesiones
                usadas. Cuando quedan 2, avisa automáticamente para renovar.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-slate-900">
                ¿Y si entreno en un gimnasio?
              </h3>
              <p className="text-slate-700">
                Perfecto. Tus clientes agendan por WhatsApp contigo, no con el
                gimnasio. Zenda es tu agenda personal, independiente del lugar
                donde entrenes.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-slate-900">¿Cuánto cuesta?</h3>
              <p className="text-slate-700">
                Desde $29 USD/mes — menos de lo que cobras por una sesión. Si
                recuperas un solo cliente que iba a cancelar su paquete, ya pagó
                el plan completo.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-blue-200 bg-blue-50 p-8 text-center">
          <h2 className="mb-2 font-bold text-2xl text-blue-900">
            Más clientes, menos cancelaciones, mejor seguimiento
          </h2>
          <p className="mb-6 text-blue-700">
            Automatiza tu agenda de personal trainer por WhatsApp y enfócate en
            transformar vidas.
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

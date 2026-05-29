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
  const slug = "whatsapp-reservaciones-restaurante";

  if (locale !== "es") {
    return {
      title:
        "Reservaciones por WhatsApp para Restaurantes | Automatiza con Zenda",
      description:
        "Automatiza las reservaciones de tu restaurante por WhatsApp. Confirma mesas, maneja listas de espera y envía menú automáticamente.",
      robots: { index: false, follow: false },
      alternates: {
        canonical: `https://zenda.bot/es/blog/${slug}`,
      },
    };
  }

  return {
    title:
      "Reservaciones por WhatsApp para Restaurantes | Automatiza con Zenda",
    description:
      "Automatiza las reservaciones de tu restaurante por WhatsApp. Confirma mesas, maneja listas de espera y envía menú automáticamente.",
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
      title: "Reservaciones por WhatsApp para Restaurantes | Zenda",
      description:
        "Toma reservaciones, confirma mesas y maneja listas de espera automáticamente por WhatsApp. Recepcionista virtual para restaurantes.",
      url: `https://zenda.bot/${locale}/blog/${slug}`,
      siteName: "Zenda",
      type: "article",
      locale: locale === "es" ? "es_MX" : "en_US",
    },
  };
}

export default function BlogReservacionesRestaurante() {
  return (
    <>
      <Nav />
      <article className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="mb-4 font-bold text-3xl text-slate-900 tracking-tight sm:text-4xl">
          Cómo Tomar Reservaciones por WhatsApp en tu Restaurante (Guía 2025)
        </h1>
        <p className="mb-8 text-lg text-slate-600">
          Los restaurantes que automatizan sus reservaciones por WhatsApp llenan
          más mesas y reducen los no-shows. Descubre cómo hacerlo.
        </p>

        <section className="mb-10">
          <h2 className="mb-3 font-semibold text-2xl text-slate-900">
            ¿Por qué tu restaurante necesita reservaciones por WhatsApp?
          </h2>
          <p className="mb-4 text-slate-700 leading-relaxed">
            La gente quiere reservar cuando se le antoja — domingo a las 10pm,
            mientras ven una review en Instagram. Si solo aceptas llamadas,
            pierdes esas reservas impulsivas. Y si la persona no encuentra dónde
            comer, va a otro lado.
          </p>
          <p className="mb-4 text-slate-700 leading-relaxed">
            Los restaurantes que automatizan reservaciones por WhatsApp
            reportan:
          </p>
          <ul className="mb-4 list-disc space-y-2 pl-6 text-slate-700">
            <li>
              <strong>30% más reservaciones</strong> — capturan la demanda fuera
              de horario
            </li>
            <li>
              <strong>45% menos no-shows</strong> — confirmación + recordatorio
              por WhatsApp
            </li>
            <li>
              <strong>Mejor rotación de mesas</strong> — control automático de
              tiempos por mesa
            </li>
            <li>
              <strong>Menos estrés en host</strong> — el teléfono no suena cada
              minuto
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 font-semibold text-2xl text-slate-900">
            Los problemas de las reservaciones manuales
          </h2>
          <ul className="mb-4 list-disc space-y-2 pl-6 text-slate-700">
            <li>
              <strong>El teléfono suena en hora pico</strong> — el host está
              acomodando gente y no puede contestar
            </li>
            <li>
              <strong>Reservaciones que se empalman</strong> — la misma mesa
              reservada dos veces
            </li>
            <li>
              <strong>Mesas vacías por no-shows</strong> — reservaron para 8pm,
              nunca llegaron, y esa mesa se perdió
            </li>
            <li>
              <strong>No saben cuántos son</strong> — "somos 4" pero llegan 7
            </li>
            <li>
              <strong>Preguntas repetitivas</strong> — "¿cuál es el menú?",
              "¿tienen estacionamiento?", "¿aceptan mascotas?"
            </li>
            <li>
              <strong>Grupos grandes sin planear</strong> — quieren mesa para 15
              personas para hoy
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 font-semibold text-2xl text-slate-900">
            Cómo funciona Zenda para restaurantes
          </h2>
          <ol className="mb-4 list-decimal space-y-3 pl-6 text-slate-700">
            <li>
              <strong>El cliente manda mensaje</strong> — "Hola, ¿tienen mesa
              para 4 hoy a las 8?"
            </li>
            <li>
              <strong>Zenda verifica disponibilidad</strong> — muestra las horas
              con mesas disponibles
            </li>
            <li>
              <strong>Confirma número de personas</strong> — ajusta la mesa
              según el grupo
            </li>
            <li>
              <strong>Reserva la mesa</strong> — con fecha, hora y número de
              comensales
            </li>
            <li>
              <strong>Envía menú y detalles</strong> — ubicación,
              estacionamiento, política de cancelación
            </li>
            <li>
              <strong>Recordatorio</strong> — 24h antes y 3h antes con
              confirmación
            </li>
            <li>
              <strong>Si cancela o no confirma</strong> — libera la mesa y avisa
              a la lista de espera
            </li>
          </ol>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 font-semibold text-2xl text-slate-900">
            Tipos de reservaciones que puedes manejar
          </h2>
          <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-white p-3">
                <p className="font-medium text-slate-900">Cena regular</p>
                <p className="text-slate-600 text-sm">2-8 personas, 1.5-2h</p>
              </div>
              <div className="rounded-lg bg-white p-3">
                <p className="font-medium text-slate-900">Grupo grande</p>
                <p className="text-slate-600 text-sm">9-20 personas, evento</p>
              </div>
              <div className="rounded-lg bg-white p-3">
                <p className="font-medium text-slate-900">Terraza / Jardín</p>
                <p className="text-slate-600 text-sm">Sujeto a clima</p>
              </div>
              <div className="rounded-lg bg-white p-3">
                <p className="font-medium text-slate-900">Área privada</p>
                <p className="text-slate-600 text-sm">Evento cerrado</p>
              </div>
              <div className="rounded-lg bg-white p-3">
                <p className="font-medium text-slate-900">Cumpleaños</p>
                <p className="text-slate-600 text-sm">Pastel + decoración</p>
              </div>
              <div className="rounded-lg bg-white p-3">
                <p className="font-medium text-slate-900">Celebración</p>
                <p className="text-slate-600 text-sm">Aniversario, promoción</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 font-semibold text-2xl text-slate-900">
            Funcionalidades especiales para restaurantes
          </h2>
          <div className="space-y-4">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <h3 className="font-medium text-green-900">
                Confirmación en dos pasos
              </h3>
              <p className="mt-1 text-green-800 text-sm">
                Reservación → Confirmación 24h antes → Confirmación 3h antes. Si
                no confirman en el último mensaje, la mesa se libera
                automáticamente y se notifica a la lista de espera. Cero mesas
                vacías por no-shows.
              </p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <h3 className="font-medium text-amber-900">
                Envío automático de menú
              </h3>
              <p className="mt-1 text-amber-800 text-sm">
                Al confirmar la reservación, Zenda envía el enlace al menú
                digital. Los clientes llegan sabiendo qué pedir, la mesa se
                libera más rápido, y la rotación mejora.
              </p>
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h3 className="font-medium text-blue-900">
                Gestión de lista de espera inteligente
              </h3>
              <p className="mt-1 text-blue-800 text-sm">
                Cuando no hay mesas disponibles, Zenda ofrece la lista de
                espera. Si una mesa se libera por cancelación, avisa
                automáticamente al siguiente en la lista. Maximizas la ocupación
                sin sobrebooking.
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
              <strong>Configura tus mesas</strong> — capacidad por zona,
              duración por tipo de reserva
            </li>
            <li>
              <strong>Define tus horarios</strong> — almuerzo, comida, cena,
              brunch
            </li>
            <li>
              <strong>Sube tu menú digital</strong> — enlace para envío
              automático
            </li>
            <li>
              <strong>Activa la lista de espera</strong> y los recordatorios
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
                ¿Puedo limitar las reservaciones por zona?
              </h3>
              <p className="text-slate-700">
                Sí. Configuras la capacidad por zona (terraza, interior, barra)
                y Zenda muestra disponibilidad real. Si la terraza está llena,
                solo muestra opciones en interior.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-slate-900">
                ¿Funciona con pedidos a domicilio?
              </h3>
              <p className="text-slate-700">
                Zenda se especializa en reservaciones presenciales. Para pedidos
                a domicilio, puedes integrarlo con tu sistema actual.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-slate-900">
                ¿Qué pasa si alguien quiere cambiar su reservación?
              </h3>
              <p className="text-slate-700">
                El cliente puede reagendar o cancelar directamente por WhatsApp.
                Zenda actualiza la disponibilidad automáticamente y notifica a
                la lista de espera si aplica.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-slate-900">¿Cuánto cuesta?</h3>
              <p className="text-slate-700">
                Desde $29 USD/mes — menos de lo que genera una mesa en una
                noche. Si evitas un solo no-show de un grupo de 4, ya pagó el
                plan.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-blue-200 bg-blue-50 p-8 text-center">
          <h2 className="mb-2 font-bold text-2xl text-blue-900">
            Más mesas llenas, menos no-shows
          </h2>
          <p className="mb-6 text-blue-700">
            Automatiza las reservaciones de tu restaurante por WhatsApp y
            enfócate en dar la mejor experiencia.
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

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
  const slug = "whatsapp-citas-abogado";
  return {
    title:
      "Agendar Citas por WhatsApp para Abogados | Automatiza tu Despacho con Zenda",
    description:
      "Automatiza las consultas de tu despacho jurídico por WhatsApp. Agenda citas, califica casos y envía recordatorios automáticamente.",
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
      title: "Citas por WhatsApp para Abogados | Zenda",
      description:
        "Agenda consultas jurídicas, califica casos y envía recordatorios automáticamente por WhatsApp. Recepcionista virtual para despachos.",
      url: `https://zenda.bot/${locale}/blog/${slug}`,
      siteName: "Zenda",
      type: "article",
      locale: locale === "es" ? "es_MX" : "en_US",
    },
  };
}

export default function BlogCitasAbogado() {
  return (
    <>
      <Nav />
      <article className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="mb-4 font-bold text-3xl text-slate-900 tracking-tight sm:text-4xl">
          Cómo Agendar Consultas por WhatsApp en tu Despacho de Abogados (Guía
          2025)
        </h1>
        <p className="mb-8 text-lg text-slate-600">
          Los abogados que responden rápido por WhatsApp capturan más casos.
          Descubre cómo automatizar consultas, calificar prospectos y coordinar
          citas sin secretaria dedicada.
        </p>

        <section className="mb-10">
          <h2 className="mb-3 font-semibold text-2xl text-slate-900">
            ¿Por qué tu despacho jurídico necesita WhatsApp automatizado?
          </h2>
          <p className="mb-4 text-slate-700 leading-relaxed">
            Cuando alguien tiene un problema legal, busca ayuda de inmediato. El
            primer abogado que le responda probablemente se quede con el caso.
            Si no contestas porque estás en audiencia, ese cliente se va con
            quien sí respondió.
          </p>
          <p className="mb-4 text-slate-700 leading-relaxed">
            Los despachos jurídicos que automatizan su atención por WhatsApp
            reportan:
          </p>
          <ul className="mb-4 list-disc space-y-2 pl-6 text-slate-700">
            <li>
              <strong>50% más consultas agendadas</strong> — respuesta inmediata
              24/7
            </li>
            <li>
              <strong>Solo casos calificados</strong> — filtra antes de la cita
              presencial
            </li>
            <li>
              <strong>35% menos citas perdidas</strong> — recordatorios
              automáticos
            </li>
            <li>
              <strong>2-3 horas ahorradas al día</strong> — sin responder
              consultas básicas manualmente
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 font-semibold text-2xl text-slate-900">
            Los problemas de agendar consultas manualmente
          </h2>
          <ul className="mb-4 list-disc space-y-2 pl-6 text-slate-700">
            <li>
              <strong>Estás en audiencia y no puedes contestar</strong> — el
              prospecto con urgencia busca otro abogado
            </li>
            <li>
              <strong>Consultas que no son tu especialidad</strong> — pierdes 30
              min en una cita de familia cuando tú haces corporativo
            </li>
            <li>
              <strong>Clientes que no llegan</strong> — agendaron pero nunca
              aparecieron
            </li>
            <li>
              <strong>Falta de información previa</strong> — el cliente llega
              sin documentos y hay que re-agendar
            </li>
            <li>
              <strong>Consultas gratis que no convierten</strong> — gente que
              solo quiere "un consejo rápido"
            </li>
            <li>
              <strong>Secretaria abrumada</strong> — entre llamadas, WhatsApp y
              correo, algo se cae
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 font-semibold text-2xl text-slate-900">
            Cómo funciona Zenda para despachos jurídicos
          </h2>
          <ol className="mb-4 list-decimal space-y-3 pl-6 text-slate-700">
            <li>
              <strong>El prospecto manda mensaje</strong> — "Necesito un abogado
              laboral, me despidieron injustificadamente"
            </li>
            <li>
              <strong>Zenda pregunta el área legal</strong> — ¿civil, penal,
              laboral, familia, mercantil, migratorio?
            </li>
            <li>
              <strong>Califica el caso</strong> — pregunta detalles básicos para
              que el abogado sepa de qué se trata antes de la cita
            </li>
            <li>
              <strong>Muestra horarios disponibles</strong> — según el abogado
              especialista en esa área
            </li>
            <li>
              <strong>Solicita documentos previos</strong> — "Para su consulta,
              favor de traer: contrato, finiquito, constancias..."
            </li>
            <li>
              <strong>Recordatorio</strong> — 24h antes con dirección, hora y
              documentos requeridos
            </li>
            <li>
              <strong>Seguimiento post-consulta</strong> — "Gracias por su
              visita. Si tiene dudas adicionales, puede responder este mensaje."
            </li>
          </ol>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 font-semibold text-2xl text-slate-900">
            Áreas legales que puedes gestionar
          </h2>
          <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-white p-3">
                <p className="font-medium text-slate-900">Derecho laboral</p>
                <p className="text-slate-600 text-sm">Despidos, contratos</p>
              </div>
              <div className="rounded-lg bg-white p-3">
                <p className="font-medium text-slate-900">Derecho familiar</p>
                <p className="text-slate-600 text-sm">Divorcios, custodia</p>
              </div>
              <div className="rounded-lg bg-white p-3">
                <p className="font-medium text-slate-900">Derecho penal</p>
                <p className="text-slate-600 text-sm">Defensa, asesoría</p>
              </div>
              <div className="rounded-lg bg-white p-3">
                <p className="font-medium text-slate-900">Derecho mercantil</p>
                <p className="text-slate-600 text-sm">Contratos, empresas</p>
              </div>
              <div className="rounded-lg bg-white p-3">
                <p className="font-medium text-slate-900">Derecho migratorio</p>
                <p className="text-slate-600 text-sm">Visas, residencia</p>
              </div>
              <div className="rounded-lg bg-white p-3">
                <p className="font-medium text-slate-900">Derecho civil</p>
                <p className="text-slate-600 text-sm">Herencias, propiedades</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 font-semibold text-2xl text-slate-900">
            Funcionalidades especiales para abogados
          </h2>
          <div className="space-y-4">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <h3 className="font-medium text-green-900">
                Calificación de casos automática
              </h3>
              <p className="mt-1 text-green-800 text-sm">
                Antes de agendar, Zenda pregunta: tipo de caso, urgencia,
                presupuesto estimado, y si ya tiene documentos. Solo agenda la
                cita si el caso encaja en tu especialidad. Ahoras tiempo en
                consultas que no van a convertir.
              </p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <h3 className="font-medium text-amber-900">
                Lista de documentos pre-consulta
              </h3>
              <p className="mt-1 text-amber-800 text-sm">
                Según el área legal, Zenda envía automáticamente la lista de
                documentos que el cliente debe traer. Para divorcio: acta de
                matrimonio, identificaciones, comprobantes. Llega preparado, sin
                re-agendar por papeles faltantes.
              </p>
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h3 className="font-medium text-blue-900">
                Derivación entre abogados del despacho
              </h3>
              <p className="mt-1 text-blue-800 text-sm">
                Si el caso es de familia pero el cliente contactó al abogado
                penalista, Zenda lo deriva automáticamente al especialista
                correcto. Cada abogado ve solo los casos de su área.
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
              <strong>Configura tus áreas legales</strong> — especialidades,
              horarios por abogado
            </li>
            <li>
              <strong>Define preguntas de calificación</strong> por área
            </li>
            <li>
              <strong>Configura documentos requeridos</strong> para cada tipo de
              consulta
            </li>
            <li>
              <strong>Activa recordatorios</strong> y seguimiento post-consulta
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
                ¿Es confidencial la información?
              </h3>
              <p className="text-slate-700">
                Zenda solo recopila información básica para agendar. Los
                detalles del caso se discuten en la consulta presencial. No
                almacena información privilegiada del caso.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-slate-900">
                ¿Puedo cobrar la consulta desde WhatsApp?
              </h3>
              <p className="text-slate-700">
                Puedes configurar que Zenda informe el costo de la consulta y
                las formas de pago. El cobro se gestiona directamente con el
                cliente.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-slate-900">
                ¿Funciona para abogados independientes?
              </h3>
              <p className="text-slate-700">
                Especialmente. Si no tienes secretaria, Zenda es tu
                recepcionista virtual que nunca descansa. Responde, califica y
                agenda por ti.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-slate-900">¿Cuánto cuesta?</h3>
              <p className="text-slate-700">
                Desde $29 USD/mes — una sola consulta que antes se perdía paga
                varios meses de Zenda. Si capturas un caso adicional al mes, el
                retorno es inmediato.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-blue-200 bg-blue-50 p-8 text-center">
          <h2 className="mb-2 font-bold text-2xl text-blue-900">
            Más consultas, mejor calificadas
          </h2>
          <p className="mb-6 text-blue-700">
            Automatiza tu despacho jurídico por WhatsApp y enfócate en ganar
            casos, no en contestar mensajes.
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

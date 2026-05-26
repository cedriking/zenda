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
  const slug = "reducir-ausencias-clinica";
  return {
    title:
      "Como Reducir Ausencias en tu Clínica con Recordatorios WhatsApp | Zenda",
    description:
      "Aprende a reducir hasta 40% las ausencias en clínicas médicas, dentales y de terapia con recordatorios automáticos por WhatsApp. Guía práctica con pasos concretos.",
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
      title: "Como Reducir Ausencias en tu Clínica con Recordatorios WhatsApp",
      description:
        "Reduce hasta 40% las ausencias con recordatorios automáticos por WhatsApp.",
      url: `https://zenda.bot/${locale}/blog/${slug}`,
      type: "article",
    },
  };
}

export default function ReducirAusenciasBlogPage() {
  return (
    <div className="min-h-screen bg-white">
      <Nav variant="simple" />

      <article className="mx-auto max-w-3xl px-6 py-16">
        <header className="mb-12">
          <p className="mb-3 font-semibold text-emerald-600 text-sm uppercase tracking-wide">
            Guía para Clínicas
          </p>
          <h1 className="mb-4 font-bold text-3xl text-slate-900 leading-tight md:text-4xl">
            Como Reducir Ausencias en tu Clínica con Recordatorios WhatsApp
          </h1>
          <p className="text-slate-500">
            Las ausencias cuestan dinero. Aprende a reducir hasta 40% con
            automatización.
          </p>
        </header>

        <section className="mb-10">
          <p className="mb-4 text-lg text-slate-700 leading-relaxed">
            Si administras una clínica médica, dental, de terapia o cualquier
            consultorio, las ausencias son uno de tus mayores problemas. Un
            paciente que no llega no solo pierdes la cita — pierdes ingresos y
            dejas a otro paciente sin atención.
          </p>
          <p className="mb-4 text-slate-700 leading-relaxed">
            La solución más efectiva y económica:{" "}
            <strong>recordatorios automáticos por WhatsApp</strong>.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            Cuanto te cuestan las ausencias
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-slate-200 border-b">
                  <th className="py-3 pr-4 text-left font-semibold text-slate-600">
                    Métrica
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">
                    Sin recordatorios
                  </th>
                  <th className="py-3 pl-4 text-left font-semibold text-emerald-600">
                    Con Zenda
                  </th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                <tr className="border-slate-100 border-b">
                  <td className="py-3 pr-4 font-medium">Tasa de ausencia</td>
                  <td className="px-4 py-3 text-slate-500">15-30%</td>
                  <td className="py-3 pl-4 font-medium text-emerald-600">
                    5-10%
                  </td>
                </tr>
                <tr className="border-slate-100 border-b">
                  <td className="py-3 pr-4 font-medium">
                    Ingresos perdidos/mes
                  </td>
                  <td className="px-4 py-3 text-slate-500">$500-$2,000 USD</td>
                  <td className="py-3 pl-4 font-medium text-emerald-600">
                    $50-$200 USD
                  </td>
                </tr>
                <tr className="border-slate-100 border-b">
                  <td className="py-3 pr-4 font-medium">Tiempo gestionando</td>
                  <td className="px-4 py-3 text-slate-500">1-2 horas/día</td>
                  <td className="py-3 pl-4 font-medium text-emerald-600">
                    10 minutos/día
                  </td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium">Disponibilidad</td>
                  <td className="px-4 py-3 text-slate-500">Horario laboral</td>
                  <td className="py-3 pl-4 font-medium text-emerald-600">
                    24/7
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            5 estrategias para reducir ausencias
          </h2>
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
              <h3 className="mb-2 font-bold text-slate-900">
                1. Recordatorio 24 horas antes
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                El recordatorio más importante. Un mensaje simple por WhatsApp
                24 horas antes de la cita reduce ausencias hasta 25%. Incluye
                fecha, hora, profesional y un botón para confirmar o reagendar.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
              <h3 className="mb-2 font-bold text-slate-900">
                2. Recordatorio 2 horas antes
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Un segundo recordatorio corto el día de la cita. Muchas personas
                olvidan citas agendadas con semanas de anticipación. Este
                segundo toque captura los olvidadizos.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
              <h3 className="mb-2 font-bold text-slate-900">
                3. Confirmación bidireccional
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                No solo envíes — pide confirmación. Si el paciente confirma, la
                probabilidad de que asista sube al 95%. Si no confirma, puedes
                ofrecer esa hora a otro paciente.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
              <h3 className="mb-2 font-bold text-slate-900">
                4. Reagendar automáticamente
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Cuando un paciente cancela, Zenda ofrece automáticamente esa
                hora a pacientes en lista de espera. Así nunca pierdes una hora
                vacía.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
              <h3 className="mb-2 font-bold text-slate-900">
                5. Disponibilidad 24/7
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Muchos pacientes quieren agendar fuera de horario — en la noche,
                fines de semana. Si no contestas, se van a otra clínica. Zenda
                contesta y agenda automáticamente a cualquier hora.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-bold text-2xl text-slate-900">
            Tipos de clínicas que se benefician
          </h2>
          <ul className="space-y-2 text-slate-700">
            <li>
              <strong>Clínicas médicas:</strong> Consultas generales,
              especialidades, telemedicina
            </li>
            <li>
              <strong>Dentistas:</strong> Limpiezas, ortodoncia, cirugías,
              urgencias
            </li>
            <li>
              <strong>Terapia y psicología:</strong> Sesiones regulares que
              requieren alta asistencia
            </li>
            <li>
              <strong>Fisioterapia:</strong> Tratamientos con citas frecuentes
              (2-3 por semana)
            </li>
            <li>
              <strong>Cosmiatría y estética:</strong> Tratamientos faciales,
              láser, peelings
            </li>
            <li>
              <strong>Nutrición:</strong> Consultas de seguimiento mensual o
              quincenal
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="mb-6 font-bold text-2xl text-slate-900">
            Preguntas Frecuentes
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900">
                Los recordatorios por WhatsApp funcionan mejor que SMS?
              </h3>
              <p className="mt-1 text-slate-600 text-sm">
                Si. WhatsApp tiene una tasa de apertura del 98% vs 82% de SMS.
                Además es más barato y permite confirmar con un solo toque.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">
                Es difícil configurar?
              </h3>
              <p className="mt-1 text-slate-600 text-sm">
                No. Con Zenda descargas la app, conectas tu WhatsApp Business y
                listo. Los recordatorios se envían automáticamente según las
                citas agendadas.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">
                Funciona con calendarios externos?
              </h3>
              <p className="mt-1 text-slate-600 text-sm">
                Zenda tiene su propio calendario integrado. Puedes configurar
                horarios por profesional, duración de citas y descansos.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-slate-900 p-8 text-center">
          <h2 className="mb-3 font-bold text-2xl text-white">
            Reduce ausencias desde hoy
          </h2>
          <p className="mb-6 text-slate-400">
            14 días gratis. Sin tarjeta de crédito. Funciona con tu WhatsApp
            actual.
          </p>
          <Link
            className="inline-block rounded-full bg-emerald-500 px-8 py-3 font-semibold text-white transition-colors hover:bg-emerald-600"
            href="/founding"
          >
            Comenzar prueba gratis
          </Link>
        </section>
      </article>

      <Footer />
    </div>
  );
}

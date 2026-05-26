import { DollarSign, Handshake, LineChart, Users } from "lucide-react";
import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { PartnerSignupForm } from "@/components/partner-signup-form";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export function generateMetadata(): Metadata {
  return {
    title: "Programa de Partners — Zenda | Gana con cada referencia",
    description:
      "Únete al programa de partners de Zenda. Gana 20% de comisión por cada cliente que refieras. Ideal para desarrolladores web, community managers y consultores en LATAM.",
    alternates: {
      canonical: "https://zenda.bot/es/partners",
    },
    openGraph: {
      title: "Programa de Partners — Zenda",
      description:
        "Gana 20% de comisión refiriendo clientes a Zenda. WhatsApp + IA para negocios.",
      url: "https://zenda.bot/es/partners",
      type: "website",
    },
  };
}

export default async function PartnersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;
  return (
    <div className="min-h-screen bg-white">
      <Nav variant="simple" />

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pt-16 pb-12 text-center">
        <p className="mb-4 font-semibold text-emerald-600 text-sm uppercase tracking-wide">
          Programa de Partners
        </p>
        <h1 className="mb-4 font-bold text-3xl text-slate-900 leading-tight md:text-4xl">
          Gana dinero refiriendo clientes a Zenda
        </h1>
        <p className="mx-auto mb-8 max-w-xl text-slate-600">
          ¿Eres desarrollador web, community manager o consultor en LATAM? Gana
          un 20% de comisión recurrente por cada negocio que refieras a Zenda.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/signup">
            <Button className="rounded-full bg-emerald-600 px-8 py-3 font-semibold text-base text-white hover:bg-emerald-700">
              Quiero ser partner
            </Button>
          </Link>
          <Link href="/founding">
            <Button
              className="rounded-full px-8 py-3 text-base"
              variant="outline"
            >
              Ver producto
            </Button>
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="mb-10 text-center font-bold text-2xl text-slate-900">
            Cómo funciona
          </h2>
          <div className="grid gap-8 md:grid-cols-4">
            {[
              {
                icon: Users,
                step: "1",
                title: "Regístrate",
                desc: "Crea tu cuenta de partner con tu enlace único de referido.",
              },
              {
                icon: Handshake,
                step: "2",
                title: "Refiere clientes",
                desc: "Comparte tu enlace con negocios de citas: dentistas, salones, spas.",
              },
              {
                icon: DollarSign,
                step: "3",
                title: "Ellos se registran",
                desc: "Tu referido se registra con tu enlace y activa su cuenta.",
              },
              {
                icon: LineChart,
                step: "4",
                title: "Tú ganas",
                desc: "Recibes 20% de comisión mensual mientras el cliente siga activo.",
              },
            ].map((item) => (
              <div
                className="rounded-xl border border-slate-200 bg-white p-6 text-center"
                key={item.step}
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                  <item.icon className="h-6 w-6 text-emerald-600" />
                </div>
                <p className="mb-1 font-bold text-emerald-600 text-sm">
                  Paso {item.step}
                </p>
                <h3 className="mb-2 font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="text-slate-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Earnings example */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="mb-8 font-bold text-2xl text-slate-900">
            Ejemplo de ganancias
          </h2>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-600">
                    Clientes referidos
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-600">
                    Plan promedio
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-600">
                    Tu comisión/mes
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-600">
                    Tu comisión/año
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="px-4 py-3 text-slate-800">5 clientes</td>
                  <td className="px-4 py-3 text-slate-600">$49 USD/mes</td>
                  <td className="px-4 py-3 font-semibold text-emerald-600">
                    $49 USD
                  </td>
                  <td className="px-4 py-3 font-semibold text-emerald-600">
                    $588 USD
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-slate-800">15 clientes</td>
                  <td className="px-4 py-3 text-slate-600">$49 USD/mes</td>
                  <td className="px-4 py-3 font-semibold text-emerald-600">
                    $147 USD
                  </td>
                  <td className="px-4 py-3 font-semibold text-emerald-600">
                    $1,764 USD
                  </td>
                </tr>
                <tr className="bg-emerald-50">
                  <td className="px-4 py-3 text-slate-800">50 clientes</td>
                  <td className="px-4 py-3 text-slate-600">$49 USD/mes</td>
                  <td className="px-4 py-3 font-bold text-emerald-600">
                    $490 USD
                  </td>
                  <td className="px-4 py-3 font-bold text-emerald-600">
                    $5,880 USD
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-slate-400 text-xs">
            * Comisión del 20% sobre el plan que elija el cliente. Pagos
            mensuales mientras el cliente esté activo.
          </p>
        </div>
      </section>

      {/* Who is this for */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-8 text-center font-bold text-2xl text-slate-900">
            ¿Para quién es este programa?
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Desarrolladores web",
                desc: "Ofrece Zenda como servicio adicional a tus clientes. Instalación + configuración como upsell.",
              },
              {
                title: "Community managers",
                desc: "Tus clientes ya están en WhatsApp. Zenda los ayuda a automatizar citas mientras tú gestionas su contenido.",
              },
              {
                title: "Consultores de negocios",
                desc: "Recomienda Zenda a tus clientes como solución de automatización. Ingreso recurrente sin trabajo adicional.",
              },
            ].map((item) => (
              <div
                className="rounded-xl border border-slate-200 bg-white p-6"
                key={item.title}
              >
                <h3 className="mb-2 font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="text-slate-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-emerald-600 py-12 text-center">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-3 font-bold text-2xl text-white">
            Empieza a ganar hoy
          </h2>
          <p className="mb-6 text-emerald-100">
            Registro gratuito. Sin mínimos. Comisión desde el primer cliente.
          </p>
          <Link href="/signup">
            <Button className="rounded-full bg-white px-8 py-3 font-semibold text-base text-emerald-700 hover:bg-emerald-50">
              Crear cuenta de partner
            </Button>
          </Link>
        </div>
      </section>

      {/* Partner Signup Form */}
      <section className="mx-auto max-w-4xl px-6 pb-16">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 md:p-12 dark:bg-slate-900">
          <h2 className="mb-2 text-center font-bold text-2xl text-slate-900 md:text-3xl">
            Únete como partner
          </h2>
          <p className="mb-8 text-center text-slate-600">
            Completa el formulario y recibe tu código de referido al instante.
          </p>
          <PartnerSignupForm />
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <h2 className="mb-8 text-center font-bold text-2xl text-slate-900 md:text-3xl">
          Preguntas frecuentes
        </h2>
        <div className="space-y-6">
          <details className="group rounded-lg border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer font-semibold text-slate-900">
              ¿Cuánto puedo ganar?
            </summary>
            <p className="mt-2 text-slate-600">
              Ganas un 20% de comisión recurrente por cada cliente que refieras.
              Si refieres un negocio que paga $49 USD/mes, ganas $9.80 USD/mes
              durante toda la vida del cliente.
            </p>
          </details>
          <details className="group rounded-lg border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer font-semibold text-slate-900">
              ¿Cómo se rastrean mis referidos?
            </summary>
            <p className="mt-2 text-slate-600">
              Cada partner recibe un código único y un enlace personalizado.
              Cuando alguien se registra con tu enlace, el sistema lo atribuye
              automáticamente a tu cuenta.
            </p>
          </details>
          <details className="group rounded-lg border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer font-semibold text-slate-900">
              ¿Cuándo recibo mis pagos?
            </summary>
            <p className="mt-2 text-slate-600">
              Los pagos se realizan mensualmente una vez que acumules al menos
              $50 USD en comisiones. Pago vía transferencia bancaria o PayPal.
            </p>
          </details>
          <details className="group rounded-lg border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer font-semibold text-slate-900">
              ¿Hay algún costo para ser partner?
            </summary>
            <p className="mt-2 text-slate-600">
              No. El programa de partners es completamente gratis. Solo
              necesitas registrarte y empezar a compartir tu enlace.
            </p>
          </details>
        </div>
      </section>

      <Footer />
    </div>
  );
}

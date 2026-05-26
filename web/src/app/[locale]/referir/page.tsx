import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";

export function generateMetadata(): Metadata {
  return {
    title: "Referir Zenda — Comparte y Ayuda a Otros Negocios",
    description:
      "Comparte Zenda con negocios que conozcas. Reciben 14 días gratis + 50% descuento. Tú ayudas a más negocios a automatizar sus citas por WhatsApp.",
    openGraph: {
      title: "Referir Zenda — Ayuda a Otros Negocios",
      description:
        "Comparte Zenda y ayuda a negocios a automatizar citas por WhatsApp.",
      url: "https://zenda.bot/es/referir",
    },
  };
}

const REFERRAL_LINK = "https://zenda.bot/signup?founding=true";

const WHATSAPP_SHARE = `https://wa.me/?text=${encodeURIComponent(
  `Descubre Zenda — una recepcionista virtual por WhatsApp que agenda citas automáticamente. Pruébalo gratis: ${REFERRAL_LINK}`
)}`;

export default function ReferPage() {
  return (
    <div className="min-h-screen bg-white">
      <Nav variant="simple" />

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-6 pt-20 pb-16 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">
          🎁
        </div>
        <h1 className="mb-4 font-bold text-3xl text-slate-900 md:text-4xl">
          Comparte Zenda y ayuda a otros negocios
        </h1>
        <p className="mx-auto mb-8 max-w-xl text-lg text-slate-600">
          Conoce un salón, clínica o negocio que pierde citas por no contestar
          WhatsApp a tiempo? Compárteles Zenda.
        </p>
      </section>

      {/* How it works */}
      <section className="border-slate-100 border-y bg-slate-50 py-12">
        <div className="mx-auto max-w-3xl px-6">
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Comparte tu enlace",
                desc: "Envía tu enlace único a negocios que conozcas",
              },
              {
                step: "2",
                title: "Ellos prueban gratis",
                desc: "Reciben 14 días gratis + 50% descuento 3 meses",
              },
              {
                step: "3",
                title: "Más negocios crecen",
                desc: "Automatizan sus citas y dejan de perder clientes",
              },
            ].map((s) => (
              <div className="text-center" key={s.step}>
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-600">
                  {s.step}
                </div>
                <h3 className="mb-1 font-semibold text-slate-900 text-sm">
                  {s.title}
                </h3>
                <p className="text-slate-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Share section */}
      <section className="py-16">
        <div className="mx-auto max-w-lg px-6 text-center">
          <h2 className="mb-6 font-bold text-slate-900 text-xl">
            Tu enlace de referido
          </h2>
          <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="break-all font-mono text-slate-700 text-sm">
              {REFERRAL_LINK}
            </p>
          </div>
          <a
            className="inline-block rounded-lg bg-emerald-600 px-6 py-2.5 font-medium text-sm text-white hover:bg-emerald-700"
            href={WHATSAPP_SHARE}
            rel="noopener noreferrer"
            target="_blank"
          >
            Compartir por WhatsApp
          </a>
        </div>
      </section>

      {/* What they get */}
      <section className="border-slate-100 border-t bg-slate-50 py-16">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-8 text-center font-bold text-slate-900 text-xl">
            Qué recibe el negocio que refieres
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              "14 días de prueba gratis",
              "50% de descuento los primeros 3 meses",
              "Recepcionista virtual 24/7 por WhatsApp",
              "Recordatorios automáticos de citas",
              "Soporte en español",
              "Configuración en menos de 5 minutos",
            ].map((item) => (
              <div className="flex items-center gap-3" key={item}>
                <span className="text-emerald-500">✓</span>
                <span className="text-slate-700 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-emerald-600 py-12 text-center">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-4 font-bold text-white text-xl">
            ¿Conoces un negocio que necesita Zenda?
          </h2>
          <p className="mb-6 text-emerald-100">
            Salones, clínicas dentales, barberías, spas, gimnasios — cualquier
            negocio que agenda citas por WhatsApp.
          </p>
          <a
            className="inline-block rounded-full bg-white px-6 py-3 font-semibold text-emerald-700 text-sm hover:bg-emerald-50"
            href={WHATSAPP_SHARE}
            rel="noopener noreferrer"
            target="_blank"
          >
            Compartir por WhatsApp
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}

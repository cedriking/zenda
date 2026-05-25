"use client";

import { Check, Copy, Gift } from "lucide-react";
import { useState } from "react";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";

export function ReferPageClient() {
  const [copied, setCopied] = useState(false);
  const referralLink = "https://zenda.bot/signup?coupon=aRgf7NZC";

  function copyLink() {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function shareWhatsApp() {
    const msg = encodeURIComponent(
      `Descubre Zenda — una recepcionista virtual por WhatsApp que agenda citas automáticamente. Pruébalo gratis: ${referralLink}`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  }

  return (
    <div className="min-h-screen bg-white">
      <Nav variant="simple" />

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-6 pt-20 pb-16 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <Gift className="h-8 w-8 text-emerald-600" />
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
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <input
              className="flex-1 bg-transparent font-mono text-slate-700 text-sm outline-none"
              onFocus={(e) => e.target.select()}
              readOnly
              value={referralLink}
            />
            <button
              className="flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700"
              onClick={copyLink}
              type="button"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>
          <div className="flex justify-center gap-3">
            <button
              className="rounded-lg border border-slate-200 px-4 py-2 font-medium text-slate-700 text-sm hover:bg-slate-50"
              onClick={shareWhatsApp}
              type="button"
            >
              Compartir por WhatsApp
            </button>
          </div>
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
                <Check className="h-5 w-5 shrink-0 text-emerald-500" />
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
          <div className="flex justify-center gap-3">
            <button
              className="rounded-full bg-white px-6 py-3 font-semibold text-emerald-700 text-sm hover:bg-emerald-50"
              onClick={copyLink}
              type="button"
            >
              Copiar enlace y compartir
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

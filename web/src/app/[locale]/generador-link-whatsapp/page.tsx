import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { JsonLdScript } from "@/components/json-ld";
import { Nav } from "@/components/nav";
import { WhatsAppLinkGenerator } from "@/components/whatsapp-link-generator";

export function generateMetadata(): Metadata {
  return {
    title: "Generador de Link de WhatsApp — Gratis y en Segundos | Zenda",
    description:
      "Genera un link de WhatsApp gratis para tu negocio. Ingresa tu numero, escribe un mensaje predeterminado y comparte el enlace wa.me con tus clientes. Herramienta libre por Zenda.",
    alternates: {
      canonical: "https://zenda.bot/es/generador-link-whatsapp",
    },
    openGraph: {
      title: "Generador de Link de WhatsApp — Gratis y en Segundos",
      description:
        "Crea links de WhatsApp para tu negocio en segundos. Gratis, sin registro. Incluye mensaje predeterminado y codigo QR.",
      url: "https://zenda.bot/es/generador-link-whatsapp",
      type: "website",
    },
  };
}

const FAQ_ITEMS = [
  {
    question: "Como creo un link de WhatsApp?",
    answer:
      "Ingresa tu numero de WhatsApp con codigo de pais en la herramienta arriba. Opcionalmente agrega un mensaje predeterminado. El link se genera automaticamente y puedes copiarlo para compartirlo con tus clientes.",
  },
  {
    question: "El link de WhatsApp es gratis?",
    answer:
      "Si, esta herramienta es 100% gratis. No necesitas registrarte ni pagar nada. Simplemente genera tu link y compartelo.",
  },
  {
    question: "Que es un mensaje predeterminado de WhatsApp?",
    answer:
      "Es el mensaje que veran tus clientes al abrir el link. Por ejemplo: 'Hola, me gustaria agendar una cita'. Esto facilita que el cliente inicie la conversacion.",
  },
  {
    question: "Como formato el numero de telefono?",
    answer:
      "Incluye el codigo de pais sin el signo +. Por ejemplo, para Mexico: 521234567890. La herramienta lo formatea automaticamente al seleccionar tu pais.",
  },
  {
    question: "Puedo usar el link en Instagram, Facebook o mi sitio web?",
    answer:
      "Si, el link funciona en cualquier plataforma. Puedes ponerlo en tu biografia de Instagram, en botones de Facebook, en tu pagina web, en correos electronicos o incluso en tarjetas de presentacion.",
  },
  {
    question: "Cual es la diferencia entre wa.me y api.whatsapp.com?",
    answer:
      "wa.me es el formato corto y oficial de WhatsApp para links directos. Ambos funcionan igual, pero wa.me es mas corto y facil de compartir. Esta herramienta genera links wa.me.",
  },
];

export default function GeneradorLinkWhatsAppPage() {
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const toolStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Generador de Link de WhatsApp",
    description:
      "Herramienta gratis para generar links de WhatsApp con mensaje predeterminado. Ideal para negocios en Latinoamerica.",
    url: "https://zenda.bot/es/generador-link-whatsapp",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    creator: {
      "@type": "Organization",
      name: "Zenda",
      url: "https://zenda.bot",
    },
  };

  return (
    <div className="min-h-screen bg-white">
      <JsonLdScript data={faqStructuredData} />
      <JsonLdScript data={toolStructuredData} />
      <Nav variant="simple" />

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pt-16 pb-10 text-center">
        <p className="mb-4 font-semibold text-emerald-600 text-sm uppercase tracking-wide">
          Herramienta Gratuita
        </p>
        <h1 className="mb-4 font-bold text-3xl text-slate-900 leading-tight md:text-4xl">
          Generador de Link de WhatsApp
        </h1>
        <p className="mx-auto mb-6 max-w-2xl text-lg text-slate-600">
          Crea un enlace directo a tu WhatsApp en segundos. Ingresa tu numero,
          personaliza el mensaje y comparte el link con tus clientes.
        </p>
      </section>

      {/* Tool */}
      <WhatsAppLinkGenerator />

      {/* How to use */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-8 text-center font-bold text-2xl text-slate-900">
            Como usar tu link de WhatsApp en 3 pasos
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Ingresa tu numero",
                desc: "Selecciona tu pais y escribe tu numero de WhatsApp Business.",
              },
              {
                step: "2",
                title: "Personaliza el mensaje",
                desc: "Escribe el mensaje que veran tus clientes al abrir el enlace.",
              },
              {
                step: "3",
                title: "Copia y comparte",
                desc: "Copia el link y ponlo en tu Instagram, Facebook, sitio web o tarjetas.",
              },
            ].map((item) => (
              <div
                className="rounded-xl border border-slate-200 bg-white p-6 text-center"
                key={item.step}
              >
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 font-bold text-white">
                  {item.step}
                </div>
                <h3 className="mb-2 font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="text-slate-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-8 text-center font-bold text-2xl text-slate-900">
            Donde puedes usar tu link de WhatsApp
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                platform: "Instagram",
                desc: "Pon el link en tu biografia o en historias con el sticker de enlace.",
              },
              {
                platform: "Facebook",
                desc: "Agrega el link en tu pagina de negocio o en publicaciones.",
              },
              {
                platform: "Google Business",
                desc: "Configuralo como boton de contacto en tu ficha de Google.",
              },
              {
                platform: "Sitio web",
                desc: "Usa el link en botones de contacto, flotantes de WhatsApp o pop-ups.",
              },
              {
                platform: "Correo electronico",
                desc: "Incluye el link en tu firma o en campanas de email marketing.",
              },
              {
                platform: "Tarjetas y flyers",
                desc: "Imprime el link o genera un codigo QR para materiales impresos.",
              },
            ].map((item) => (
              <div
                className="rounded-lg border border-slate-200 p-4"
                key={item.platform}
              >
                <h3 className="mb-1 font-semibold text-emerald-700">
                  {item.platform}
                </h3>
                <p className="text-slate-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-8 text-center font-bold text-2xl text-slate-900">
            Preguntas frecuentes sobre links de WhatsApp
          </h2>
          <div className="space-y-4">
            {FAQ_ITEMS.map((item) => (
              <div
                className="rounded-lg border border-slate-200 bg-white p-5"
                key={item.question}
              >
                <h3 className="mb-2 font-semibold text-slate-900">
                  {item.question}
                </h3>
                <p className="text-slate-600 text-sm">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-emerald-600 py-16 text-center">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-3 font-bold text-2xl text-white md:text-3xl">
            Quieres que WhatsApp agenda citas por ti?
          </h2>
          <p className="mb-6 text-emerald-100">
            Zenda conecta una IA a tu WhatsApp que agenda citas, responde
            preguntas y envia recordatorios — automaticamente.
          </p>
          <a href="/founding">
            <button
              className="rounded-full bg-white px-8 py-3 font-semibold text-base text-emerald-700 hover:bg-emerald-50"
              type="button"
            >
              Conoce Zenda — Es gratis
            </button>
          </a>
          <p className="mt-4 text-emerald-200 text-xs">
            $0/mes · Sin tarjeta de credito · Funciona con tu WhatsApp
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}

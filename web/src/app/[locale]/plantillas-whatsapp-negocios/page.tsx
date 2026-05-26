import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { JsonLdScript } from "@/components/json-ld";
import { Nav } from "@/components/nav";
import { Link } from "@/i18n/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const path = "plantillas-whatsapp-negocios";
  const locales = ["es", "en", "ar", "fr", "de", "ru", "zh", "ja", "ko"];
  const languages: Record<string, string> = {};
  for (const loc of locales) {
    languages[loc] = `https://zenda.bot/${loc}/${path}`;
  }
  languages["x-default"] = "https://zenda.bot/en/plantillas-whatsapp-negocios";

  return {
    title: "50+ Plantillas de WhatsApp para Negocios | Copia y Pega | Zenda",
    description:
      "Plantillas gratis de WhatsApp Business para confirmar citas, recordar pagos, enviar promociones y mas. Copia y pega directamente en tu WhatsApp.",
    alternates: {
      canonical: `https://zenda.bot/${locale}/${path}`,
      languages,
    },
    openGraph: {
      title: "50+ Plantillas de WhatsApp para Negocios | Zenda",
      description:
        "La coleccion mas completa de plantillas de WhatsApp Business para negocios de citas. 100% gratis. Copia y pega.",
      url: `https://zenda.bot/${locale}/${path}`,
      type: "website",
    },
    keywords: [
      "plantillas whatsapp negocios",
      "mensajes whatsapp citas",
      "plantillas whatsapp business",
      "plantillas whatsapp negocio",
      "mensajes whatsapp negocio",
      "plantillas de whatsapp para negocios",
      "plantillas de mensajes whatsapp business",
      "whatsapp business templates",
    ],
  };
}

interface Template {
  text: string;
  title: string;
}

interface TemplateSection {
  description: string;
  heading: string;
  templates: Template[];
}

const SECTIONS: TemplateSection[] = [
  {
    heading: "Confirmacion de citas",
    description:
      "Confirma, recuerda y gestiona cambios de citas con estos mensajes listos para usar.",
    templates: [
      {
        title: "Confirmacion de cita",
        text: "Hola {nombre}, te confirmo tu cita para el {dia} a las {hora}. \u00bfTodo bien? Responde con SI para confirmar.",
      },
      {
        title: "Recordatorio 24h antes",
        text: "Hola {nombre}, te recordamos que tienes cita manana a las {hora}. Si necesitas cambiarla, avisanos lo antes posible. \u00a1Te esperamos!",
      },
      {
        title: "Recordatorio mismo dia",
        text: "Buenos dias {nombre}, te esperamos hoy a las {hora} en {negocio}. \u00bfNos confirmas tu asistencia?",
      },
      {
        title: "Reagendar cita",
        text: "Hola {nombre}, lamentamos informarte que necesitamos reprogramar tu cita del {dia}. \u00bfTe queda bien el {nuevo_dia} a las {nueva_hora}?",
      },
      {
        title: "Cancelacion de cita",
        text: "Hola {nombre}, confirmamos la cancelacion de tu cita del {dia}. Si deseas reagendar, estamos a tu disposicion. \u00a1Saludos!",
      },
      {
        title: "Confirmacion con ubicacion",
        text: "Hola {nombre}, tu cita esta confirmada para el {dia} a las {hora}. Nuestro local esta en {direccion}. \u00a1Te esperamos!",
      },
      {
        title: "Recordatorio semanal",
        text: "Hola {nombre}, solo un recordatorio amistoso de que tienes cita esta semana ({dia} a las {hora}). \u00bfTodoconfirmado?",
      },
    ],
  },
  {
    heading: "Seguimiento post-servicio",
    description:
      "Fideliza a tus clientes con mensajes de agradecimiento y seguimiento despues de cada servicio.",
    templates: [
      {
        title: "Agradecimiento post-visita",
        text: "\u00a1Gracias por visitarnos, {nombre}! Esperamos que hayas quedado encantad@ con el resultado. \u00bfTe gustaria agendar tu proxima cita?",
      },
      {
        title: "Consulta de satisfaccion",
        text: "Hola {nombre}, \u00bfcomo quedaste con tu {servicio}? Nos encantaria saber tu opinion. Tu feedback nos ayuda a mejorar cada dia.",
      },
      {
        title: "Solicitud de resena",
        text: "Hola {nombre}, si te gusto tu experiencia en {negocio}, nos ayudarias mucho dejando una resena en Google. \u00a1Solo toma un minuto! {enlace_resena}",
      },
      {
        title: "Recordatorio de proxima cita",
        text: "Hola {nombre}, ya paso un tiempo desde tu ultima visita. \u00bfEs momento de tu proximo {servicio}? Agendamos cuando te venga bien.",
      },
      {
        title: "Follow-up con consejo",
        text: "Hola {nombre}, espero que estes disfrutando tu {servicio}. Tip: {consejo_post_servicio}. \u00bfTienes alguna pregunta?",
      },
      {
        title: "Cumpleanos del cliente",
        text: "\u00a1Feliz cumpleanos, {nombre}! \u00a1Que tengas un dia increible! Como regalo, te ofrecemos {descuento}% de descuento en tu proxima cita. \u00bfAgendamos?",
      },
    ],
  },
  {
    heading: "Promociones y ofertas",
    description:
      "Impulsa tus ventas con mensajes promocionales efectivos y profesionales.",
    templates: [
      {
        title: "Oferta flash",
        text: "\u00a1Hola {nombre}! Solo por esta semana: {descuento}% de descuento en {servicio}. \u00bfTe interesa? Responde y te agendo.",
      },
      {
        title: "Descuento por fidelidad",
        text: "Hola {nombre}, como cliente frecuente de {negocio}, tienes un {descuento}% de descuento en tu proxima visita. \u00a1Valido hasta el {fecha}!",
      },
      {
        title: "Programa de referidos",
        text: "Hola {nombre}, \u00bffriends que te gustaria referir a {negocio}? Por cada amigo que agende, ambos reciben {descuento}% de descuento. \u00bfA quien nos recomiendas?",
      },
      {
        title: "Promocion de temporada",
        text: "\u00a1{nombre}, tenemos una promo especial de {temporada}! {servicio} a precio especial: {precio_oferta} en vez de {precio_normal}. \u00bfTe lo agendamos?",
      },
      {
        title: "Paquete de servicios",
        text: "Hola {nombre}, arma tu combo: {servicio_1} + {servicio_2} por solo {precio_paquete}. Ahorras {descuento}% vs. reservar por separado. \u00bfTe interesa?",
      },
      {
        title: "Primera visita",
        text: "\u00a1Hola! Bienvenido a {negocio}. En tu primera visita tienes {descuento}% de descuento en cualquier servicio. \u00bfTe gustaria agendar?",
      },
      {
        title: "Ultimo cupo disponible",
        text: "Hola {nombre}, solo nos quedan {cantidad} cupos para {servicio} esta semana. \u00bfTe lo reservamos? Responde rapido antes de que se llenen.",
      },
    ],
  },
  {
    heading: "Primer contacto / Bienvenida",
    description:
      "Da una excelente primera impresion con estos mensajes de bienvenida para nuevos clientes.",
    templates: [
      {
        title: "Bienvenida a nuevo cliente",
        text: "\u00a1Bienvenid@ a {negocio}! Estamos en {direccion}. Nuestro horario es {horario}. \u00bfEn que podemos ayudarte?",
      },
      {
        title: "Catalogo de servicios",
        text: "Hola {nombre}, estos son nuestros servicios:\n\n{lista_servicios}\n\n\u00bfTe gustaria agendar alguno? Solo dime cual y te doy disponibilidad.",
      },
      {
        title: "Horarios y ubicacion",
        text: "Hola {nombre}, te comparto nuestra info:\n\n\u23f0 Horario: {horario}\n\u2316 Ubicacion: {direccion}\n\u260e Telefono: {telefono}\n\n\u00bfTe gustaria agendar una cita?",
      },
      {
        title: "Bienvenida post-referencia",
        text: "Hola {nombre}, {amigo} nos recomendo que te comunicaras con nosotros. \u00a1Bienvenid@! \u00bfEn que podemos ayudarte?",
      },
      {
        title: "Mensaje de bienvenida detallado",
        text: "\u00a1Hola {nombre}! Gracias por contactar a {negocio}.\n\nTe cuento un poco de nosotros:\n{descripcion_negocio}\n\n\u00bfTe gustaria conocer nuestros servicios?",
      },
      {
        title: "Respuesta fuera de horario",
        text: "Hola {nombre}, gracias por contactar a {negocio}. En este momento estamos cerrados, pero te responderemos a primera hora ({horario_apertura}). \u00a1Tu mensaje es importante para nosotros!",
      },
    ],
  },
  {
    heading: "Recordatorios de pago",
    description:
      "Gestiona los pagos de forma profesional con estos recordatorios amigables.",
    templates: [
      {
        title: "Recordatorio de pago pendiente",
        text: "Hola {nombre}, te recordamos que tu saldo pendiente es de {monto}. Puedes pagar por transferencia o en efectivo en tu proxima visita.",
      },
      {
        title: "Confirmacion de pago recibido",
        text: "Hola {nombre}, confirmamos la recepcion de tu pago de {monto}. \u00a1Gracias por tu puntualidad! Cualquier duda, estamos a tu disposicion.",
      },
      {
        title: "Recordatorio de abono",
        text: "Hola {nombre}, tu saldo restante es de {monto_restante}. Recuerda que puedes abonar en cualquier momento. Tu proximo pago vence el {fecha}.",
      },
      {
        title: "Pago atrasado",
        text: "Hola {nombre}, tu pago de {monto} vencio el {fecha}. \u00bfPodrias confirmarnos cuando puedes realizarlo? No queremos afectar tus citas programadas.",
      },
      {
        title: "Agradecimiento por pago puntual",
        text: "\u00a1Gracias por tu pago puntual, {nombre}! Tu siguiente cita esta confirmada para el {dia}. \u00a1Te esperamos!",
      },
    ],
  },
  {
    heading: "Respuestas rapidas",
    description:
      "Responde las preguntas mas frecuentes de tus clientes de forma rapida y profesional.",
    templates: [
      {
        title: "Consulta de precios",
        text: "Hola {nombre}, el precio de {servicio} es {precio}. Incluye {que_incluye}. \u00bfTe gustaria agendar?",
      },
      {
        title: "Consulta de disponibilidad",
        text: "Hola {nombre}, tenemos disponibilidad en estos horarios:\n\n{horarios_disponibles}\n\n\u00bfCual te queda mejor?",
      },
      {
        title: "Descripcion de servicio",
        text: "Hola {nombre}, {servicio} consiste en {descripcion_servicio}. Dura aproximadamente {duracion} y tiene un costo de {precio}. \u00bfTe interesa?",
      },
      {
        title: "Indicaciones de ubicacion",
        text: "Hola {nombre}, estamos en {direccion}. Estacionamiento: {info_estacionamiento}. Referencia: {punto_referencia}. \u00a1Te esperamos!",
      },
      {
        title: "Politica de cancelacion",
        text: "Hola {nombre}, nuestra politica de cancelacion permite cambios hasta {horas_anticipacion} horas antes de la cita sin costo. Cancelaciones tardias tienen un cargo de {cargo}. \u00bfTienes alguna duda?",
      },
      {
        title: "Metodos de pago",
        text: "Hola {nombre}, aceptamos los siguientes metodos de pago:\n\n- Efectivo\n- Transferencia bancaria\n- Tarjeta de debito/credito\n- {metodo_adicional}\n\n\u00bfAlguna otra consulta?",
      },
    ],
  },
];

const FAQ_ITEMS = [
  {
    question: "\u00bfPuedo usar estas plantillas de WhatsApp Business gratis?",
    answer:
      "Si, todas las plantillas de esta pagina son 100% gratuitas. Puedes copiarlas, modificarlas y usarlas en tu negocio sin restriccion alguna.",
  },
  {
    question: "\u00bfComo copio una plantilla a mi WhatsApp?",
    answer:
      "Haz clic en el boton 'Copiar' junto a la plantilla que quieras usar. Luego abre WhatsApp, pega el mensaje en el chat correspondiente, y reemplaza los campos entre llaves ({nombre}, {dia}, etc.) con la informacion real de tu cliente.",
  },
  {
    question: "\u00bfQue significa el texto entre llaves como {nombre}?",
    answer:
      "Los campos entre llaves son variables que debes reemplazar con datos reales antes de enviar el mensaje. Por ejemplo, {nombre} lo cambias por el nombre de tu cliente, {dia} por la fecha de la cita, {hora} por la hora, etc.",
  },
  {
    question: "\u00bfPuedo personalizar estas plantillas para mi negocio?",
    answer:
      "Por supuesto. Estas plantillas son un punto de partida. Adapta el tono, agrega el nombre de tu negocio, y modifica los detalles para que se ajusten perfectamente a tu tipo de negocio y estilo de comunicacion.",
  },
  {
    question: "\u00bfWhatsApp Business me permite enviar mensajes automaticos?",
    answer:
      "Si, con herramientas como Zenda puedes automatizar el envio de estas plantillas. Zenda conecta con tu WhatsApp Business y envia confirmaciones, recordatorios y seguimientos de forma automatica, sin que tengas que escribir cada mensaje manualmente.",
  },
  {
    question: "\u00bfCuantas plantillas de WhatsApp necesito para mi negocio?",
    answer:
      "Recomendamos tener al menos una plantilla para cada tipo de situacion: confirmacion de cita, recordatorio, seguimiento post-servicio, bienvenida y promociones. Con las 50+ plantillas de esta coleccion, tendras cubiertos todos los escenarios.",
  },
];

export default function PlantillasWhatsappPage() {
  const faqLd = {
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

  const copyHandler =
    "navigator.clipboard.writeText(this.parentElement.querySelector('.template-text').textContent);this.textContent='\u00a1Copiado!';setTimeout(()=>this.textContent='Copiar',2000)";

  return (
    <div className="min-h-screen bg-neutral-200 pt-16">
      <JsonLdScript data={faqLd} />
      <Nav variant="simple" />

      <main className="relative overflow-hidden">
        {/* Hero */}
        <div className="rounded-b-[2rem] bg-gradient-to-br from-emerald-600 to-emerald-700 shadow-2xl">
          <div className="mx-auto max-w-4xl px-6 py-20 text-center">
            <h1 className="mb-4 font-black text-4xl text-white tracking-tight md:text-5xl">
              50+ Plantillas de WhatsApp para tu Negocio
            </h1>
            <p className="mx-auto max-w-2xl font-medium text-emerald-100 text-lg">
              Copia y pega. Listas para usar. Mensajes profesionales para
              confirmar citas, recordar pagos, fidelizar clientes y vender mas.
            </p>
            <p className="mt-6 text-emerald-200 text-sm">
              100% gratis &middot; Sin registro &middot; Actualizado en 2025
            </p>
          </div>
        </div>

        {/* Template sections */}
        <div className="mx-auto max-w-6xl px-6 py-16">
          {SECTIONS.map((section) => (
            <section className="mb-16" key={section.heading}>
              <h2 className="mb-2 font-black text-2xl text-slate-900 md:text-3xl">
                {section.heading}
              </h2>
              <p className="mb-8 text-slate-500">{section.description}</p>

              <div className="grid gap-4 md:grid-cols-2">
                {section.templates.map((template) => (
                  <div
                    className="rounded-2xl border border-slate-100 bg-white p-5 shadow-lg"
                    key={template.title}
                  >
                    <h3 className="mb-3 font-bold text-slate-900 text-sm">
                      {template.title}
                    </h3>
                    <div className="mb-3 rounded-xl bg-slate-50 p-4">
                      <p className="template-text whitespace-pre-line font-mono text-slate-700 text-sm">
                        {template.text}
                      </p>
                    </div>
                    <button
                      className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-emerald-700"
                      onclick={copyHandler}
                      type="button"
                    >
                      Copiar
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* FAQ */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 font-black text-2xl text-slate-900 md:text-3xl">
              Preguntas frecuentes sobre plantillas de WhatsApp
            </h2>
            <p className="mb-8 text-slate-500">
              Todo lo que necesitas saber para empezar a usar estas plantillas
              en tu negocio.
            </p>
            <div className="space-y-4 text-left">
              {FAQ_ITEMS.map((item) => (
                <div
                  className="rounded-2xl border border-slate-100 bg-white p-5 shadow-lg"
                  key={item.question}
                >
                  <h3 className="mb-1 font-bold text-slate-900">
                    {item.question}
                  </h3>
                  <p className="text-slate-500 text-sm">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-3xl rounded-[2rem] bg-gradient-to-br from-emerald-600 to-emerald-700 p-12 text-center shadow-2xl">
            <h2 className="mb-4 font-black text-3xl text-white">
              \u00bfQuieres que WhatsApp responda SOLO por ti?
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-emerald-100">
              Zenda automatiza tu WhatsApp Business: confirma citas, envia
              recordatorios, responde preguntas y sigue up con clientes &mdash;
              todo en piloto automatico. Sin escribir un solo mensaje.
            </p>
            <Link
              className="inline-block rounded-xl bg-white px-8 py-4 font-bold text-emerald-700 text-lg shadow-lg transition-transform hover:scale-105"
              href="/founding"
            >
              Probar Zenda gratis
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

import type { MetadataRoute } from "next";
import { locales } from "@/i18n/routing";

const BUILD_DATE = new Date();

const spanishSlugs = [
  "/blog/whatsapp-citas-salon",
  "/blog/whatsapp-citas-barberia",
  "/blog/whatsapp-citas-taller-mecanico",
  "/blog/whatsapp-citas-veterinaria",
  "/blog/reducir-ausencias-clinica",
  "/blog/automatizar-whatsapp-negocios",
  "/blog/whatsapp-dentista-citas",
  "/blog/whatsapp-salon-belleza",
  "/blog/whatsapp-spa-citas",
  "/blog/whatsapp-agente-inmobiliario",
  "/blog/whatsapp-sesiones-fotograficas",
  "/blog/whatsapp-personal-trainer",
  "/blog/whatsapp-citas-abogado",
  "/blog/whatsapp-reservaciones-restaurante",
  "/blog/whatsapp-citas-salon-belleza",
  "/blog/whatsapp-lavado-auto-detailing",
  "/blog/como-agendar-citas-whatsapp-negocio",
  "/blog/evitar-cancelaciones-citas-whatsapp",
];

const englishSlugs = [
  "/blog/whatsapp-appointment-reminders",
  "/blog/whatsapp-dental-clinic",
  "/blog/whatsapp-beauty-salon",
  "/blog/whatsapp-fitness-booking",
];

const blogSlugsByLocale: Record<string, string[]> = {
  es: spanishSlugs,
  en: englishSlugs,
};

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://zenda.bot";
  const baseRoutes = [
    "",
    "/pricing",
    "/features",
    "/signup",
    "/download",
    "/docs",
    "/beauty",
    "/wellness",
    "/clinics",
    "/dental",
    "/fitness",
    "/founding",
    "/demo",
    "/partners",
    "/recepcionista-virtual-whatsapp",
    "/automatizar-citas-whatsapp",
    "/recepcionista-dental-whatsapp",
    "/recordatorios-citas-whatsapp",
    "/automatizar-turnos-whatsapp",
    "/recepcionista-virtual-salones",
    "/bot-citas-whatsapp",
    "/mejor-alternativa-calendly-whatsapp",
    "/mejor-alternativa-acuity-whatsapp",
    "/mejor-alternativa-wati-whatsapp",
    "/mejor-alternativa-kommo-whatsapp",
    "/mejor-alternativa-zendesk-whatsapp",
    "/mejor-alternativa-trengo-whatsapp",
    "/mejor-alternativa-sirena-whatsapp",
    "/mejor-alternativa-manychat-whatsapp",
    "/mejor-alternativa-freshchat-whatsapp",
    "/mejor-alternativa-respondio-whatsapp",
    "/mejor-alternativa-twilio-whatsapp",
    "/recepcionista-veterinaria-whatsapp",
    "/recepcionista-spa-whatsapp",
    "/chatbot-citas-whatsapp",
    "/referir",
    "/generador-link-whatsapp",
    "/plantillas-whatsapp-negocios",
    "/agendar-citas-whatsapp-automatico",
    "/whatsapp-negocios-citas",
    "/guia-whatsapp-negocios-citas",
    "/confirmar-citas-whatsapp",
    "/cita",
    "/blog",
    "/legal/privacy",
    "/legal/terms",
  ];

  return locales.flatMap((locale) => {
    const blogRoutes = blogSlugsByLocale[locale] ?? [];
    const routes = [...baseRoutes, ...blogRoutes];
    return routes.map((route) => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified: BUILD_DATE,
      changeFrequency: getFrequency(route),
      priority: getPriority(route),
    }));
  });
}

function getFrequency(route: string): "weekly" | "yearly" | "monthly" {
  if (route === "") {
    return "weekly";
  }
  if (route.includes("legal")) {
    return "yearly";
  }
  return "monthly";
}

const PRIORITY_09 = new Set([
  "/pricing",
  "/features",
  "/founding",
  "/demo",
  "/recepcionista-virtual-whatsapp",
  "/automatizar-citas-whatsapp",
  "/recepcionista-dental-whatsapp",
  "/recordatorios-citas-whatsapp",
  "/automatizar-turnos-whatsapp",
  "/recepcionista-virtual-salones",
  "/bot-citas-whatsapp",
  "/mejor-alternativa-calendly-whatsapp",
  "/mejor-alternativa-acuity-whatsapp",
  "/mejor-alternativa-wati-whatsapp",
  "/mejor-alternativa-kommo-whatsapp",
  "/mejor-alternativa-zendesk-whatsapp",
  "/mejor-alternativa-trengo-whatsapp",
  "/mejor-alternativa-sirena-whatsapp",
  "/mejor-alternativa-manychat-whatsapp",
  "/mejor-alternativa-freshchat-whatsapp",
  "/mejor-alternativa-respondio-whatsapp",
  "/mejor-alternativa-twilio-whatsapp",
  "/recepcionista-veterinaria-whatsapp",
  "/recepcionista-spa-whatsapp",
  "/guia-whatsapp-negocios-citas",
  "/chatbot-citas-whatsapp",
  "/blog",
]);

function getPriority(route: string): number {
  if (route === "") {
    return 1;
  }
  if (PRIORITY_09.has(route)) {
    return 0.9;
  }
  if (route === "/partners") {
    return 0.8;
  }
  if (route.startsWith("/blog")) {
    return 0.8;
  }
  if (route.includes("legal")) {
    return 0.3;
  }
  return 0.6;
}

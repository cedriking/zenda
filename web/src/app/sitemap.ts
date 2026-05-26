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
    "/chatbot-citas-whatsapp",
    "/referir",
    "/generador-link-whatsapp",
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

function getPriority(route: string): number {
  if (route === "") {
    return 1;
  }
  if (route === "/pricing") {
    return 0.9;
  }
  if (route === "/features") {
    return 0.9;
  }
  if (route === "/founding") {
    return 0.9;
  }
  if (route === "/demo") {
    return 0.9;
  }
  if (route === "/partners") {
    return 0.8;
  }
  if (route === "/recepcionista-virtual-whatsapp") {
    return 0.9;
  }
  if (route === "/automatizar-citas-whatsapp") {
    return 0.9;
  }
  if (route === "/recepcionista-dental-whatsapp") {
    return 0.9;
  }
  if (route === "/recordatorios-citas-whatsapp") {
    return 0.9;
  }
  if (route === "/automatizar-turnos-whatsapp") {
    return 0.9;
  }
  if (route === "/recepcionista-virtual-salones") {
    return 0.9;
  }
  if (route === "/bot-citas-whatsapp") {
    return 0.9;
  }
  if (route === "/mejor-alternativa-calendly-whatsapp") {
    return 0.9;
  }
  if (route === "/mejor-alternativa-acuity-whatsapp") {
    return 0.9;
  }
  if (route === "/chatbot-citas-whatsapp") {
    return 0.9;
  }
  if (route === "/blog") {
    return 0.9;
  }
  if (route.startsWith("/blog")) {
    return 0.8;
  }
  if (route.includes("legal")) {
    return 0.3;
  }
  return 0.6;
}

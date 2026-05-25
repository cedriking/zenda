import type { MetadataRoute } from "next";
import { locales } from "@/i18n/routing";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://zenda.bot";
  const routes = [
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
    "/recepcionista-virtual-whatsapp",
    "/automatizar-citas-whatsapp",
    "/blog",
    "/blog/whatsapp-citas-salon",
    "/blog/reducir-ausencias-clinica",
    "/blog/automatizar-whatsapp-negocios",
    "/blog/whatsapp-appointment-reminders",
    "/blog/whatsapp-dental-clinic",
    "/blog/whatsapp-beauty-salon",
    "/blog/whatsapp-dentista-citas",
    "/blog/whatsapp-salon-belleza",
    "/blog/whatsapp-fitness-booking",
    "/blog/whatsapp-spa-citas",
    "/legal/privacy",
    "/legal/terms",
  ];

  return locales.flatMap((locale) =>
    routes.map((route) => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: getFrequency(route),
      priority: getPriority(route),
    }))
  );
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
  if (route === "/recepcionista-virtual-whatsapp") {
    return 0.9;
  }
  if (route === "/automatizar-citas-whatsapp") {
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

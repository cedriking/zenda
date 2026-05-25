import type { MetadataRoute } from "next";
import { locales } from "@/i18n/routing";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://zenda.bot";
  const routes = [
    "",
    "/pricing",
    "/signup",
    "/download",
    "/docs",
    "/beauty",
    "/wellness",
    "/clinics",
    "/founding",
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
  if (route === "/founding") {
    return 0.9;
  }
  if (route.includes("legal")) {
    return 0.3;
  }
  return 0.6;
}

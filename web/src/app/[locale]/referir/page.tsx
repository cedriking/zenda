import type { Metadata } from "next";
import { ReferPageClient } from "./refer-client";

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

export default function ReferPage() {
  return <ReferPageClient />;
}

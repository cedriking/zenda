import type { Metadata } from "next";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const path = "cita";
  const locales = ["es", "en"];
  const languages: Record<string, string> = {};
  for (const loc of locales) {
    languages[loc] = `https://zenda.bot/${loc}/${path}`;
  }
  languages["x-default"] = "https://zenda.bot/es/cita";

  return {
    title: "Zenda — Agenda Citas por WhatsApp Automáticamente",
    description:
      "Tus clientes agendan citas por WhatsApp 24/7. Automático. Sin app nueva. Pruébalo gratis.",
    alternates: {
      canonical: `https://zenda.bot/${locale}/${path}`,
      languages,
    },
    openGraph: {
      title: "Zenda — Agenda Citas por WhatsApp",
      description:
        "Tus clientes agendan citas por WhatsApp 24/7. Automático. Sin app nueva.",
      url: `https://zenda.bot/${locale}/${path}`,
      type: "website",
    },
    robots: { index: true, follow: true },
  };
}

export default async function CitaPage({ params }: Props) {
  const { locale } = await params;
  const isEs = locale === "es";

  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-b from-emerald-50 to-white px-4 py-6 text-center">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 text-5xl">&#128172;</div>

        <h1 className="mb-3 font-bold text-2xl text-neutral-900">
          {isEs
            ? "¿Cansado de contestar WhatsApp todo el día?"
            : "Tired of answering WhatsApp all day?"}
        </h1>

        <p className="mb-6 text-base text-neutral-600">
          {isEs
            ? "Zenda responde por ti. Agenda citas, envía recordatorios, y confirma automáticamente — todo por WhatsApp."
            : "Zenda answers for you. Books appointments, sends reminders, and confirms automatically — all on WhatsApp."}
        </p>

        <div className="mb-8 space-y-3 text-left">
          <Benefit
            emoji="&#9989;"
            text={
              isEs
                ? "Tus clientes agendan 24/7 sin llamarte"
                : "Your clients book 24/7 without calling you"
            }
          />
          <Benefit
            emoji="&#9989;"
            text={
              isEs
                ? "Recordatorios automáticos → menos no-shows"
                : "Automatic reminders → fewer no-shows"
            }
          />
          <Benefit
            emoji="&#9989;"
            text={
              isEs
                ? "Funciona con tu WhatsApp actual"
                : "Works with your existing WhatsApp"
            }
          />
          <Benefit
            emoji="&#9989;"
            text={
              isEs
                ? "Setup en 5 minutos, sin bajar apps"
                : "Setup in 5 minutes, no new apps"
            }
          />
        </div>

        <a
          className="mb-4 block w-full rounded-xl bg-emerald-600 px-6 py-4 font-bold text-lg text-white shadow-lg transition-all hover:bg-emerald-700 hover:shadow-xl active:scale-[0.98]"
          href="https://zenda.bot/es/founding"
        >
          {isEs ? "Prueba Gratis 14 Días" : "Try Free for 14 Days"}
        </a>

        <p className="mb-8 text-neutral-400 text-xs">
          {isEs
            ? "Sin tarjeta de crédito. Cancela cuando quieras."
            : "No credit card required. Cancel anytime."}
        </p>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 text-left">
          <p className="mb-2 font-semibold text-neutral-700 text-sm">
            {isEs ? "Así funciona:" : "How it works:"}
          </p>
          <ol className="space-y-2 text-neutral-600 text-sm">
            <li className="flex gap-2">
              <span className="font-bold text-emerald-600">1.</span>
              {isEs
                ? "Conectas tu WhatsApp Business (5 min)"
                : "Connect your WhatsApp Business (5 min)"}
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-emerald-600">2.</span>
              {isEs
                ? "Zenda responde mensajes y agenda citas"
                : "Zenda answers messages and books appointments"}
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-emerald-600">3.</span>
              {isEs
                ? "Recordatorios automáticos reducen no-shows 70%"
                : "Automatic reminders reduce no-shows by 70%"}
            </li>
          </ol>
        </div>

        <p className="mt-8 text-neutral-400 text-sm">
          Zenda &middot;{" "}
          {isEs
            ? "Automatiza citas por WhatsApp"
            : "Automate appointments on WhatsApp"}
        </p>
      </div>
    </div>
  );
}

function Benefit({ emoji, text }: { emoji: string; text: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg bg-white p-3 shadow-sm">
      <span className="text-lg" dangerouslySetInnerHTML={{ __html: emoji }} />
      <span className="text-neutral-700 text-sm">{text}</span>
    </div>
  );
}

"use client";

import { MessageSquare, Monitor, Rocket, Smartphone } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Nav } from "@/components/nav";
import { Link } from "@/i18n/navigation";

const QUICK_START_STEPS = [
  { icon: Monitor, titleKey: "step1Title", descKey: "step1Desc" },
  { icon: Smartphone, titleKey: "step2Title", descKey: "step2Desc" },
  { icon: MessageSquare, titleKey: "step3Title", descKey: "step3Desc" },
  { icon: Rocket, titleKey: "step4Title", descKey: "step4Desc" },
] as const;

function usePlatform() {
  const [platform, setPlatform] = useState<"mac" | "win" | "unknown">(
    "unknown"
  );
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes("mac")) {
      setPlatform("mac");
    } else if (ua.includes("win")) {
      setPlatform("win");
    }
  }, []);
  return platform;
}

export function DownloadPageClient() {
  const t = useTranslations("download");
  const platform = usePlatform();

  const macOSUrl = "/api/download/macos";
  const windowsUrl = "/api/download/windows";

  return (
    <div className="flex min-h-screen flex-col pt-16">
      <Nav variant="simple" />

      <main className="flex flex-1 flex-col items-center px-6 py-20">
        {/* Download cards */}
        <div className="max-w-lg text-center">
          <h1 className="mb-4 font-bold text-3xl">{t("title")}</h1>
          <p className="mb-8 text-muted-foreground">{t("desc")}</p>

          <div className="mx-auto grid max-w-sm grid-cols-2 gap-4">
            <a
              className={`rounded-xl border p-6 text-center transition hover:shadow-md ${
                platform === "mac"
                  ? "border-primary shadow-md ring-2 ring-primary/20"
                  : "border-border hover:border-primary"
              }`}
              href={macOSUrl}
            >
              <svg
                aria-hidden="true"
                className="mx-auto mb-2 h-8 w-8 text-muted-foreground"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              <div className="font-semibold">{t("macos")}</div>
              <div className="mt-1 font-medium text-primary text-xs">
                {t("downloadDmg")}
              </div>
            </a>
            <a
              className={`rounded-xl border p-6 text-center transition hover:shadow-md ${
                platform === "win"
                  ? "border-primary shadow-md ring-2 ring-primary/20"
                  : "border-border hover:border-primary"
              }`}
              href={windowsUrl}
            >
              <svg
                aria-hidden="true"
                className="mx-auto mb-2 h-8 w-8 text-muted-foreground"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M3 12V6.75l6-1.32v6.48L3 12zm6.98.1l.02 6.5 6 .9V12.08l-6.02.02zM10 5.29L16 4v7.96h-6V5.29zM17 4.77L23 4v8h-6V4.77zM17 12.1L23 12v8l-6-.84V12.1zM3 12.98l6 .07v6.27l-6 .86V12.98z" />
              </svg>
              <div className="font-semibold">{t("windows")}</div>
              <div className="mt-1 font-medium text-primary text-xs">
                {t("downloadExe")}
              </div>
            </a>
          </div>

          <p className="mt-6 text-muted-foreground text-sm">
            {t("alreadyHave")}{" "}
            <Link className="text-primary underline" href="/login">
              {t("signin")}
            </Link>
          </p>

          <p className="mt-4 text-muted-foreground text-sm">
            {t("troubleDownloading")}{" "}
            <a
              className="text-primary underline"
              href="https://github.com/cedriking/zenda/releases"
              rel="noopener noreferrer"
              target="_blank"
            >
              {t("githubReleases")}
            </a>
          </p>
        </div>

        {/* Quick-start steps */}
        <div className="mx-auto mt-16 max-w-xl">
          <div className="mb-8 text-center">
            <h2 className="mb-2 font-bold text-2xl">{t("quickStartTitle")}</h2>
            <p className="text-muted-foreground">{t("quickStartDesc")}</p>
          </div>

          <div className="relative space-y-0">
            {/* Timeline line */}
            <div className="absolute top-6 bottom-6 left-6 w-px bg-border" />

            {QUICK_START_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isLast = idx === QUICK_START_STEPS.length - 1;
              return (
                <div
                  className={`flex items-start gap-4 ${isLast ? "" : "pb-8"}`}
                  key={step.titleKey}
                >
                  <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-white">
                    <Icon className="text-primary" size={20} />
                  </div>
                  <div className="pt-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-primary text-xs uppercase tracking-wide">
                        Step {idx + 1}
                      </span>
                    </div>
                    <h3 className="font-semibold text-foreground">
                      {t(step.titleKey)}
                    </h3>
                    <p className="mt-0.5 text-muted-foreground text-sm">
                      {t(step.descKey)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mt-8 text-center text-muted-foreground text-sm">
            {t.rich("needHelp", {
              link: (chunk: React.ReactNode) => (
                <Link className="text-primary underline" href="/docs">
                  {chunk}
                </Link>
              ),
            })}
          </p>
        </div>
      </main>
    </div>
  );
}

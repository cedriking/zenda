import { Send } from "lucide-react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Link } from "@/i18n/navigation";

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Image
        alt="Zenda"
        className="size-7"
        height={28}
        src="/logo.png"
        width={28}
      />
      <span className="font-bold text-lg text-white">Zenda</span>
    </div>
  );
}

export async function Footer() {
  const t = await getTranslations("footer");

  const FOOTER_LINKS = {
    [t("product")]: [
      { label: t("features"), href: "/features" },
      { label: t("pricing"), href: "/pricing" },
      { label: t("documentation"), href: "/docs" },
    ],
    [t("company")]: [
      { label: t("about"), href: "/docs" },
      { label: t("blog"), href: "/blog" },
      { label: t("contact"), href: "mailto:hello@zenda.bot", external: true },
    ],
    [t("legal")]: [
      { label: t("privacyPolicy"), href: "/legal/privacy" },
      { label: t("termsOfService"), href: "/legal/terms" },
    ],
    [t("verticals")]: [
      {
        label: t("verticals.dental", { defaultValue: "Dental" }),
        href: "/dental",
      },
      {
        label: t("verticals.beauty", { defaultValue: "Beauty" }),
        href: "/beauty",
      },
      {
        label: t("verticals.fitness", { defaultValue: "Fitness" }),
        href: "/fitness",
      },
      {
        label: t("verticals.clinics", { defaultValue: "Clinics" }),
        href: "/clinics",
      },
      {
        label: t("verticals.wellness", { defaultValue: "Wellness" }),
        href: "/wellness",
      },
    ],
  };

  return (
    <footer className="bg-neutral-200 px-4 py-6 md:px-8">
      <div className="overflow-hidden rounded-[2rem] bg-slate-950">
        <div className="mx-auto max-w-7xl px-8 py-16">
          <div className="grid grid-cols-2 gap-10 md:grid-cols-6">
            {/* Brand column */}
            <div className="col-span-2">
              <Logo />
              <p className="mt-4 max-w-xs text-slate-400 text-sm leading-relaxed">
                {t("tagline")}
              </p>
            </div>

            {/* Link columns */}
            {Object.entries(FOOTER_LINKS).map(([title, links]) => (
              <div key={title}>
                <h4 className="mb-4 font-semibold text-sm text-white">
                  {title}
                </h4>
                <ul className="space-y-2.5">
                  {links.map((l) => (
                    <li key={l.label}>
                      {"external" in l && l.external ? (
                        <a
                          className="text-slate-400 text-sm transition hover:text-white"
                          href={l.href}
                        >
                          {l.label}
                        </a>
                      ) : (
                        <Link
                          className="text-slate-400 text-sm transition hover:text-white"
                          href={l.href}
                        >
                          {l.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="mt-16 flex flex-col items-center justify-between gap-4 border-slate-800 border-t pt-8 sm:flex-row">
            <p className="text-slate-500 text-xs">
              &copy; {new Date().getFullYear()} Zenda. {t("copyright")}
            </p>
            <div className="flex items-center gap-4">
              <LanguageSwitcher variant="footer" />
              <div className="flex items-center gap-2 text-slate-400">
                <Send className="size-4" />
                <span className="text-xs">{t("builtIn")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { MessageCircle, Send } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Link } from "@/i18n/navigation";

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <MessageCircle
          className="size-6 fill-emerald-400 stroke-slate-900 text-emerald-400"
          strokeWidth={2}
        />
        <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-slate-900 bg-emerald-400" />
      </div>
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
      { label: t("contact"), href: "mailto:hello@zenda.bot" },
    ],
    [t("legal")]: [
      { label: t("privacyPolicy"), href: "/legal/privacy" },
      { label: t("termsOfService"), href: "/legal/terms" },
    ],
  };

  return (
    <footer className="bg-neutral-200 px-4 py-6 md:px-8">
      <div className="overflow-hidden rounded-[2rem] bg-slate-950">
        <div className="mx-auto max-w-7xl px-8 py-16">
          <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
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
                      <Link
                        className="text-slate-400 text-sm transition hover:text-white"
                        href={l.href}
                      >
                        {l.label}
                      </Link>
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

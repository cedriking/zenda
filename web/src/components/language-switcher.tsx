"use client";

import { ChevronDown, Globe } from "lucide-react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { supportedLanguages } from "@/i18n/routing";

export function LanguageSwitcher({
  variant = "header",
}: {
  variant?: "header" | "footer";
}) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function handleChange(newLocale: string) {
    router.replace(pathname, { locale: newLocale });
  }

  const isDark = variant === "footer";

  return (
    <div className="relative inline-flex items-center">
      <Globe
        className={`mr-1.5 size-4 ${isDark ? "text-slate-400" : "text-slate-500"}`}
      />
      <select
        aria-label="Language"
        className={`cursor-pointer appearance-none rounded bg-transparent pr-4 font-medium text-sm focus:ring-2 focus:ring-emerald-500 ${
          isDark
            ? "text-slate-400 hover:text-white"
            : "text-slate-600 hover:text-slate-900"
        }`}
        onChange={(e) => handleChange(e.target.value)}
        value={locale}
      >
        {supportedLanguages.map((lang) => (
          <option key={lang.key} value={lang.key}>
            {lang.nativeName}
          </option>
        ))}
      </select>
      <ChevronDown
        className={`pointer-events-none absolute right-0 size-3 ${isDark ? "text-slate-400" : "text-slate-500"}`}
      />
    </div>
  );
}

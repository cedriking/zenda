"use client";

import { Menu, MessageCircle, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Link, usePathname } from "@/i18n/navigation";

function Logo() {
  return (
    <Link className="group flex items-center gap-2" href="/">
      <div className="relative">
        <MessageCircle
          className="size-7 fill-emerald-500 stroke-white text-emerald-500"
          strokeWidth={2}
        />
        <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400" />
      </div>
      <span className="font-bold text-slate-900 text-xl">Zenda</span>
    </Link>
  );
}

function PrimaryButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2.5 font-semibold text-sm text-white shadow-emerald-500/20 shadow-lg transition-colors hover:bg-emerald-600"
      href={href}
    >
      {children}
    </Link>
  );
}

function GhostButton({
  href,
  children,
  dark = false,
}: {
  href: string;
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <Link
      className={`inline-flex items-center justify-center rounded-full px-5 py-2.5 font-semibold text-sm transition-colors ${
        dark
          ? "text-slate-300 hover:bg-white/10 hover:text-white"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
      href={href}
    >
      {children}
    </Link>
  );
}

export function Nav({ variant = "home" }: { variant?: "home" | "simple" }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const previousScrolled = useRef(false);

  const NAV_LINKS = [
    { href: "/features", label: t("features"), hash: false },
    { href: "/pricing", label: t("pricing"), hash: false },
    {
      href: isHome ? "#how-it-works" : "/#how-it-works",
      label: t("howItWorks"),
      hash: isHome,
    },
    { href: isHome ? "#faq" : "/#faq", label: t("faq"), hash: isHome },
  ] as const;

  useEffect(() => {
    const onScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== previousScrolled.current) {
        previousScrolled.current = isScrolled;
        setScrolled(isScrolled);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleMobileClose = useCallback(() => setMobileOpen(false), []);

  const handlePanelKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setMobileOpen(false);
    }
  }, []);

  if (variant === "simple") {
    return (
      <nav className="fixed top-0 z-50 w-full border-slate-200 border-b bg-white shadow-sm transition-all duration-300">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Logo />
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <GhostButton href="/login">{t("login")}</GhostButton>
            <PrimaryButton href="/signup">{t("getStarted")}</PrimaryButton>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav
      className={`fixed top-0 z-50 w-full transition-all duration-500 ${
        scrolled
          ? "border-slate-200/60 border-b bg-white/80 shadow-sm backdrop-blur-xl"
          : "border-transparent border-b bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Logo />

        <div className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((l) =>
            l.hash ? (
              <a
                className="font-medium text-slate-600 text-sm transition-colors hover:text-slate-900"
                href={l.href}
                key={l.href}
              >
                {l.label}
              </a>
            ) : (
              <Link
                className="font-medium text-slate-600 text-sm transition-colors hover:text-slate-900"
                href={l.href}
                key={l.href}
              >
                {l.label}
              </Link>
            )
          )}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher />
          <GhostButton href="/login">{t("login")}</GhostButton>
          <PrimaryButton href="/signup">{t("getStarted")}</PrimaryButton>
        </div>

        <button
          aria-controls="mobile-menu"
          aria-expanded={mobileOpen}
          aria-label={t("menuToggle")}
          className="p-2 text-slate-600 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="border-slate-200 border-b bg-white px-6 pb-4 md:hidden"
          id="mobile-menu"
          onKeyDown={handlePanelKeyDown}
        >
          <div className="flex flex-col gap-3">
            {NAV_LINKS.map((l) =>
              l.hash ? (
                <a
                  className="py-2 font-medium text-slate-600 text-sm hover:text-slate-900"
                  href={l.href}
                  key={l.href}
                  onClick={handleMobileClose}
                >
                  {l.label}
                </a>
              ) : (
                <Link
                  className="py-2 font-medium text-slate-600 text-sm hover:text-slate-900"
                  href={l.href}
                  key={l.href}
                  onClick={handleMobileClose}
                >
                  {l.label}
                </Link>
              )
            )}
            <div className="flex flex-col gap-2 pt-2">
              <LanguageSwitcher />
              <GhostButton href="/login">{t("login")}</GhostButton>
              <PrimaryButton href="/signup">{t("getStarted")}</PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

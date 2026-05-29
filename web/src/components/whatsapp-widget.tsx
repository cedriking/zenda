"use client";

import { MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

export function WhatsAppWidget() {
  const t = useTranslations("whatsappWidget");
  const [open, setOpen] = useState(false);

  const chatUrl = WHATSAPP_NUMBER
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(t("defaultMessage"))}`
    : "https://zenda.bot/es/demo";

  return (
    <div className="fixed right-6 bottom-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="fade-in slide-in-from-bottom-2 w-72 animate-in rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-green-500">
              <MessageCircle className="size-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm">Zenda</p>
              <p className="text-gray-500 text-xs">{t("replyTime")}</p>
            </div>
          </div>
          <p className="mb-4 text-gray-600 text-sm">{t("description")}</p>
          <a
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-2.5 font-medium text-sm text-white transition-colors hover:bg-green-600"
            href={chatUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            <MessageCircle className="size-4" />
            {t("startChat")}
          </a>
        </div>
      )}
      <button
        aria-label={t("openChat")}
        className="flex size-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-transform hover:scale-110 hover:bg-green-600"
        onClick={() => setOpen(!open)}
        type="button"
      >
        {open ? (
          <svg
            aria-label="Cerrar"
            className="size-6"
            fill="none"
            role="img"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <title>Cerrar</title>
            <path
              d="M6 18L18 6M6 6l12 12"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <MessageCircle className="size-7" />
        )}
      </button>
    </div>
  );
}

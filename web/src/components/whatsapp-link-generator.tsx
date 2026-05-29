"use client";

import { Check, Copy, ExternalLink, MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const COUNTRY_CODES = [
  { code: "52", label: "+52", country: "Mexico", flag: "MX" },
  { code: "57", label: "+57", country: "Colombia", flag: "CO" },
  { code: "54", label: "+54", country: "Argentina", flag: "AR" },
  { code: "56", label: "+56", country: "Chile", flag: "CL" },
  { code: "51", label: "+51", country: "Peru", flag: "PE" },
  { code: "53", label: "+53", country: "Cuba", flag: "CU" },
  { code: "591", label: "+591", country: "Bolivia", flag: "BO" },
  { code: "593", label: "+593", country: "Ecuador", flag: "EC" },
  { code: "595", label: "+595", country: "Paraguay", flag: "PY" },
  { code: "598", label: "+598", country: "Uruguay", flag: "UY" },
  { code: "58", label: "+58", country: "Venezuela", flag: "VE" },
  { code: "34", label: "+34", country: "Espana", flag: "ES" },
  { code: "1", label: "+1", country: "USA / Canada", flag: "US" },
];

const MAX_MESSAGE_LENGTH = 1024;

function formatPhoneNumber(phone: string): string {
  return phone.replace(/\D/g, "");
}

function generateWhatsAppLink(
  countryCode: string,
  phone: string,
  message: string
): string {
  const cleanPhone = formatPhoneNumber(phone);
  if (!cleanPhone) {
    return "";
  }

  const fullNumber = `${countryCode}${cleanPhone}`;
  let link = `https://wa.me/${fullNumber}`;

  if (message.trim()) {
    link += `?text=${encodeURIComponent(message)}`;
  }

  return link;
}

export function WhatsAppLinkGenerator() {
  const t = useTranslations("waLinkGenerator");
  const [countryCode, setCountryCode] = useState("52");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(t("defaultMessage"));
  const [copied, setCopied] = useState(false);

  const generatedLink = generateWhatsAppLink(countryCode, phone, message);
  const charCount = message.length;
  const isPhoneValid = formatPhoneNumber(phone).length >= 8;

  function handleCopy() {
    if (!generatedLink) {
      return;
    }

    navigator.clipboard.writeText(generatedLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.replace(/\D/g, "");
    setPhone(value);
  }

  return (
    <section className="mx-auto max-w-2xl px-6 pb-16">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-center gap-3 bg-emerald-600 px-6 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
            <MessageCircle className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-white">{t("headerTitle")}</p>
            <p className="text-emerald-100 text-xs">{t("headerSubtitle")}</p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-5 p-6">
          {/* Country code + Phone */}
          <div>
            <label
              className="mb-1.5 block font-medium text-slate-700 text-sm"
              htmlFor="phone"
            >
              {t("phoneLabel")}
            </label>
            <div className="flex gap-2">
              <select
                className="w-36 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-700 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                onChange={(e) => setCountryCode(e.target.value)}
                value={countryCode}
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.label} ({c.country})
                  </option>
                ))}
              </select>
              <input
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 text-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                id="phone"
                onChange={handlePhoneChange}
                placeholder={t("phonePlaceholder")}
                type="tel"
                value={phone}
              />
            </div>
            <p className="mt-1 text-slate-400 text-xs">{t("phoneHint")}</p>
          </div>

          {/* Message */}
          <div>
            <label
              className="mb-1.5 block font-medium text-slate-700 text-sm"
              htmlFor="message"
            >
              {t("messageLabel")}
            </label>
            <textarea
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 text-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              id="message"
              maxLength={MAX_MESSAGE_LENGTH}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("messagePlaceholder")}
              rows={3}
              value={message}
            />
            <div className="mt-1 flex justify-between">
              <p className="text-slate-400 text-xs">{t("messageHint")}</p>
              <p
                className={`text-xs ${
                  charCount > MAX_MESSAGE_LENGTH * 0.9
                    ? "text-amber-600"
                    : "text-slate-400"
                }`}
              >
                {charCount}/{MAX_MESSAGE_LENGTH}
              </p>
            </div>
          </div>

          {/* Generated link */}
          {generatedLink && (
            <div>
              <p className="mb-1.5 block font-medium text-slate-700 text-sm">
                {t("yourLink")}
              </p>
              <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                <code className="min-w-0 flex-1 overflow-x-auto break-all font-mono text-emerald-800 text-xs">
                  {generatedLink}
                </code>
                <button
                  className="shrink-0 rounded-md bg-emerald-600 p-2 text-white hover:bg-emerald-700 disabled:opacity-50"
                  disabled={!isPhoneValid}
                  onClick={handleCopy}
                  title={t("copyLink")}
                  type="button"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Copy button */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              className="flex-1 bg-emerald-600 font-semibold hover:bg-emerald-700 disabled:opacity-50"
              disabled={!isPhoneValid}
              onClick={handleCopy}
              size="lg"
            >
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  {t("copied")}
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  {t("copyLink")}
                </>
              )}
            </Button>

            {generatedLink && isPhoneValid && (
              <a
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-6 py-2.5 font-semibold text-slate-700 text-sm transition-colors hover:bg-slate-50"
                href={generatedLink}
                rel="noopener noreferrer"
                target="_blank"
              >
                <ExternalLink className="h-4 w-4" />
                {t("testLink")}
              </a>
            )}
          </div>
        </div>

        {/* Preview */}
        {generatedLink && isPhoneValid && (
          <div className="border-slate-100 border-t bg-slate-50 p-6">
            <p className="mb-3 font-medium text-slate-600 text-xs uppercase tracking-wide">
              {t("preview")}
            </p>
            <div className="overflow-hidden rounded-xl border border-green-200 bg-green-50">
              {/* WhatsApp header */}
              <div className="flex items-center gap-3 bg-green-600 px-4 py-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                  <MessageCircle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-white">
                    {t("previewBusiness")}
                  </p>
                  <p className="text-green-100 text-xs">{t("previewLink")}</p>
                </div>
              </div>
              {/* Chat bubble preview */}
              <div className="bg-[#e5ddd5] px-3 py-4">
                {message.trim() && (
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-lg rounded-tr-none bg-green-100 px-3 py-2 shadow-sm">
                      <p className="whitespace-pre-line text-slate-800 text-sm">
                        {message}
                      </p>
                      <p className="mt-1 text-right text-[10px] text-green-700">
                        {t("previewNow")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {/* Input bar */}
              <div className="flex items-center gap-2 bg-green-50 px-3 py-2">
                <div className="flex-1 rounded-full bg-white px-4 py-1.5 text-slate-400 text-sm">
                  {t("previewInput")}
                </div>
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-600">
                  <MessageCircle className="h-3 w-3 text-white" />
                </div>
              </div>
            </div>
            <p className="mt-2 text-center text-slate-400 text-xs">
              {t("previewCaption")}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

"use client";

import { NextIntlClientProvider } from "next-intl";

export function LocaleProvider({
  locale,
  messages,
  now,
  children,
}: {
  locale: string;
  messages: Record<string, unknown>;
  now: Date;
  children: React.ReactNode;
}) {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      now={now}
      timeZone="UTC"
    >
      {children}
    </NextIntlClientProvider>
  );
}

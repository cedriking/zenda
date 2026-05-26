"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function CheckoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("common");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <h1 className="mb-4 font-bold text-2xl text-destructive">
        {t("errorTitle")}
      </h1>
      <p className="mb-6 max-w-md text-center text-muted-foreground">
        {t("errorDescription")}
      </p>
      <button
        className="rounded-lg bg-slate-900 px-6 py-2.5 font-medium text-sm text-white hover:bg-slate-800"
        onClick={reset}
        type="button"
      >
        {t("errorRetry")}
      </button>
    </div>
  );
}

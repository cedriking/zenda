"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { getAccessToken, apiFetch } from "@/lib/api-client";
import { getStripe } from "@/lib/stripe";
import { useRouter, useSearchParams } from "@/i18n/navigation";
import { Nav } from "@/components/nav";

export default function CheckoutPage() {
  const t = useTranslations("pricing");
  const router = useRouter();
  const searchParams = useSearchParams();
  const tier = searchParams.get("tier") ?? "";
  const [error, setError] = useState("");

  useEffect(() => {
    async function initiateCheckout() {
      const token = getAccessToken();

      if (!token) {
        // Not logged in — redirect to signup with checkout intent
        router.replace(`/signup?checkout=${encodeURIComponent(tier)}`);
        return;
      }

      try {
        const data = await apiFetch<{ url: string }>("/billing/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ tier }),
        });

        if (data.url) {
          window.location.href = data.url;
          return;
        }
        setError("No checkout URL returned");
      } catch (err) {
        setError((err as Error).message || "Checkout failed");
      }
    }

    if (tier) {
      initiateCheckout();
    } else {
      router.replace("/pricing");
    }
  }, [tier, router]);

  return (
    <div className="flex min-h-screen flex-col pt-16">
      <Nav variant="simple" />
      <main className="flex flex-1 items-center justify-center px-6">
        <div className="text-center">
          {error ? (
            <>
              <h1 className="mb-4 font-bold text-2xl text-destructive">
                Checkout Error
              </h1>
              <p className="mb-6 text-muted-foreground">{error}</p>
              <button
                type="button"
                onClick={() => router.push("/pricing")}
                className="rounded-lg bg-slate-900 px-6 py-2.5 font-medium text-sm text-white hover:bg-slate-800"
              >
                Back to Pricing
              </button>
            </>
          ) : (
            <>
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
              <p className="text-muted-foreground">Redirecting to checkout...</p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

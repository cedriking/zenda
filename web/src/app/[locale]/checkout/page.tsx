"use client";

import { useEffect, useState } from "react";
import { Nav } from "@/components/nav";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { apiFetch, getAccessToken } from "@/lib/api-client";

export default function CheckoutPage() {
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
          body: JSON.stringify({ tier }),
        });

        if (data.url) {
          window.location.href = data.url;
          return;
        }
        setError("No checkout URL returned");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Checkout failed");
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
                className="rounded-lg bg-slate-900 px-6 py-2.5 font-medium text-sm text-white hover:bg-slate-800"
                onClick={() => router.push("/pricing")}
                type="button"
              >
                Back to Pricing
              </button>
            </>
          ) : (
            <>
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
              <p className="text-muted-foreground">
                Redirecting to checkout...
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

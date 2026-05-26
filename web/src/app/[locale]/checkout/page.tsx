import { Suspense } from "react";
import CheckoutClient from "./checkout-client";

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
        </div>
      }
    >
      <CheckoutClient />
    </Suspense>
  );
}

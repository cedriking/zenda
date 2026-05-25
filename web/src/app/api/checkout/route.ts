import { type NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://zenda.bot";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tier = searchParams.get("tier");

  if (!tier) {
    return NextResponse.redirect(`${APP_BASE_URL}/pricing`);
  }

  // Check for stored auth token in cookie or redirect to signup
  // The web app uses localStorage for tokens (not cookies), so we can't read them server-side.
  // Instead, redirect to a client-side page that handles the checkout flow.
  return NextResponse.redirect(
    `${APP_BASE_URL}/checkout?tier=${encodeURIComponent(tier)}`
  );
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { tier: string };
  const { tier } = body;

  if (!tier) {
    return NextResponse.json({ error: "Missing tier" }, { status: 400 });
  }

  // Forward to backend checkout endpoint
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json(
      { error: "Not authenticated", redirectUrl: `/signup?checkout=${encodeURIComponent(tier)}` },
      { status: 401 }
    );
  }

  try {
    const res = await fetch(`${API_BASE_URL}/billing/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({ tier }),
    });

    if (!res.ok) {
      const errData = (await res.json()) as { error?: string };
      return NextResponse.json(
        { error: errData.error ?? "Checkout failed" },
        { status: res.status }
      );
    }

    const data = (await res.json()) as { url: string };
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

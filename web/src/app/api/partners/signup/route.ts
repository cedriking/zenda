import { type NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      website?: string;
      howRefer?: string;
    };

    const { name, email } = body;

    if (!(name && email)) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    const res = await fetch(`${API_BASE_URL}/partners/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = (await res.json()) as {
      error?: string;
      referralCode?: string;
      referralLink?: string;
    };

    if (!res.ok) {
      return NextResponse.json(
        { error: data.error ?? "Signup failed" },
        { status: res.status }
      );
    }

    return NextResponse.json({
      success: true,
      referralCode: data.referralCode,
      referralLink: data.referralLink,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

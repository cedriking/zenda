import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { cta, features, taglines } from "@/lib/og-data";

export const runtime = "edge";

export function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const locale = searchParams.get("locale") || "en";

  const isRtl = locale === "ar";
  const direction = isRtl ? "rtl" : "ltr";
  const textAlign = isRtl ? "right" : "left";
  const alignItems = isRtl ? "flex-end" : "flex-start";

  const locFeatures = features[locale] ?? features.en;
  const locCta = cta[locale] ?? cta.en;

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems,
        justifyContent: "center",
        backgroundColor: "#0f172a",
        padding: "80px",
        direction,
        textAlign,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: 6,
          background: "linear-gradient(to right, #10b981, #34d399)",
        }}
      />
      <div
        style={{
          fontSize: 80,
          fontWeight: 800,
          color: "#ffffff",
          lineHeight: 1.1,
        }}
      >
        Zenda
      </div>
      <div
        style={{
          fontSize: 36,
          color: "#94a3b8",
          marginTop: 16,
          lineHeight: 1.3,
        }}
      >
        {taglines[locale] || taglines.en}
      </div>
      <div
        style={{
          fontSize: 22,
          color: "#10b981",
          fontWeight: 600,
          marginTop: 40,
          display: "flex",
          gap: 24,
        }}
      >
        <span>{locFeatures[0]}</span>
        <span style={{ color: "#475569" }}>·</span>
        <span>{locFeatures[1]}</span>
        <span style={{ color: "#475569" }}>·</span>
        <span>{locFeatures[2]}</span>
      </div>
      <div
        style={{
          marginTop: 48,
          backgroundColor: "#10b981",
          borderRadius: 12,
          padding: "16px 40px",
          fontSize: 22,
          fontWeight: 700,
          color: "#ffffff",
        }}
      >
        {locCta}
      </div>
      <div style={{ fontSize: 18, color: "#475569", marginTop: 24 }}>
        zenda.bot
      </div>
    </div>,
    { width: 1200, height: 630 }
  );
}

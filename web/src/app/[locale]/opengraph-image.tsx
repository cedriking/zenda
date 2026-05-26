import { ImageResponse } from "next/og";
import { taglines, features, cta } from "@/lib/og-data";

export const alt = "Zenda — AI Receptionist for Your Business";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const tagline = taglines[locale] || taglines.en;
  const locFeatures = features[locale] ?? features.en;
  const locCta = cta[locale] ?? cta.en;

  const isRtl = locale === "ar";
  const direction = isRtl ? "rtl" : "ltr";
  const textAlign = isRtl ? "right" : "left";
  const alignItems = isRtl ? "flex-end" : "flex-start";

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
      {/* Accent bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "6px",
          background: "linear-gradient(to right, #10b981, #34d399)",
        }}
      />
      {/* Brand */}
      <div
        style={{
          display: "flex",
          fontSize: 80,
          fontWeight: 800,
          color: "#ffffff",
          lineHeight: 1.1,
        }}
      >
        Zenda
      </div>
      {/* Tagline */}
      <div
        style={{
          display: "flex",
          fontSize: 36,
          color: "#94a3b8",
          marginTop: 16,
          lineHeight: 1.3,
        }}
      >
        {tagline}
      </div>
      {/* Features */}
      <div
        style={{
          display: "flex",
          fontSize: 22,
          color: "#10b981",
          fontWeight: 600,
          marginTop: 40,
          gap: 24,
        }}
      >
        <span>{locFeatures[0]}</span>
        <span style={{ color: "#475569" }}>·</span>
        <span>{locFeatures[1]}</span>
        <span style={{ color: "#475569" }}>·</span>
        <span>{locFeatures[2]}</span>
      </div>
      {/* CTA Button */}
      <div
        style={{
          display: "flex",
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
      {/* URL */}
      <div
        style={{
          display: "flex",
          fontSize: 18,
          color: "#475569",
          marginTop: 24,
        }}
      >
        zenda.bot
      </div>
    </div>,
    {
      ...size,
    }
  );
}

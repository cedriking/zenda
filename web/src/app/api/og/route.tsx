import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const locale = searchParams.get("locale") || "en";

  const taglines: Record<string, string> = {
    en: "Your AI receptionist that never misses a message.",
    es: "Tu recepcionista IA que nunca pierde un mensaje.",
    fr: "Votre réceptionniste IA qui ne rate aucun message.",
    de: "Ihr KI-Empfänger, der keine Nachricht verpasst.",
    pt: "Seu recepcionista IA que nunca perde uma mensagem.",
    ja: "メッセージを見逃さないAI受付。",
    ko: "메시지를 놓치지 않는 AI 리셉셔니스트.",
    zh: "永不漏消息的AI前台。",
    ru: "ИИ-ресепшн, который не пропускает ни одного сообщения.",
    ar: "خدمة استقبال بالذكاء الاصطناعي لا تفوت أي رسالة.",
  };

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        backgroundColor: "#0f172a",
        padding: "80px",
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
        <span>WhatsApp AI</span>
        <span style={{ color: "#475569" }}>·</span>
        <span>9 Languages</span>
        <span style={{ color: "#475569" }}>·</span>
        <span>Smart Scheduling</span>
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
        Start Free Trial
      </div>
      <div style={{ fontSize: 18, color: "#475569", marginTop: 24 }}>
        zenda.bot
      </div>
    </div>,
    { width: 1200, height: 630 }
  );
}

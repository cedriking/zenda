/**
 * Shared OG image data — used by both the OG route and opengraph-image.
 * Extracted to a separate file because Next.js route files only allow
 * HTTP method and route config exports.
 */

export const taglines: Record<string, string> = {
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

export const features: Record<string, [string, string, string]> = {
  en: ["WhatsApp AI", "9 Languages", "Smart Scheduling"],
  es: ["IA por WhatsApp", "9 Idiomas", "Agenda Inteligente"],
  pt: ["IA por WhatsApp", "9 Idiomas", "Agendamento Inteligente"],
  de: ["WhatsApp-KI", "9 Sprachen", "Smarte Terminplanung"],
  ru: ["ИИ в WhatsApp", "9 языков", "Умное расписание"],
  zh: ["WhatsApp AI", "9种语言", "智能排期"],
  ja: ["WhatsApp AI", "9言語対応", "スマート予約"],
  ko: ["WhatsApp AI", "9개 언어", "스마트 일정 관리"],
  ar: ["ذكاء اصطناعي واتساب", "9 لغات", "جدولة ذكية"],
};

export const cta: Record<string, string> = {
  en: "Start Free Trial",
  es: "Prueba Gratis",
  pt: "Teste Grátis",
  de: "Kostenlos testen",
  ru: "Бесплатная пробная версия",
  zh: "免费试用",
  ja: "無料トライアル",
  ko: "무료 체험",
  ar: "تجربة مجانية",
};

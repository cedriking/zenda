import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

interface Prospect {
  country: string;
  day: number;
  location: string;
  name: string;
  notes: string;
  vertical: string;
  wa?: string;
}

const SALON_MX =
  "Hola! 👋 Soy [Tu nombre] de Zenda. Vi su salón en Google Maps — ¿usan WhatsApp para agendar citas? Imaginaría si sus clientas pudieran agendar 24/7 sin llamar. Nosotros creamos un asistente que hace justo eso — agenda automáticamente por WhatsApp y envía recordatorios para que no falten. ¿Les gustaría ver cómo funciona en 2 minutos?";
const DENTAL_MX =
  "Buenos días! Soy [Tu nombre] de Zenda. Vi su clínica en Google Maps. Trabajamos con dentistas para automatizar el agendamiento por WhatsApp. Los pacientes pueden agendar citas 24/7, y se envían recordatorios automáticos para reducir las cancelaciones. ¿Podría enviarle un demo rápido? Toma 2 minutos y puede probarlo gratis.";
const SPA_MX =
  "Hola! Soy [Tu nombre] de Zenda. Vi su spa en Google Maps. Tenemos un asistente de WhatsApp que agenda citas automáticamente, envía recordatorios, y maneja las cancelaciones — todo por chat. Sin tener que responder cada mensaje manualmente. ¿Les interesaría probarlo? Es gratis para empezar: https://zenda.bot/es/cita";
const VET_MX =
  "Hola! Soy [Tu nombre] de Zenda. Vi su veterinaria en Google Maps. Los dueños de mascotas pueden agendar consultas por WhatsApp 24/7 con nuestro sistema, y se envían recordatorios automáticos para que no se olviden. ¿Les gustaría ver cómo funciona? Les mando un demo rápido.";
const SALON_AR =
  "Hola! Soy [Tu nombre] de Zenda. Vi su salón en Google Maps. Trabajamos con peluquerías para automatizar los turnos por WhatsApp. Las clientas pueden reservar 24/7, y se mandan recordatorios automáticos para que no falten. ¿Te interesaría probarlo? Es gratis para empezar.";
const DENTAL_AR =
  "Buenos días! Soy [Tu nombre] de Zenda. Trabajamos con clínicas dentales para automatizar el agendamiento por WhatsApp. Los pacientes reducen las cancelaciones un 40% con recordatorios automáticos y confirmación por chat. ¿Podría enviarle un demo rápido? Toma 2 minutos y puede probarlo gratis.";
const SPA_AR =
  "Hola! Soy [Tu nombre] de Zenda. Vi su centro en Google. Es un asistente de WhatsApp que agenda citas automáticamente, envía recordatorios, y maneja las cancelaciones — todo por chat. Sin que tengan que responder cada mensaje. ¿Les interesaría probarlo? Es gratis para empezar: https://zenda.bot/es/cita";
const VET_AR =
  "Hola! Soy [Tu nombre] de Zenda. Trabajamos con veterinarias para automatizar el agendamiento por WhatsApp. Los dueños pueden agendar consultas por WhatsApp 24/7, y se envían recordatorios automáticos para que no se olviden. ¿Les gustaría ver cómo funciona? Les mando un demo rápido.";

function waLink(phone: string, script: string): string {
  const digits = phone.replace(/[^0-9]/g, "");
  const prefix = digits.startsWith("54") ? "" : "";
  return `https://wa.me/${prefix}${digits}?text=${encodeURIComponent(script)}`;
}

const PROSPECTS: Prospect[] = (() => {
  try {
    const raw = process.env.OUTREACH_PROSPECTS;
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(
      (p: unknown): p is Prospect =>
        typeof p === "object" &&
        p !== null &&
        typeof (p as Prospect).name === "string" &&
        typeof (p as Prospect).country === "string"
    );
  } catch {
    return [];
  }
})();

function getScript(p: Prospect): string {
  if (p.country === "MX") {
    if (p.vertical.includes("Salón") || p.vertical.includes("Barber")) {
      return SALON_MX;
    }
    if (p.vertical.includes("Dental")) {
      return DENTAL_MX;
    }
    if (p.vertical.includes("Spa")) {
      return SPA_MX;
    }
    if (p.vertical.includes("Vet")) {
      return VET_MX;
    }
    return SALON_MX;
  }
  if (p.vertical.includes("Salón") || p.vertical.includes("Peluquería")) {
    return SALON_AR;
  }
  if (p.vertical.includes("Dental")) {
    return DENTAL_AR;
  }
  if (p.vertical.includes("Spa")) {
    return SPA_AR;
  }
  if (p.vertical.includes("Vet")) {
    return VET_AR;
  }
  return SALON_AR;
}

function generateCards(): string {
  const groups = new Map<number, Prospect[]>();
  for (const p of PROSPECTS) {
    const arr = groups.get(p.day) ?? [];
    arr.push(p);
    groups.set(p.day, arr);
  }

  const parts: string[] = [];
  for (const [day, prospects] of groups) {
    const label =
      day <= 7
        ? `Semana 1 — Día ${day} (México)`
        : `Semana 2 — Día ${day} (Argentina)`;
    parts.push(
      `<div class="day-header">📅 ${label} — ${prospects.length} contactos</div>`
    );
    for (const p of prospects) {
      const idx = PROSPECTS.indexOf(p);
      const hasWa = !!p.wa;
      const sendBtn =
        hasWa && p.wa
          ? `<a class="btn btn-send" href="${waLink(p.wa, getScript(p))}" target="_blank" rel="noopener" onclick="markSent(${idx})">Abrir WhatsApp</a>`
          : `<div class="btn btn-maps" onclick="searchMaps('${encodeURIComponent(`${p.name} ${p.location}`)}')">Buscar en Google Maps</div>`;
      parts.push(`
        <div class="card" id="card-${idx}">
          <div class="top">
            <span class="name">${idx + 1}. ${p.name}</span>
            <span class="status-badge status-pending" id="badge-${idx}">Pendiente</span>
          </div>
          <div class="location">${p.location} · ${p.country === "MX" ? "🇲🇽" : "🇦🇷"}</div>
          <div class="notes">${p.vertical} — ${p.notes}</div>
          ${sendBtn}
          <button class="btn btn-done" type="button" onclick="markSent(${idx})">Marcar enviado</button>
        </div>`);
    }
  }
  return parts.join("");
}

function getHtml(): string {
  const total = PROSPECTS.length;
  const withWa = PROSPECTS.filter((p) => p.wa).length;
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Zenda — Outreach Dashboard</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0f172a;color:#e2e8f0;min-height:100vh;padding:16px;padding-bottom:80px}
.header{text-align:center;margin-bottom:20px}
.header h1{font-size:1.5rem;color:#22c55e;margin-bottom:4px}
.header p{font-size:0.8125rem;color:#94a3b8}
.stats{display:flex;gap:8px;justify-content:center;margin-bottom:16px}
.stat{background:#1e293b;border:1px solid #334155;border-radius:8px;padding:8px 12px;text-align:center;flex:1;max-width:120px}
.stat-num{font-size:1.25rem;font-weight:700;color:#22c55e}
.stat-label{font-size:0.6875rem;color:#64748b}
.progress{text-align:center;margin-bottom:16px;font-size:0.8125rem;color:#94a3b8}
.progress-bar{height:8px;background:#1e293b;border-radius:4px;margin-top:6px;overflow:hidden}
.progress-fill{height:100%;background:linear-gradient(90deg,#22c55e,#16a34a);border-radius:4px;transition:width 0.3s}
.day-header{font-size:0.9375rem;font-weight:700;color:#e2e8f0;margin-top:20px;margin-bottom:8px;padding:8px 12px;background:#1e293b;border-radius:8px;border-left:4px solid #22c55e}
.card{background:#1e293b;border-radius:12px;padding:14px;margin-bottom:10px;border:1px solid #334155;transition:opacity 0.3s}
.card.sent{border-color:#22c55e;opacity:0.5}
.card .top{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}
.card .name{font-weight:600;font-size:0.9375rem;color:#f1f5f9}
.card .location{font-size:0.75rem;color:#64748b;margin-bottom:4px}
.card .notes{font-size:0.75rem;color:#94a3b8;margin-bottom:10px}
.btn{display:block;width:100%;padding:11px;border:none;border-radius:8px;font-size:0.875rem;font-weight:600;cursor:pointer;text-decoration:none;text-align:center}
.btn-send{background:#22c55e;color:#052e16}
.btn-send:hover{background:#16a34a}
.btn-maps{background:#3b82f6;color:#eff6ff}
.btn-maps:hover{background:#2563eb}
.btn-done{background:transparent;color:#64748b;border:1px solid #334155;margin-top:6px}
.btn-done:hover{background:#1e293b;color:#22c55e;border-color:#22c55e}
.status-badge{font-size:0.6875rem;padding:2px 8px;border-radius:9999px}
.status-pending{background:#422006;color:#fbbf24}
.status-sent{background:#052e16;color:#22c55e}
.tip{background:#1e293b;border:1px solid #334155;border-radius:12px;padding:14px;margin-bottom:16px}
.tip h3{font-size:0.8125rem;color:#fbbf24;margin-bottom:6px}
.tip ol{padding-left:18px;font-size:0.75rem;color:#94a3b8;line-height:1.8}
.footer{text-align:center;margin-top:24px;font-size:0.6875rem;color:#475569}
</style>
</head>
<body>
<div class="header">
  <h1>Zenda Outreach</h1>
  <p>${total} prospectos · ${withWa} con WhatsApp directo · ~40 min total</p>
</div>
<div class="stats">
  <div class="stat"><div class="stat-num">${total}</div><div class="stat-label">Total</div></div>
  <div class="stat"><div class="stat-num" id="counter">0</div><div class="stat-label">Enviados</div></div>
  <div class="stat"><div class="stat-num" id="remaining">${total}</div><div class="stat-label">Pendientes</div></div>
</div>
<div class="progress">
  <div class="progress-bar"><div class="progress-fill" id="bar" style="width:0%"></div></div>
</div>
<div class="tip">
  <h3>Instrucciones</h3>
  <ol>
    <li>Toca <strong>"Abrir WhatsApp"</strong> — se abre con el mensaje listo</li>
    <li>Reemplaza <strong>[Tu nombre]</strong> con tu nombre real</li>
    <li>Envía el mensaje</li>
    <li>Regresa y toca <strong>"Marcar enviado"</strong></li>
    <li>Si no hay botón de WhatsApp: busca en Google Maps primero</li>
  </ol>
</div>
<div id="cards">${generateCards()}</div>
<div class="footer">zenda.bot · Dashboard de Outreach</div>
<script>
var STORAGE_KEY='zenda-outreach-v2';
var TOTAL=${total};
function getSent(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]')}catch(e){return[]}}
function saveSent(s){localStorage.setItem(STORAGE_KEY,JSON.stringify(s))}
function updateProgress(){var s=getSent();var c=s.length;document.getElementById('counter').textContent=c;document.getElementById('remaining').textContent=TOTAL-c;document.getElementById('bar').style.width=(c/TOTAL*100)+'%'}
function markSent(i){var s=getSent();if(s.indexOf(i)===-1){s.push(i);saveSent(s)}var card=document.getElementById('card-'+i);if(card){card.className='card sent';var badge=document.getElementById('badge-'+i);if(badge){badge.className='status-badge status-sent';badge.textContent='Enviado'}}updateProgress()}
function searchMaps(q){window.open('https://www.google.com/maps/search/'+q,'_blank')}
updateProgress();
</script>
</body>
</html>`;
}

const OUTREACH_PASSWORD = process.env.OUTREACH_PASSWORD;

export function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  const url = new URL(request.url);
  const queryToken = url.searchParams.get("token");

  const providedToken = token ?? queryToken;

  if (!OUTREACH_PASSWORD || providedToken !== OUTREACH_PASSWORD) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  return new NextResponse(getHtml(), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-store",
    },
  });
}

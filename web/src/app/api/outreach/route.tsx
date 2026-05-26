import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PROSPECTS = [
  {
    name: "Diosas Salon de Belleza",
    location: "M\u00e9rida, Yucat\u00e1n",
    vertical: "Belleza",
    notes: "FB activo 2.3K likes, due\u00f1o-operador",
    link: "https://wa.me/529992017207?text=Hola!%20Soy%20[TU_NOMBRE]%20de%20Zenda.%20Vi%20que%20Diosas%20Salon%20agenda%20citas%20por%20WhatsApp%20%E2%80%94%20%C2%BFcu%C3%A1ntas%20citas%20se%20les%20escapan%20al%20d%C3%ADa%20porque%20no%20pueden%20contestar%20r%C3%A1pido%3F%0A%0ACreamos%20una%20asistente%20que%20responde%20en%20segundos%2C%20agenda%20autom%C3%A1ticamente%20y%20manda%20recordatorios.%20Todo%20desde%20su%20WhatsApp%20actual.%0A%0AOferta%20fundador%3A%2014%20d%C3%ADas%20gratis%20%2B%2050%25%20de%20descuento%203%20meses%20(~%24250%20MXN%2Fmes).%20%C2%BFLes%20interesa%3F%20zenda.bot%2Ffounding",
  },
  {
    name: "Silvia Galvan Image Studio",
    location: "CDMX",
    vertical: "Belleza",
    notes: "5 sucursales (Lomas, Condesa, Del Valle, Pedregal, Satelite)",
    link: "https://wa.me/525565381048?text=Hola!%20Soy%20[TU_NOMBRE]%20de%20Zenda.%20Vi%20que%20Silvia%20Galvan%20agenda%20citas%20por%20WhatsApp%20%E2%80%94%20%C2%BFcu%C3%A1ntas%20citas%20se%20les%20escapan%20al%20d%C3%ADa%20porque%20no%20pueden%20contestar%20r%C3%A1pido%3F%0A%0ACreamos%20una%20asistente%20que%20responde%20en%20segundos%2C%20agenda%20autom%C3%A1ticamente%20y%20manda%20recordatorios.%20Todo%20desde%20su%20WhatsApp%20actual.%0A%0AOferta%20fundador%3A%2014%20d%C3%ADas%20gratis%20%2B%2050%25%20de%20descuento%203%20meses%20(~%24250%20MXN%2Fmes).%20%C2%BFLes%20interesa%3F%20zenda.bot%2Ffounding",
  },
  {
    name: "MaquillarteVegetal",
    location: "Guadalajara, Jalisco",
    vertical: "Makeup",
    notes: "Makeup, laminado de cejas, faciales, cortes, u\u00f1as",
    link: "https://wa.me/523325903186?text=Hola!%20Soy%20[TU_NOMBRE]%20de%20Zenda.%20Vi%20que%20MaquillarteVegetal%20agenda%20citas%20por%20WhatsApp%20%E2%80%94%20%C2%BFcu%C3%A1ntas%20citas%20se%20les%20escapan%20al%20d%C3%ADa%20porque%20no%20pueden%20contestar%20r%C3%A1pido%3F%0A%0ACreamos%20una%20asistente%20que%20responde%20en%20segundos%2C%20agenda%20autom%C3%A1ticamente%20y%20manda%20recordatorios.%20Todo%20desde%20su%20WhatsApp%20actual.%0A%0AOferta%20fundador%3A%2014%20d%C3%ADas%20gratis%20%2B%2050%25%20de%20descuento%203%20meses%20(~%24250%20MXN%2Fmes).%20%C2%BFLes%20interesa%3F%20zenda.bot%2Ffounding",
  },
  {
    name: "NyxSpa",
    location: "Canc\u00fan, Quintana Roo",
    vertical: "Spa",
    notes: "Blvd. Kukulkan zona hotelera, ticket alto",
    link: "https://wa.me/529981016656?text=Hola!%20Soy%20[TU_NOMBRE]%20de%20Zenda.%20Los%20spas%20pierden%20hasta%2030%25%20de%20citas%20potenciales%20por%20respuestas%20lentas%20en%20WhatsApp.%0A%0AZenda%20es%20una%20asistente%20virtual%20que%20contesta%20en%20segundos%2C%20confirma%20citas%20y%20env%C3%ADa%20recordatorios%20%E2%80%94%20sus%20clientas%20nunca%20esperan.%0A%0AOferta%20fundador%3A%2014%20d%C3%ADas%20gratis%20%2B%2050%25%20off%20(~%24250%20MXN%2Fmes)%3A%20zenda.bot%2Ffounding",
  },
  {
    name: "MAR Franco Beauty Salon",
    location: "Monterrey, Nuevo Le\u00f3n",
    vertical: "Belleza/U\u00f1as",
    notes: "Guadalupe NL, WhatsApp confirmado",
    link: "https://wa.me/528118164411?text=Hola!%20Soy%20[TU_NOMBRE]%20de%20Zenda.%20Vi%20que%20MAR%20Franco%20agenda%20citas%20por%20WhatsApp%20%E2%80%94%20%C2%BFcu%C3%A1ntas%20citas%20se%20les%20escapan%20al%20d%C3%ADa%20porque%20no%20pueden%20contestar%20r%C3%A1pido%3F%0A%0ACreamos%20una%20asistente%20que%20responde%20en%20segundos%2C%20agenda%20autom%C3%A1ticamente%20y%20manda%20recordatorios.%20Todo%20desde%20su%20WhatsApp%20actual.%0A%0AOferta%20fundador%3A%2014%20d%C3%ADas%20gratis%20%2B%2050%25%20de%20descuento%203%20meses%20(~%24250%20MXN%2Fmes).%20%C2%BFLes%20interesa%3F%20zenda.bot%2Ffounding",
  },
  {
    name: "Rafaella Salon",
    location: "Monterrey, Nuevo Le\u00f3n",
    vertical: "Belleza",
    notes: "Belleza y maquillaje profesional",
    link: "https://wa.me/528110226671?text=Hola!%20Soy%20[TU_NOMBRE]%20de%20Zenda.%20Vi%20que%20Rafaella%20Salon%20agenda%20citas%20por%20WhatsApp%20%E2%80%94%20%C2%BFcu%C3%A1ntas%20citas%20se%20les%20escapan%20al%20d%C3%ADa%20porque%20no%20pueden%20contestar%20r%C3%A1pido%3F%0A%0ACreamos%20una%20asistente%20que%20responde%20en%20segundos%2C%20agenda%20autom%C3%A1ticamente%20y%20manda%20recordatorios.%20Todo%20desde%20su%20WhatsApp%20actual.%0A%0AOferta%20fundador%3A%2014%20d%C3%ADas%20gratis%20%2B%2050%25%20de%20descuento%203%20meses%20(~%24250%20MXN%2Fmes).%20%C2%BFLes%20interesa%3F%20zenda.bot%2Ffounding",
  },
  {
    name: "Gentlemen's Barber Shop",
    location: "Monterrey, Nuevo Le\u00f3n",
    vertical: "Barber\u00eda",
    notes: "Listado en AllBiz, tel\u00e9fono confirmado",
    link: "https://wa.me/528116208450?text=Hola!%20Soy%20[TU_NOMBRE]%20de%20Zenda.%20Barber%C3%ADas%20como%20Gentlemen%27s%20pierden%20clientes%20cada%20d%C3%ADa%20porque%20no%20pueden%20contestar%20WhatsApp%20mientras%20cortan%20el%20pelo.%0A%0AZenda%20responde%20por%20ti%20en%20segundos%2C%20agenda%20la%20cita%20y%20manda%20recordatorios%20%E2%80%94%20todo%20autom%C3%A1tico.%0A%0A14%20d%C3%ADas%20gratis%20%2B%2050%25%20de%20descuento%20para%20los%20primeros%2010%20negocios%20(~%24250%20MXN%2Fmes)%3A%20zenda.bot%2Ffounding",
  },
  {
    name: "Mr. Barber's Club",
    location: "Monterrey, Nuevo Le\u00f3n",
    vertical: "Barber\u00eda",
    notes: "Tel\u00e9fono confirmado",
    link: "https://wa.me/528127190953?text=Hola!%20Soy%20[TU_NOMBRE]%20de%20Zenda.%20Barber%C3%ADas%20como%20Mr.%20Barber%27s%20Club%20pierden%20clientes%20cada%20d%C3%ADa%20porque%20no%20pueden%20contestar%20WhatsApp%20mientras%20cortan%20el%20pelo.%0A%0AZenda%20responde%20por%20ti%20en%20segundos%2C%20agenda%20la%20cita%20y%20manda%20recordatorios%20%E2%80%94%20todo%20autom%C3%A1tico.%0A%0A14%20d%C3%ADas%20gratis%20%2B%2050%25%20de%20descuento%20(~%24250%20MXN%2Fmes)%3A%20zenda.bot%2Ffounding",
  },
  {
    name: "Dante Spa For Men",
    location: "M\u00e9rida, Yucat\u00e1n",
    vertical: "Spa masculino",
    notes: "WhatsApp confirmado",
    link: "https://wa.me/529992349251?text=Hola!%20Soy%20[TU_NOMBRE]%20de%20Zenda.%20Los%20spas%20pierden%20hasta%2030%25%20de%20citas%20potenciales%20por%20respuestas%20lentas%20en%20WhatsApp.%0A%0AZenda%20es%20una%20asistente%20virtual%20que%20contesta%20en%20segundos%2C%20confirma%20citas%20y%20env%C3%ADa%20recordatorios%20%E2%80%94%20sus%20clientes%20nunca%20esperan.%0A%0AOferta%20fundador%3A%2014%20d%C3%ADas%20gratis%20%2B%2050%25%20off%20(~%24250%20MXN%2Fmes)%3A%20zenda.bot%2Ffounding",
  },
];

function generateCards(): string {
  return PROSPECTS.map(
    (p, i) => `
    <div class="card" id="card-${i}">
      <div class="top">
        <span class="name">${i + 1}. ${p.name}</span>
        <span class="status-badge status-pending" id="badge-${i}">Pendiente</span>
      </div>
      <div class="location">${p.location}</div>
      <div class="notes">${p.vertical} — ${p.notes}</div>
      <a class="btn btn-send" href="${p.link}" target="_blank" rel="noopener" onclick="markSent(${i})">Abrir WhatsApp</a>
      <button class="btn btn-done" type="button" onclick="markSent(${i})">Marcar enviado</button>
    </div>`
  ).join("");
}

function getHtml(): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Zenda — Outreach Dashboard</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0f172a;color:#e2e8f0;min-height:100vh;padding:16px}
.header{text-align:center;margin-bottom:24px}
.header h1{font-size:1.5rem;color:#22c55e;margin-bottom:4px}
.header p{font-size:0.875rem;color:#94a3b8}
.progress{text-align:center;margin-bottom:20px;font-size:0.875rem;color:#94a3b8}
.progress-bar{height:6px;background:#1e293b;border-radius:3px;margin-top:8px}
.progress-fill{height:100%;background:#22c55e;border-radius:3px;transition:width 0.3s}
.card{background:#1e293b;border-radius:12px;padding:16px;margin-bottom:12px;border:1px solid #334155}
.card.sent{border-color:#22c55e;opacity:0.6}
.card .top{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
.card .name{font-weight:600;font-size:1rem;color:#f1f5f9}
.card .location{font-size:0.8125rem;color:#64748b;margin-bottom:8px}
.card .notes{font-size:0.8125rem;color:#94a3b8;margin-bottom:12px}
.btn{display:block;width:100%;padding:12px;border:none;border-radius:8px;font-size:0.9375rem;font-weight:600;cursor:pointer;text-decoration:none;text-align:center}
.btn-send{background:#22c55e;color:#052e16}
.btn-send:hover{background:#16a34a}
.btn-done{background:#1e293b;color:#22c55e;border:1px solid #22c55e;margin-top:8px}
.btn-done:hover{background:#22c55e;color:#052e16}
.status-badge{font-size:0.75rem;padding:2px 8px;border-radius:9999px}
.status-pending{background:#422006;color:#fbbf24}
.status-sent{background:#052e16;color:#22c55e}
.tip{background:#1e293b;border:1px solid #334155;border-radius:12px;padding:16px;margin-bottom:20px}
.tip h3{font-size:0.875rem;color:#fbbf24;margin-bottom:8px}
.tip ol{padding-left:20px;font-size:0.8125rem;color:#94a3b8;line-height:1.8}
</style>
</head>
<body>
<div class="header">
  <h1>Zenda Outreach</h1>
  <p>9 prospectos listos. ~10 minutos.</p>
</div>
<div class="progress">
  <span id="counter">0</span>/9 enviados
  <div class="progress-bar"><div class="progress-fill" id="bar" style="width:0%"></div></div>
</div>
<div class="tip">
  <h3>Instrucciones</h3>
  <ol>
    <li>Toca "Abrir WhatsApp" — se abre con el mensaje listo</li>
    <li>Reemplaza <strong>[TU_NOMBRE]</strong> con tu nombre</li>
    <li>Env\u00eda el mensaje</li>
    <li>Regresa y toca "Marcar enviado"</li>
  </ol>
</div>
<div id="cards">${generateCards()}</div>
<script>
var STORAGE_KEY='zenda-outreach-sent';
function getSent(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]')}catch(e){return[]}}
function saveSent(s){localStorage.setItem(STORAGE_KEY,JSON.stringify(s))}
function updateProgress(){var s=getSent();var c=s.length;document.getElementById('counter').textContent=c;document.getElementById('bar').style.width=(c/${PROSPECTS.length}*100)+'%'}
function markSent(i){var s=getSent();if(s.indexOf(i)===-1){s.push(i);saveSent(s)}var card=document.getElementById('card-'+i);if(card){card.className='card sent';var badge=document.getElementById('badge-'+i);if(badge){badge.className='status-badge status-sent';badge.textContent='Enviado'}}updateProgress()}
updateProgress();
</script>
</body>
</html>`;
}

const OUTREACH_PASSWORD = process.env.OUTREACH_PASSWORD ?? "9996146459";

export function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  const url = new URL(request.url);
  const queryToken = url.searchParams.get("token");

  const providedToken = token ?? queryToken;

  if (providedToken !== OUTREACH_PASSWORD) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  return new NextResponse(getHtml(), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-store",
    },
  });
}

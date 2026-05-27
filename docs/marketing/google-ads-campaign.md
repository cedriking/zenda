# Google Ads Campaign Structure — Zenda

## Campaign: LATAM WhatsApp Appointment Automation

**Campaign Type:** Search
**Target Location:** Mexico, Colombia, Argentina, Chile, Peru, Spain (for LATAM diaspora)
**Language:** Spanish
**Budget:** $10-15/day ($300-450/month)
**Bidding:** Maximize Conversions (signup on /founding page)
**Landing Page:** https://zenda.bot/es/founding

---

## Ad Group 1: Competitor Alternatives

**Keywords (Exact/Phrase):**
- "alternativa calendly whatsapp"
- "alternativa acuity scheduling"
- "alternativa squarespace scheduling"
- "calendly para whatsapp"
- "como calendly pero por whatsapp"
- "programa como calendly para whatsapp"

**Negative Keywords:**
- calendly, acuity, squarespace (brand names alone)

**Ad Copy:**
```
Headline 1: Alternativa a Calendly por WhatsApp
Headline 2: Agenda Citas Automáticamente
Headline 3: Para Salones, Clínicas y Más

Description 1: Zenda es la alternativa a Calendly que funciona por WhatsApp. Tus clientes agendan sin salir del chat.
Description 2: Recibe citas 24/7, reduce ausencias 40%, y gestiona tu agenda automáticamente. Plan gratuito disponible.

Final URL: https://zenda.bot/es/founding
Display Path: /es/founding
```

---

## Ad Group 2: WhatsApp Booking

**Keywords (Exact/Phrase):**
- "agendar citas por whatsapp"
- "sistema de citas whatsapp"
- "reservar citas whatsapp"
- "bot de citas whatsapp"
- "chatbot citas whatsapp"
- "agendar citas whatsapp automatico"
- "whatsapp negocios citas"
- "confirmar citas whatsapp"

**Ad Copy:**
```
Headline 1: Agenda Citas por WhatsApp
Headline 2: Automático 24/7
Headline 3: Sin App Adicional

Description 1: Tus clientes agendan citas directamente por WhatsApp. Automatiza confirmaciones y recordatorios.
Description 2: Funciona para salones, clínicas dentales, veterinarias, spas y más. Configura en 5 minutos.

Final URL: https://zenda.bot/es/founding
Display Path: /es/founding
```

---

## Ad Group 3: Industry-Specific

**Keywords (Exact/Phrase):**
- "citas salon belleza whatsapp"
- "citas clinica dental whatsapp"
- "citas veterinaria whatsapp"
- "citas spa whatsapp"
- "citas barbershop whatsapp"
- "recepcionista virtual whatsapp"
- "recepcionista dental whatsapp"
- "recordatorios citas whatsapp"

**Ad Copy:**
```
Headline 1: Recepcionista por WhatsApp
Headline 2: Para tu Negocio de Citas
Headline 3: Reduce Ausencias 40%

Description 1: Automatiza la agenda de tu salón, clínica o spa por WhatsApp. Sin instalar nada nuevo.
Description 2: Recordatorios automáticos, confirmación por chat, y gestión de horarios. Plan gratuito.

Final URL: https://zenda.bot/es/founding
Display Path: /es/founding
```

---

## Ad Group 4: Problem-Solution

**Keywords (Exact/Phrase):**
- "reducir ausencias citas"
- "no show citas solucion"
- "automatizar citas negocio"
- "recordatorios automaticos citas"
- "gestionar citas whatsapp"
- "cancelaciones citas negocio"

**Ad Copy:**
```
Headline 1: Reduce Ausencias en tu Negocio
Headline 2: Recordatorios Automáticos por WhatsApp
Headline 3: Pruébalo Gratis

Description 1: ¿Tus clientes no llegan a sus citas? Envía recordatorios automáticos por WhatsApp y reduce ausencias.
Description 2: Confirmación con un click, re-agendado fácil, y seguimiento automático. Para negocios de citas.

Final URL: https://zenda.bot/es/founding
Display Path: /es/founding
```

---

## Conversion Tracking Setup

**Prerequisites (in Coolify env vars):**
```
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GOOGLE_ADS_ID=AW-XXXXXXXXX
NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_LABEL=xxxxxxxxxx
```

**Conversion Event:** Already wired in `web/src/components/google-analytics.tsx`
- `trackSignup()` fires on signup form submission
- `trackAdsConversion()` fires on signup completion
- GA component auto-loads when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set

**Setup Steps:**
1. Create GA4 property at analytics.google.com
2. Create Google Ads account, link to GA4
3. Create conversion action (signup), get the label
4. Set the 3 env vars in Coolify
5. Trigger Coolify rebuild (push a commit or manual)
6. Create campaign in Google Ads with the structure above
7. Launch with $10/day budget

---

## Expected Performance

Based on SaaS benchmarks for LATAM Spanish keywords:
- **CPC estimate:** $0.30-0.80 USD (Spanish LATAM keywords are cheaper than English)
- **Daily budget:** $10/day = ~15-30 clicks/day
- **Monthly clicks:** ~450-900
- **Landing page conversion:** Expected 2-5% for founding offer
- **Monthly signups:** 9-45 (at 2-5% conversion)
- **Cost per signup:** $7-50

**Conservative scenario (2% conversion):** 9 signups/month at $33/signup
**Optimistic scenario (5% conversion):** 45 signups/month at $10/signup

Target: 10 paying customers from founding offer ($29/mo) within 60-90 days.

# Google Ads Campaign Specification — Zenda

**Campaign:** Zenda LATAM Search
**Owner:** CMO
**Date:** May 2026
**Status:** Ready for setup
**Related:** ZEN-144, ZEN-145, ZEN-147

---

## 1. Campaign Settings

| Setting | Value |
|---------|-------|
| Campaign type | Search |
| Campaign name | `zenda-latam-search-v1` |
| Language | Spanish |
| Target geographies | Mexico, Colombia, Argentina |
| Daily budget | $7 USD (start), scale to $10 after 2 weeks if CPA < $15 |
| Bidding strategy | Maximize Clicks (initial, until conversion tracking is live per ZEN-145). Switch to Maximize Conversions once tracking is confirmed. |
| Start date | Immediately after conversion tracking is live |
| Ad rotation | Optimize: prefer best performing ads |
| Search network | Google Search only (no Display, no Search partners initially) |
| Devices | All (mobile bias expected — WhatsApp users) |
| Ad schedule | Mon-Sat 8am-9pm local time (business hours in target markets) |

### Geographic targeting detail

| Country | Rationale |
|---------|-----------|
| Mexico | Primary market. Largest Spanish-speaking LATAM country. Strong WhatsApp adoption. ~$503-2,585 MXN price range fits SMB budget. |
| Colombia | Fast-growing WhatsApp Business adoption. Bogotá, Medellín concentrations. |
| Argentina | High smartphone penetration, strong WhatsApp usage. Buenos Aires metro primary. |

---

## 2. Ad Groups

### Ad Group 1: Dental Clinics

**Ad group name:** `zenda-dental`

**Keywords (exact + phrase match):**

| Keyword | Match type |
|---------|-----------|
| `"recepcionista virtual dental"` | Exact |
| `"agendar citas whatsapp dental"` | Exact |
| `"citas dentista whatsapp"` | Exact |
| `"agenda citas clinica dental"` | Phrase |
| `"bot whatsapp citas dentista"` | Phrase |
| `"sistema citas odontologico whatsapp"` | Phrase |
| `"automatizar citas dental"` | Phrase |
| `"recordatorio citas dental whatsapp"` | Phrase |

**Negative keywords:**

| Negative keyword | Reason |
|-----------------|--------|
| `gratis` | Free-seekers, low intent |
| `empleo` | Job seekers |
| `trabajo` | Job seekers |
| `curso` | Students |
| `how to make` | DIY, not buying |
| `open source` | Developers, not customers |
| `api` | Technical, not business audience |
| `软件开发` | Chinese spam |
| `salary` / `salario` | Job seekers |

---

### Ad Group 2: Beauty Salons

**Ad group name:** `zenda-belleza`

**Keywords (exact + phrase match):**

| Keyword | Match type |
|---------|-----------|
| `"agendar citas belleza whatsapp"` | Exact |
| `"reservar cita salon whatsapp"` | Exact |
| `"recepcionista virtual salon"` | Exact |
| `"agenda citas salon belleza"` | Phrase |
| `"bot citas estetica"` | Phrase |
| `"reservaciones salon belleza whatsapp"` | Phrase |
| `"automatizar citas peluqueria"` | Phrase |
| `"confirmar citas salon whatsapp"` | Phrase |
| `"sistema reservas barberia whatsapp"` | Phrase |

**Negative keywords:**

| Negative keyword | Reason |
|-----------------|--------|
| `gratis` | Free-seekers |
| `empleo` / `trabajo` | Job seekers |
| `curso` | Students |
| `producto` | Product shoppers, not appointment businesses |
| `tutorial` | DIY |
| `precio producto` | Product pricing, not SaaS |
| `open source` | Developers |
| `api` | Technical audience |

---

### Ad Group 3: General Appointments

**Ad group name:** `zenda-general-citas`

**Keywords (exact + phrase match):**

| Keyword | Match type |
|---------|-----------|
| `"agendar citas whatsapp"` | Exact |
| `"bot citas whatsapp"` | Exact |
| `"reserva citas online"` | Exact |
| `"agenda automatica whatsapp"` | Exact |
| `"recepcionista virtual whatsapp"` | Phrase |
| `"asistente virtual citas"` | Phrase |
| `"automatizar reservas whatsapp"` | Phrase |
| `"confirmacion citas automatica"` | Phrase |
| `"software citas whatsapp negocio"` | Phrase |
| `"recordatorio citas whatsapp"` | Phrase |

**Negative keywords:**

| Negative keyword | Reason |
|-----------------|--------|
| `gratis` | Free-seekers |
| `empleo` / `trabajo` / `vacante` | Job seekers |
| `curso` / `capacitacion` | Students |
| `hotel` / `restaurante` / `vuelo` | Wrong industry (hospitality, not appointment businesses) |
| `doctor` / `hospital` | Medical institutions (different from dental clinics) |
| `abogado` | Legal, not appointment businesses |
| `open source` | Developers |
| `api` | Technical |
| `whatsapp web` | Feature seekers, not business |

---

## 3. Ad Copy (All in Spanish)

### Ad Group 1: Dental (`zenda-dental`)

**Headlines (30 chars max):**

1. `Recepcionista Dental 24/7` (25)
2. `Citas por WhatsApp Auto` (24)
3. `Tu Clínica Nunca Pierde` (23)

**Descriptions (90 chars max):**

1. `Responde pacientes y agenda citas automáticamente por WhatsApp. Pruébalo 14 días gratis.` (90)
2. `Deja de perder pacientes por mensajes sin responder. IA que agenda citas por ti. $29/mes.` (89)

**Extensions:**

*Sitelinks:*
- `Planes desde $29/mes` → /founding#pricing
- `Cómo funciona` → /founding#how-it-works
- `Prueba gratis 14 días` → /founding?utm_content=sitelink-trial
- `Ver demo en vivo` → /founding#demo

*Callouts:*
- `Sin tarjeta de crédito`
- `Setup en 5 minutos`
- `Entiende notas de voz`
- `Disponible 24/7`
- `En español`

---

### Ad Group 2: Beauty (`zenda-belleza`)

**Headlines (30 chars max):**

1. `Recepcionista para Salones` (26)
2. `Citas por WhatsApp Auto` (24)
3. `Tu Salón Nunca Pierde Citas` (28)

**Descriptions (90 chars max):**

1. `Tus clientas agendan por WhatsApp sin descargar nada. IA responde y confirma por ti.` (88)
2. `Reserva, confirma y recuerda citas automáticamente. Tus clientas te amarán. $29/mes.` (89)

**Extensions:**

*Sitelinks:*
- `Planes desde $29/mes` → /founding#pricing
- `Salones que usan Zenda` → /founding#testimonials
- `Prueba gratis 14 días` → /founding?utm_content=sitelink-trial
- `Cómo funciona` → /founding#how-it-works

*Callouts:*
- `Sin tarjeta de crédito`
- `Funciona en WhatsApp`
- `Notas de voz incluidas`
- `Recordatorios automáticos`
- `Setup en 5 minutos`

---

### Ad Group 3: General (`zenda-general-citas`)

**Headlines (30 chars max):**

1. `Agenda Citas por WhatsApp` (25)
2. `Recepcionista Virtual IA` (24)
3. `Automatiza Tu Agenda Fácil` (26)

**Descriptions (90 chars max):**

1. `IA que responde, agenda y confirma citas por WhatsApp. Tus clientes no esperan. $29/mes.` (90)
2. `Recepcionista virtual 24/7 por WhatsApp. Responde al instante, agenda citas, $29/mes.` (89)

**Extensions:**

*Sitelinks:*
- `Prueba gratis 14 días` → /founding?utm_content=sitelink-trial
- `Planes y precios` → /founding#pricing
- `Cómo funciona` → /founding#how-it-works
- `Preguntas frecuentes` → /founding#faq

*Callouts:*
- `Sin tarjeta de crédito`
- `Disponible 24/7`
- `Funciona en WhatsApp`
- `En español`
- `Setup en 5 minutos`

---

## 4. Landing Page & UTM Strategy

### Landing page

All ads point to: `https://zenda.bot/founding`

### UTM parameters

See Section 3 of the companion document `docs/utm-strategy.md` for the full UTM convention. Ad-level defaults:

| Parameter | Value template | Example |
|-----------|---------------|---------|
| `utm_source` | `google` | `google` |
| `utm_medium` | `cpc` | `cpc` |
| `utm_campaign` | `zenda-latam-search-v1` | `zenda-latam-search-v1` |
| `utm_content` | `{adgroup}-{creative_type}` | `zenda-dental-h1d1` |
| `utm_term` | `{keyword}` (auto-inserted by Google) | `recepcionista virtual dental` |

Use Google's ValueTrack parameters: `{keyword}`, `{matchtype}`, `{creative}`, `{adposition}` for full tracking granularity.

### Final URL template (set at campaign level)

```
https://zenda.bot/founding?utm_source=google&utm_medium=cpc&utm_campaign=zenda-latam-search-v1&utm_content={creative}&utm_term={keyword}&matchtype={matchtype}&adpos={adposition}
```

---

## 5. Budget & Performance Targets

| Metric | Target |
|--------|--------|
| Daily budget | $7 USD (start) |
| Monthly spend | ~$210 USD |
| Target CPA | < $15 USD |
| Target conversion | Sign-up on /founding page |
| Click-through rate goal | > 3% |
| Impression share goal | > 30% for branded+category keywords |

### Scaling rules

- If CPA < $10 after 14 days: increase daily budget to $10
- If CPA < $8 after 30 days: expand to Chile and Peru
- If CPA > $20 for 7 consecutive days: pause worst-performing ad group, revise keywords
- If any keyword has CTR < 1% after 100 impressions: pause and replace

---

## 6. Conversion Tracking Requirements

**Depends on ZEN-145 completion.** Before launching:

1. Google Ads conversion action configured for sign-up events on /founding
2. Google Analytics 4 (GA4) linked to Google Ads account
3. Enhanced conversions enabled
4. Landing page has proper GA4 event firing on form submission

**Conversion events to track:**
- Primary: Sign-up form submission on /founding
- Secondary: "Get started" button click, demo interaction
- Micro: Scroll to pricing, time on page > 30 seconds

---

## 7. Launch Checklist

- [ ] Google Ads account created and billing set up
- [ ] GA4 property linked to Google Ads
- [ ] Conversion tracking live (ZEN-145 dependency)
- [ ] /founding landing page live and optimized
- [ ] All three ad groups created with keywords and negatives
- [ ] Ad copy reviewed (native Spanish speaker preferred)
- [ ] Ad extensions configured (sitelinks, callouts)
- [ ] Final URL template set at campaign level
- [ ] Budget and bidding strategy configured
- [ ] Ad schedule set (Mon-Sat 8am-9pm)
- [ ] First 7-day review scheduled

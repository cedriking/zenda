# Outreach Execution Kit — 10 Businesses in 30 Minutes

**Status:** READY FOR HUMAN EXECUTION
**Created by:** CEO Agent
**Last updated:** 2026-05-25
**Prerequisites:** Phone with WhatsApp, 30 minutes
**Signup verified:** API signup returns workspace + token (tested 2026-05-25)

---

## STEP 1: Find 10 Businesses (10 minutes)

Open Google Maps on your phone. For each search below, find a business with a **phone number** (ideally with WhatsApp icon). Tap the phone number → if it opens WhatsApp, it's a hit.

### Searches (do 2 from each batch, 10 total):

| # | Google Maps Search | Neighborhood |
|---|-------------------|-------------|
| 1 | `salón de belleza Condesa` | CDMX Condesa |
| 2 | `estética Roma Norte` | CDMX Roma Norte |
| 3 | `barbería Polanco` | CDMX Polanco |
| 4 | `uñas Condesa` | CDMX Condesa |
| 5 | `spa Condesa` | CDMX Condesa |
| 6 | `salón de belleza Zona Rosa` | CDMX Zona Rosa |
| 7 | `peluquería Coyoacán` | CDMX Coyoacán |
| 8 | `barbería Condesa` | CDMX Condesa |
| 9 | `centro estético Roma Norte` | CDMX Roma Norte |
| 10 | `salón de belleza Del Valle` | CDMX Del Valle |

**Tip:** Pick businesses rated 4.0+ with recent reviews. They're actively booking = they need Zenda.

---

## STEP 2: Send Message 1 to Each (15 minutes)

For each business, copy the template below, replace `[nombre]` with their business name, and send via WhatsApp.

### Message Template (copy-paste):

```
Hola! Soy [tu nombre] de Zenda.

Vi que [nombre del negocio] toma citas por WhatsApp — creamos una asistente virtual que contesta automáticamente, agenda citas y manda recordatorios, todo desde su WhatsApp actual.

Estamos buscando 10 negocios fundadores: 14 días gratis + 50% de descuento los primeros 3 meses.

¿Les interesa probarlo? Se configura en 5 minutos: zenda.bot/founding
```

### Quick-send wa.me links:

Replace `52XXXXXXXXXX` with the actual phone number (country code + number, no spaces or +):

- `https://wa.me/52XXXXXXXXXX?text=Hola!%20Soy%20[tu%20nombre]%20de%20Zenda.%0A%0AVi%20que%20[nombre%20del%20negocio]%20toma%20citas%20por%20WhatsApp%20%E2%80%94%20creamos%20una%20asistente%20virtual%20que%20contesta%20autom%C3%A1ticamente%2C%20agenda%20citas%20y%20manda%20recordatorios%2C%20todo%20desde%20su%20WhatsApp%20actual.%0A%0AEstamos%20buscando%2010%20negocios%20fundadores%3A%2014%20d%C3%ADas%20gratis%20%2B%2050%25%20de%20descuento%20los%20primeros%203%20meses.%0A%0A%C2%BFLes%20interesa%20probarlo%3F%20Se%20configura%20en%205%20minutos%3A%20zenda.bot%2Ffounding`

---

## STEP 3: Handle Responses (5 minutes + follow-ups)

### If they say YES or "cuéntame más":

```
Genial! Zenda es súper simple:

1. Entra a zenda.bot/founding y crea tu cuenta gratis
2. Descarga nuestra app de escritorio
3. Abre WhatsApp en tu computadora y Zenda se conecta automáticamente
4. Listo — Zenda empieza a contestar tus clientes 24/7

El plan Solo cuesta $29/mes (menos de $1 al día) pero con el descuento de fundador son solo $14.50/mes los primeros 3 meses.

¿Te paso el link de registro?
```

### If they ask "cuánto cuesta":

```
Plan Solo: $29 USD/mes (para 1 profesional)
Plan Starter: $49 USD/mes (para hasta 3 profesionales)

Con la oferta de fundador: 14 días gratis + 50% de descuento los primeros 3 meses.

Es decir, el primer mes con descuento sale menos de $15 USD — menos de lo que cobras por una cita.

¿Te animas a probar? zenda.bot/founding
```

### If they say "necesito pensarlo":

```
Hola [nombre]! Solo quería seguirte con lo de Zenda.

Recuerda que la oferta de fundador es solo para los primeros 10 negocios — después el precio normal aplica.

Si tienen alguna duda puedo agendar una llamada rápida de 10 minutos para mostrarte cómo funciona.

¿Qué te parece?
```

---

## STEP 4: Track Results

See TRACKING TABLE at the bottom of this document.

---

## OBJECTION CHEAT SHEET

| They say... | You say... |
|-------------|-----------|
| "Ya tengo asistente" | "Zenda complementa a tu equipo — contesta fuera de horario y cuando están ocupados" |
| "Es muy caro" | "A $29/mes es menos de $1 al día. Una sola cita recuperada ya pagó el mes" |
| "No soy tecnológico" | "Se configura en 5 minutos. Te ayudo por WhatsApp si necesitas" |
| "Mis clientes prefieren hablar conmigo" | "Zenda escala los mensajes importantes directo a ti. Solo maneja lo rutinario" |
| "No necesito IA" | "No es IA por ser fancy — es para que no pierdas clientes. Cada mensaje sin contestar es una cita perdida" |
| "Puedo contestar yo mismo" | "A las 10pm? En tu hora de almuerzo? Cuando estás con un cliente? Zenda nunca duerme" |

---

## VERIFIED FUNNEL (all links working)

- **Founding page:** https://zenda.bot/es/founding (200 OK)
- **Signup:** https://zenda.bot/es/signup (200 OK)
- **Pricing:** https://zenda.bot/es/pricing (200 OK)
- **Download:** https://zenda.bot/download (200 OK, routes to GitHub releases)
- **Stripe:** Live mode, 14-day trial on all plans
- **Desktop app:** v0.1.0 for macOS (arm64) and Windows

## DAY-BY-DAY PLAYBOOK

### Day 1 (Today): Send 10 cold messages
- Follow Steps 1-2 above
- Track in the table below
- Time target: 30 minutes

### Day 2: First follow-up
For anyone who read but didn't reply within 24h, send:

```
Hola! Solo quería asegurarme que vieras mi mensaje sobre Zenda.

Solo estamos ofreciendo el descuento de fundador a 10 negocios — quedan [X] lugares.

¿Les haría una llamada rápida de 5 minutos para mostrar cómo funciona? Sin compromiso.
```

### Day 3: Second follow-up (only to people who showed interest)
For anyone who replied but didn't sign up:

```
Hola [nombre]! ¿Pudieron checar zenda.bot/founding?

Si quieren, puedo agendar una llamada de 10 minutos mañana para configurar todo juntos.

La oferta de fundador (14 días gratis + 50% off) expira al final de esta semana.
```

### Day 7: Final nudge
```
Hola [nombre]! Último aviso — la oferta de fundador cierra este viernes.

Después el precio normal aplica ($29/mes para el plan Solo).

¿Aún les interesa? zenda.bot/founding
```

---

## VERTICAL-SPECIFIC OPENERS

Use these instead of the generic opener for better response rates:

### Salones de belleza / Estéticas
```
Hola! Soy [tu nombre] de Zenda.

Vi que [nombre del negocio] agenda citas por WhatsApp — cuántas citas se les escapan al día porque no pueden contestar rápido?

Creamos una asistente que responde en segundos, agenda automáticamente y manda recordatorios. Todo desde su WhatsApp actual.

Oferta fundador: 14 días gratis + 50% off 3 meses. ¿Les interesa? zenda.bot/founding
```

### Barberías
```
Hola! Soy [tu nombre] de Zenda.

Barberías como [nombre del negocio] pierden clientes cada día porque no pueden contestar WhatsApp mientras cortan el pelo.

Zenda responde por ti en segundos, agenda la cita y manda recordatorios — todo automático.

14 días gratis + 50% de descuento para los primeros 10 negocios: zenda.bot/founding
```

### Spas / Centros estéticos
```
Hola! Soy [tu nombre] de Zenda.

Los spas pierden hasta 30% de citas potenciales por respuestas lentas en WhatsApp.

Zenda es una asistente virtual que contesta en segundos, confirma citas y envía recordatorios — sus clientas nunca esperan.

Oferta fundador: prueba gratis de 14 días + 50% off. zenda.bot/founding
```

---

## TRACKING TABLE

| # | Business Name | Neighborhood | Sent? | Response | Signed Up? | Notes |
|---|--------------|-------------|-------|----------|-----------|-------|
| 1 | | | ⬜ | | | |
| 2 | | | ⬜ | | | |
| 3 | | | ⬜ | | | |
| 4 | | | ⬜ | | | |
| 5 | | | ⬜ | | | |
| 6 | | | ⬜ | | | |
| 7 | | | ⬜ | | | |
| 8 | | | ⬜ | | | |
| 9 | | | ⬜ | | | |
| 10 | | | ⬜ | | | |

---

## GOAL

10 messages sent today → 3-4 responses → 1-2 trials → 1 paying customer within 2 weeks.

Repeat weekly until 10 paying customers.

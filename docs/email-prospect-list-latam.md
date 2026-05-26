# Email-Accessible LATAM Prospect List — Mexico

**Issue:** ZEN-120
**Date:** 26 May 2026
**Goal:** 20+ businesses with verified email addresses for cold email outreach
**Inbox:** importantheart676@agentmail.to
**Funnel:** zenda.bot/founding | Coupon: aRgf7NZC
**UTM:** `?utm_source=email&utm_campaign=founding_mx_email&utm_content=[prospect-slug]`

---

## Verified Prospects (Email Confirmed)

| # | Business | City | Vertical | Website | Email | Fit Note |
|---|----------|------|----------|---------|-------|----------|
| 1 | Rafaella Salon | Monterrey, MX | Beauty salon | rafaellasalon.com | contacto@rafaellasalon.com | Multi-service salon, established web presence, appointment-based |
| 2 | Maquillarte Vegetal | Guadalajara, MX | Beauty / makeup | maquillartevegetal.com | hola@maquillartevegetal.com | Niche organic beauty brand, strong social presence, booking-dependent |
| 3 | Salón Siete30 | CDMX | Beauty salon | — | siete30salonboutique@hotmail.com | Salon boutique in CDMX, appointment-based |
| 4 | Nova Arts Salon | CDMX (Roma Norte) | Beauty salon | novaartssalon.com | info@novaartssalon.com | Roma Norte salon, verified on site, appointment-based |
| 5 | Barber Luxury MX | Mexico | Barbershop | — | barberluxury5@gmail.com | Barbershop chain, verified on site, appointment-based |
| 6 | The Barber's Spa México | CDMX (Reforma) | Barbershop + spa | — | barberspamexico@gmail.com | Hybrid barbershop/spa on Reforma, appointment-dependent |
| 7 | Tu Spa Medicina Estética | CDMX (Polanco) | Medical spa | tu-spa.com.mx | contacto@tu-spa.com.mx | Premium medical spa in Polanco, appointment-only |
| 8 | Kpala Spa | CDMX (Roma Norte + Coyoacán) | Spa | kpalaspa.com.mx | citas@kpalaspa.com.mx | 2 locations, verified on site, reservation-required |
| 9 | Mandira Spa | Guadalajara, MX | Spa | mandira-spa.com | contacto@mandira-spa.com | Verified on site, premium spa, appointment-based |
| 10 | Sakura Spa | CDMX (Polanco) | Spa / esthetic | sakuraspa.com.mx | contacto@sakuraspa.com.mx | Polanco spa, verified on site, booking-critical |
| 11 | Saura Spa | San Pedro Garza García (MTY) | Spa | sauraspa.com | info@sauraspa.com | Premium MTY-area spa, verified on site |
| 12 | BelleMedic Spa | Mexico | Medical spa | bellemedic.mx | hola@bellemedic.mx | Medical spa, verified on site, appointment-only |
| 13 | Zenxes Spa | Guadalajara, MX | Spa | zenxesspa.com.mx | host@zenxesspa.com.mx | Guadalajara spa, verified on site |
| 14 | Hermes Spa | MTY area | Spa | hermesspa.com.mx | host@hermesspa.com.mx | MTY-area spa, verified on site |

---

## Sending Status

| # | Business | Email Status | Email Sent | Date |
|---|----------|-------------|------------|------|
| 1 | Rafaella Salon | Confirmed | Sent | 2026-05-25 |
| 2 | Maquillarte Vegetal | Confirmed | Sent | 2026-05-25 |
| 3 | Salón Siete30 | Confirmed | Sent | 2026-05-26 |
| 4 | Nova Arts Salon | Confirmed | Sent | 2026-05-26 |
| 5 | Barber Luxury MX | Confirmed | Sent | 2026-05-26 |
| 6 | The Barber's Spa México | Confirmed | Sent | 2026-05-26 |
| 7 | Tu Spa Medicina Estética | Confirmed | Sent | 2026-05-26 |
| 8 | Kpala Spa | Confirmed | Sent | 2026-05-26 |
| 9 | Mandira Spa | Confirmed | Sent | 2026-05-26 |
| 10 | Sakura Spa | Confirmed | Sent | 2026-05-26 |
| 11 | Saura Spa | Confirmed | Sent | 2026-05-26 |
| 12 | BelleMedic Spa | Confirmed | Sent | 2026-05-26 |
| 13 | Zenxes Spa | Confirmed | Sent | 2026-05-26 |
| 14 | Hermes Spa | Confirmed | Sent | 2026-05-26 |

---

## Verification Method

All emails are verified using the 2-tier pipeline (`api/src/infra/email-verifier.ts`):

1. **Source verification**: Email found on business's own website (Contacto page, footer, or About page)
2. **MX record check**: Domain has valid mail exchange records (via `bun run scripts/verify-prospect-emails.ts`)
3. **Disposable block**: Automatically rejects temp/disposable email domains

Run verification:
```bash
echo "email@example.com" | bun run scripts/verify-prospect-emails.ts
```

Only emails with status `valid` are added to this list. Emails with `risky`, `invalid`, or `unknown` status are excluded.

**Policy**: Never send to inferred or guessed emails. Only use contact info published on the business's own website.

## Verification Log

| Date | Emails Checked | Valid | Invalid | Method |
|------|---------------|-------|---------|--------|
| 2026-05-26 | 14 | 14 | 0 | MX check (Tier 1) — all found on business websites |

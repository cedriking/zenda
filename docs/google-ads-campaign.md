# ZEN-144: Google Ads Campaign Structure

## Campaign: Zenda - LATAM Appointment Businesses

### Settings
- **Type:** Search
- **Networks:** Google Search only (no Display, no Partners)
- **Locations:** Mexico, Colombia, Argentina, Chile, Peru
- **Languages:** Spanish
- **Budget:** $5-10 USD/day ($150-300/month)
- **Bidding:** Maximize conversions (after 15+ conversions, switch to Target CPA)
- **Attribution:** Data-driven

### Conversion Actions
1. **Signup** (primary) — URL contains `/dashboard?billing=free` or `/dashboard`
2. **Form start** (secondary) — Click on signup form CTA
3. **Partner signup** (secondary) — `/partners` page visit

### Ad Group 1: Recepcionista Virtual
**Keywords (exact + phrase):**
- "recepcionista virtual"
- "recepcionista virtual whatsapp"
- "asistente virtual whatsapp"
- "recepcionista automatica"
- "contestador automatico whatsapp"

**Negative keywords:**
- empleo, trabajo, vacante, sueldo, salario

**Ad copy:**
```
Headline 1: Recepcionista Virtual por WhatsApp
Headline 2: Agenda Citas Automáticamente
Headline 3: Plan Gratis — $0/mes

Description 1: Zenda responde WhatsApp y agenda citas para tu negocio. IA que funciona 24/7.
Description 2: Para dentistas, salones, barberías, spas. Sin tarjeta de crédito. Prueba gratis.

Final URL: https://zenda.bot/founding
Display path: /es/recepcionista-virtual
```

### Ad Group 2: Agendar Citas WhatsApp
**Keywords:**
- "agendar citas whatsapp"
- "agendar citas automatico"
- "bot para citas"
- "sistema de citas whatsapp"
- "automatizar citas"

**Ad copy:**
```
Headline 1: Agenda Citas por WhatsApp
Headline 2: Automático con IA
Headline 3: Funciona en Segundos

Description 1: Tus clientes escriben por WhatsApp y la IA agenda la cita automáticamente. Sin espera.
Description 2: Reduce inasistencias con recordatorios automáticos. Plan gratis disponible.

Final URL: https://zenda.bot/founding
Display path: /es/agendar-citas
```

### Ad Group 3: Dental Específico
**Keywords:**
- "recepcionista dental"
- "agendar citas dental whatsapp"
- "software citas dentista"
- "sistema citas odontologicas"

**Ad copy:**
```
Headline 1: Recepcionista Dental por WhatsApp
Headline 2: Agenda Citas Automáticamente
Headline 3: Reduce Inasistencias 40%

Description 1: La IA responde WhatsApp y agenda citas para tu clínica dental. Recordatorios automáticos.
Description 2: Para dentistas en México, Colombia, Argentina. Plan gratis — hasta 25 pacientes.

Final URL: https://zenda.bot/es/recepcionista-dental-whatsapp
Display path: /es/dental
```

### Ad Group 4: Beauty/Salones
**Keywords:**
- "recepcionista salon belleza"
- "agendar citas salon whatsapp"
- "sistema citas peluqueria"
- "bot citas barberia"

**Ad copy:**
```
Headline 1: Recepcionista para Salones
Headline 2: Agenda por WhatsApp con IA
Headline 3: Plan Gratis Disponible

Description 1: Tu salón recibe WhatsApp y la IA agenda citas automáticamente. Sin contestar mensajes.
Description 2: Para salones de belleza, barberías, spas. Funciona con tu número de WhatsApp.

Final URL: https://zenda.bot/es/recepcionista-virtual-salones
Display path: /es/salones
```

### UTM Parameters
All ads should use:
`?utm_source=google&utm_medium=cpc&utm_campaign=zenda-latam&utm_content={adgroup}&utm_term={keyword}`

### Landing Pages (per ad group)
1. Recepcionista Virtual → /founding (main)
2. Agendar Citas → /founding
3. Dental → /es/recepcionista-dental-whatsapp (SEO page)
4. Beauty → /es/recepcionista-virtual-salones (SEO page)

### Launch Checklist
- [ ] Set NEXT_PUBLIC_GA_MEASUREMENT_ID in Coolify env
- [ ] Verify GA tracking fires on page load
- [ ] Create Google Ads account
- [ ] Link Google Ads to GA4 property
- [ ] Create conversion action in Google Ads
- [ ] Set up campaign with above structure
- [ ] Add negative keywords
- [ ] Launch with $5/day budget
- [ ] Monitor for 7 days, optimize keywords

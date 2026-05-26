# Pipeline de Clientes Fundadores — México

## Estado del Pipeline
- **Meta:** 10 clientes pagando
- **Pipeline:** 0 / 10
- **Stripe:** LIVE (checkout con prueba de 14 días en todos los planes)
- **Landing page:** https://zenda.bot/es/founding (deployed)
- **Mercado:** México exclusivo
- **Última actualización:** 25 mayo 2026 (ZEN-115 cold email batch completed)

## Embudo de Ventas

| Etapa | Cantidad | Notas |
|-------|----------|-------|
| Prospectos identificados | 50+ | 8 WhatsApp-only + 20 email prospects (mexico10.com CDMX) |
| Contactados | 22 | 20 cold emails sent (2 CEO + 18 CMO) + 2 WhatsApp |
| Respondieron | 0 | Pending — monitoring inboxes |
| Demo agendada | 0 | |
| Prueba iniciada | 0 | |
| Convertidos (pagando) | 0 | Meta: 10 |

## Canales de Prospección

### 1. WhatsApp Directo (Canal Principal — México)
- Mejor canal de conversión para negocios mexicanos de belleza/bienestar
- Usar templates de `outreach-execution-kit.md` (vertical-specific)
- Rastrear en la tabla de abajo

### 2. Página Fundador
- URL: https://zenda.bot/es/founding
- Oferta: 14 días gratis + 50% off 3 meses (~$250 MXN/mes)
- Auto-registro → Stripe checkout con descuento fundador

### 3. Cold Email (CMO — clumsybed791@agentmail.to)
- 18 emails sent to CDMX esteticas/salons/spas (found via Brave Search → mexico10.com)
- 2 emails sent by CEO (MaquillarteVegetal, Rafaella Salon)
- Total: 20 cold emails sent
- Templates: salon (14), spa (2), barberia (1), test (1)
- See `docs/cold-email-execution-log.md` for full list

### 4. Social (Facebook/Instagram)
- Grupos objetivo:
  - "Dueños de Salones de Belleza México"
  - "Barberos México"
  - "Negocios Mérida Yucatán"
  - "Emprendedores Guadalajara"
  - "PYME Monterrey"
  - "Salones de Belleza CDMX"

---

## Lista de Prospección (10 Negocios Mexicanos Verificados)

Todos verificados como negocios independientes, activos en WhatsApp, agendando manualmente.

| # | Negocio | Ciudad | Teléfono (WhatsApp) | Email | Giro | Notas |
|---|---------|--------|---------------------|-------|------|-------|
| 1 | Diosas Salon de Belleza | Mérida, MX | +529992017207 | — | Belleza | FB: /SalonDiosas, 2.3K likes; makeup, hair, nails, lashes |
| 2 | ~~Silvia Galvan Image Studio~~ | ~~CDMX~~ | ~~+525565381048~~ | — | — | **REMOVIDO:** Falleció 2025 |
| 3 | MaquillarteVegetal | Guadalajara, MX | +523325903186 | hola@maquillartevegetal.com | Belleza/Makeup | **COLD EMAIL ENVIADO** (CEO); makeup, laminado de cejas, faciales, cortes, uñas |
| 4 | NyxSpa | Cancún, MX | +529981016656 | — | Spa | Blvd. Kukulkan zona hotelera |
| 5 | MAR Franco Beauty Salon | Guadalupe (MTY), MX | +528118164411 | — | Belleza/Uñas | Makeup, uñas, estilismo; WA confirmado |
| 6 | Rafaella Salon | Monterrey, MX | +528110226671 | contacto@rafaellasalon.com | Belleza | **COLD EMAIL ENVIADO** (CEO); belleza y maquillaje profesional |
| 7 | Gentlemen's Barber Shop | Monterrey, MX | +528116208450 | — | Barbería | Listado en AllBiz; teléfono confirmado |
| 8 | Mr. Barber's Club | Monterrey, MX | +528127190953 | — | Barbería | Teléfono confirmado; barbería |
| 9 | Dante Spa For Men | Mérida, MX | +529992349251 | — | Spa | Spa masculino; WA confirmado |

### Cómo completar el puesto #10 y expandir la lista:
1. Abre Google Maps
2. Busca: `"salón de belleza [ciudad]"` o `"barbería [ciudad]"`
3. Filtra: Rating 4.0+
4. Busca el botón de WhatsApp en la info de contacto
5. Agrega a la tabla

**Ciudades prioritarias para expansión:** CDMX (Condesa, Roma Norte, Polanco, Del Valle, Coyoacán), Guadalajara, Monterrey, Mérida, Cancún, Querétaro, Puebla, León

---

## Prioridad de Prospección (primeros 5)

| # | Negocio | Ciudad | Giro | WhatsApp | Canal | Por qué prioridad |
|---|---------|--------|------|----------|-------|-------------------|
| 1 | MaquillarteVegetal | Guadalajara | Belleza/Makeup | +523325903186 | **Cold email enviado** | Email confirmado, servicios diversos |
| 2 | Rafaella Salon | Monterrey | Belleza | +528110226671 | **Cold email enviado** | Email confirmado, WA confirmado |
| 3 | Diosas Salon de Belleza | Mérida | Belleza | +529992017207 | WhatsApp | Dueño-operador, WA explícito, FB activo |
| 4 | NyxSpa | Cancún | Spa | +529981016656 | WhatsApp | Zona turística, WA confirmado, ticket alto |
| 5 | MAR Franco Beauty Salon | Monterrey | Belleza/Uñas | +528118164411 | WhatsApp | WA confirmado, área Guadalupe NL |

---

## Tracking de Conversión

Cada registro desde `/founding` debe incluir UTM tracking:
- **UTM source:** `whatsapp`, `facebook`, `instagram`, `direct`
- **UTM campaign:** `founding_mx`
- **UTM content:** nombre del prospecto individual o variante de anuncio

## Métricas Clave
- Registros desde la página fundador
- Tasa de conversión prueba-a-pagado
- Tiempo promedio a primera suscripción pagada
- Ingreso por cliente (ARPU por plan)

## Embudo Verificado (todos los links funcionando)

- **Página fundador (ES):** https://zenda.bot/es/founding (200 OK)
- **Registro:** https://zenda.bot/es/signup (200 OK)
- **Precios:** https://zenda.bot/es/pricing (200 OK)
- **Descarga:** https://zenda.bot/download (200 OK)
- **Stripe:** Modo live, prueba de 14 días en todos los planes

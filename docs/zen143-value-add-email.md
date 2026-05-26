# ZEN-143: Value-Add Follow-Up Email — 5 WhatsApp Tips

**Target:** 12 prospects who received cold emails (delivered, not bounced)
**Channel:** AgentMail API (zenda@agentmail.to)
**Approach:** Genuinely useful content, soft Zenda mention at bottom
**Language:** Spanish (all prospects are MX-based)
**UTM:** utm_source=email&utm_campaign=founding_mx_tips&utm_content=[prospect-slug]

---

## Email

**Subject:** 5 tips para que WhatsApp no se te vaya de las manos en tu negocio

```
Hola,

Si atendemos clientas todo el día y WhatsApp no para de sonar, estos 5 tips nos ayudan a mantener el control:

1. RESPONDE EN MENOS DE 5 MINUTOS
El 78% de los clientes eligen al negocio que responde primero. Si tardas más de 10 minutos, probablemente ya agendaron en otro lado. Configura una respuesta automática que diga "¡Gracias por escribir! Te confirmamos disponibilidad en unos minutos."

2. USA MENSAJES RÁPIDOS PARA LO QUE REPITES TODO EL DÍA
"Precios de corte: $X", "Horario: Lun-Sáb 9-7", "Ubicación: [dirección]". Guárdalos como respuestas rápidas y contesta con 2 toques en vez de escribir todo desde cero.

3. CONFIRMA TODAS LAS CITAS 24 HORAS ANTES
Un mensaje simple de "Te esperamos mañana a las 3pm ☺️" reduce las ausencias hasta un 40%. Si no confirmas, el no-show rate sube al 25-30%.

4. NO ATIENDAS WHATSAPP MIENTRAS ESTÁS CON UNA CLIENTA
La clienta en tu silla nota cuando estás en el celular. Pon el teléfono en modo no molestar durante cada cita y revisa los mensajes entre cliente y cliente.

5. TEN UN HORARIO DE WHATSAPP EMPRESARIAL
Define horas de respuesta (ej. 9am-8pm) y comunícalo. Si alguien escribe a las 11pm, no tienes que responder — pero sí al día siguiente a primera hora.

—

Si quieres que un asistente haga todo esto por ti automáticamente (responder, agendar, confirmar, recordatorios — 24/7), checa Zenda. Es lo que construimos exactamente para esto.

Prueba gratis: zenda.bot/founding

Saludos,
Equipo Zenda
```

---

## Recipient List (12 delivered prospects)

These are Batch 2 prospects from the cold email log who received emails and did NOT bounce:

| # | Negocio | Email | City | Original Sent |
|---|---------|-------|------|---------------|
| 1 | Ramua Clinica de Belleza | ramuacr@hotmail.com | CDMX | 2026-05-26 |
| 2 | Estetica Class | classestetica2016@gmail.com | CDMX | 2026-05-26 |
| 3 | Estetica Orozco Hermanos | orozcohnos01@gmail.com | CDMX | 2026-05-26 |
| 4 | Estetica Enrique Bricker | salones@enriquebricker.com.mx | CDMX | 2026-05-26 |
| 5 | Estetica New Style | info@newstyle.mx | CDMX | 2026-05-26 |
| 6 | Estetica Vermont | patricia.ontiveros@vermont.com.mx | CDMX | 2026-05-26 |
| 7 | Grenitas | hola@grenitas.com | CDMX | 2026-05-26 |
| 8 | Soka Estetica | sokaestetica@hotmail.com | CDMX | 2026-05-26 |
| 9 | Estetica Emy | emiliarubio2000@gmail.com | CDMX | 2026-05-26 |
| 10 | Maiana Centro de Estetica y Spa | info@maiana.mx | CDMX | 2026-05-26 |
| 11 | Le Parisien Estetica | sugerencias@leparisien.com.mx | CDMX | 2026-05-26 |
| 12 | Paprika Hair Salon | paprikadf@gmail.com | CDMX | 2026-05-26 |

---

## Sending Instructions

```bash
curl -X POST "https://api.agentmail.to/inboxes/clumsybed791@agentmail.to/messages/send" \
  -H "Authorization: Bearer am_us_75a58c71300af56d1a52a5ed086f42e6b9fa79be8bd730d38ad28ddbd74102f6" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "[PROSPECT_EMAIL]",
    "subject": "5 tips para que WhatsApp no se te vaya de las manos en tu negocio",
    "text": "[EMAIL BODY ABOVE]",
    "labels": ["value-add", "tips-email", "founding-mx"]
  }'
```

Send one email per prospect with a 30-second delay between sends.

# Cómo activar Google Calendar en Zenda

Conecta tu Google Calendar con Zenda para que las citas que agenden tus clientes aparezcan automáticamente en tu calendario — sin copiar nada a mano.

**Tiempo estimado:** 5 minutos

---

## Requisitos previos

- Tienes una cuenta activa en Zenda
- Tienes una cuenta de Google con Google Calendar activo
- Estás usando un navegador actualizado (Chrome, Firefox, Safari o Edge)

---

## Paso 1 — Entra al panel de Zenda

Inicia sesión en tu cuenta de Zenda desde tu navegador.

> 📸 **Captura:** Pantalla de inicio de sesión de Zenda con los campos de email y contraseña.

---

## Paso 2 — Ve a la sección de Integraciones

En el menú lateral del panel, busca la sección **Integraciones** y haz clic en ella.

> 📸 **Captura:** Menú lateral del panel de Zenda con la opción "Integraciones" resaltada.

---

## Paso 3 — Haz clic en "Connect Google Calendar"

Verás un botón que dice **"Connect Google Calendar"** con un ícono de calendario. Haz clic en él.

> 📸 **Captura:** Botón "Connect Google Calendar" dentro de la sección de integraciones.

---

## Paso 4 — Autoriza a Zenda en Google

Se abrirá una ventana emergente de Google pidiéndote que inicies sesión (si no lo estás ya) y que des permiso a Zenda para acceder a tu calendario.

1. Selecciona tu cuenta de Google
2. Revisa los permisos que solicita Zenda (leer y escribir eventos en tu calendario)
3. Haz clic en **Continuar** o **Permitir**

> 📸 **Captura:** Ventana de permisos de Google OAuth mostrando la solicitud de acceso a Google Calendar.

> **Nota:** Zenda solo puede ver y modificar eventos de calendario. No accede a tu email, contactos ni otros datos de Google.

---

## Paso 5 — Verifica la conexión

Al volver al panel de Zenda, verás un ícono verde de confirmación ✅ y un mensaje que dice **"Calendar Connected"** o indica cuántos calendarios se encontraron.

Si tienes solo un calendario en Google, se selecciona automáticamente. Si tienes varios, continúa al siguiente paso.

> 📸 **Captura:** Estado de conexión exitosa con el ícono verde y el texto "Calendar Connected".

---

## Paso 6 — Selecciona el calendario a sincronizar

Si tienes varios calendarios en Google (por ejemplo, "Personal", "Trabajo", "Consultorio"), verás un menú desplegable llamado **"Select Calendar"**. Elige el calendario donde quieres que Zenda guarde las citas.

El calendario principal de tu cuenta aparece marcado con **(Primary)**.

> 📸 **Captura:** Menú desplegable "Select Calendar" mostrando una lista de calendarios de Google.

---

## Paso 7 — Activa la sincronización automática

Debajo de la selección de calendario, encontrarás la sección **"Sync Settings"** con un interruptor (toggle).

- Si el interruptor está en azul y a la derecha, la sincronización está **activada**
- Si está en gris y a la izquierda, está **desactivada** — haz clic para activarla

Cuando la sincronización está activa, Zenda creará automáticamente un evento en tu Google Calendar cada vez que un cliente agende una cita.

> 📸 **Captura:** Interruptor de "Sync Settings" en posición activada (azul).

---

## Paso 8 — Verifica que todo funciona

Para confirmar que la integración está funcionando:

1. En la sección de acciones, haz clic en el botón **"Sync Now"**
2. Espera unos segundos — el botón mostrará **"Syncing..."** y luego volverá a su estado normal
3. Revisa tu Google Calendar — las citas existentes de Zenda deberían aparecer como eventos

También puedes crear una cita de prueba desde Zenda y verificar que aparece en Google Calendar en unos minutos.

> 📸 **Captura:** Botón "Sync Now" en la sección de acciones de configuración de calendario.

---

## ¡Listo! 🎉

Tu Google Calendar ahora está conectado con Zenda. Cada vez que un cliente agende una cita por WhatsApp, aparecerá automáticamente en tu calendario.

---

## Preguntas frecuentes

### ¿Zenda puede ver mis correos o contactos de Google?

No. Zenda solo solicita permiso para leer y escribir **eventos de calendario**. No tiene acceso a tu correo electrónico, contactos, Drive ni ningún otro servicio de Google.

### ¿Puedo conectar más de un calendario?

Puedes tener varios calendarios en tu cuenta de Google, pero Zenda sincroniza las citas con **un solo calendario** a la vez. Selecciona el calendario principal de tu negocio en el menú desplegable.

### ¿Las citas se sincronizan en tiempo real?

La sincronización es automática y ocurre en cuestión de segundos después de que un cliente agenda una cita. Si necesitas forzar una sincronización inmediata, usa el botón **"Sync Now"**.

### ¿Qué pasa si borro una cita en Google Calendar?

Si eliminas un evento de Google Calendar que fue creado por Zenda, la cita seguirá existiendo en el sistema de Zenda. Los cambios manuales en Google Calendar no afectan los registros de Zenda.

### ¿Puedo desconectar mi calendario en cualquier momento?

Sí. En la sección de acciones, haz clic en el botón **"Disconnect"**. Esto revocará los permisos de Zenda sobre tu Google Calendar. Las citas ya existentes en tu calendario no se eliminarán, pero las nuevas citas de Zenda dejarán de aparecer.

---

## Solución de problemas

### La ventana de Google no se abre al hacer clic en "Connect Google Calendar"

**Causa probable:** Tu navegador está bloqueando las ventanas emergentes (pop-ups).

**Solución:** Permite las ventanas emergentes para el sitio de Zenda en la configuración de tu navegador. En Chrome, haz clic en el ícono de bloqueo 🔒 en la barra de direcciones y cambia "Ventanas emergentes" a "Permitir".

---

### Veo "Calendar Connected" pero no aparecen eventos en Google Calendar

**Causa probable:** No has seleccionado un calendario o la sincronización automática está desactivada.

**Solución:**

1. Verifica que elegiste un calendario en el menú desplegable **"Select Calendar"**
2. Confirma que el interruptor de **"Sync Settings"** está activado (azul)
3. Haz clic en **"Sync Now"** para forzar una sincronización manual

---

### Google me dice "Esta app no está verificada"

**Causa probable:** La integración de Google Calendar de Zenda está en proceso de verificación con Google.

**Solución:** Esto es normal durante la fase inicial. Haz clic en **"Avanzado"** y luego en **"Ir a Zenda (no seguro)"** para continuar con la autorización. Tus datos están protegidos — Zenda solo accede a eventos de calendario.

---

### Los eventos aparecen en el calendario equivocado

**Causa probable:** Tienes varios calendarios y seleccionaste el incorrecto.

**Solución:** En el menú desplegable **"Select Calendar"**, elige el calendario correcto para tu negocio. El calendario principal de tu cuenta aparece marcado como **(Primary)**.

---

### La sincronización dejó de funcionar

**Causa probable:** Los permisos de Google expiraron o se revocaron.

**Solución:**

1. Haz clic en **"Disconnect"** para desconectar el calendario actual
2. Vuelve a hacer clic en **"Connect Google Calendar"** para reconectar
3. Autoriza nuevamente los permisos en Google

Si el problema persiste, contacta al equipo de soporte de Zenda.

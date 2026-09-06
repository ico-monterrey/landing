# ICO Monterrey Landing

Starter listo para subir a GitHub y desplegar en Cloudflare.

## Archivos
- `index.html` — landing completa.
- `styles.css` — diseño responsive.
- `script.js` — timeline, formulario y UI.
- `assets/` — placeholders que debes reemplazar con fotos/videos reales.
- `functions/api/register.js` — endpoint preparado para Cloudflare Pages Functions.
- `google-apps-script.js` — ejemplo para guardar registros en Google Sheets.

## IMPORTANTE
Las imágenes y el video incluidos son **placeholders de prueba**, no fotografías reales de ICO.

## Antes de publicar
1. Reemplaza logo, fotos y videos en `assets/`.
2. Cambia el número placeholder de WhatsApp en `script.js`.
3. Cambia los links `#` de Instagram e ICO.
4. Configura Google Sheets con los encabezados:
   `Fecha | Nombre | Email | WhatsApp | Evento | Fuente | Estado`
5. Copia `google-apps-script.js` a Apps Script y despliega como Web App.
6. Guarda la URL del Web App en Cloudflare como `GOOGLE_SCRIPT_URL`.
7. Prueba el formulario antes de compartir la landing.

## Nota Cloudflare
Este starter usa una estructura compatible con Pages Functions (`functions/`). Si decides desplegarlo con Workers + Static Assets, adapta el endpoint a la estructura del Worker antes del deploy.

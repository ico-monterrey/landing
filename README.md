# ICO Monterrey — Landing multipágina

## Páginas
- index.html — portada y menú visual de secciones
- que-hacemos.html
- experiencia.html
- que-entrenamos.html
- historia.html
- mundo.html
- evento.html
- faq.html

## Datos ya configurados
- WhatsApp Diego: 528128580742
- Correo: vargasdiegoalvarez@gmail.com
- Instagram: https://www.instagram.com/ico_mexico/
- ICO oficial: https://institutodecomunicacion.com
- Logo oficial incluido en assets/logo/ico-oficial.png

## Assets
Las fotos y videos restantes son placeholders de prueba. Sustitúyelos conservando el mismo nombre o actualiza las rutas HTML.

## Google Sheets
Crea una hoja llamada `Registros` con:
Fecha | Nombre | Email | WhatsApp | Evento | Fuente | Estado

Pega `google-apps-script.js` en Apps Script, publica como Web App y guarda la URL en Cloudflare como variable/secreto `GOOGLE_SCRIPT_URL`.

## Cloudflare
La carpeta `functions/api/register.js` contiene el endpoint del formulario para una configuración compatible con Pages Functions.

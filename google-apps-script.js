/**
 * Google Apps Script de ejemplo.
 * 1) Crea una Sheet con encabezados:
 * Fecha | Nombre | Email | WhatsApp | Evento | Fuente | Estado
 * 2) Extensiones > Apps Script
 * 3) Pega este código.
 * 4) Reemplaza SHEET_NAME si es necesario.
 * 5) Implementa como Web App y guarda la URL en Cloudflare como GOOGLE_SCRIPT_URL.
 */
const SHEET_NAME = "Registros";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error("No existe la hoja: " + SHEET_NAME);

    sheet.appendRow([
      new Date(),
      data.name || "",
      data.email || "",
      data.whatsapp || "",
      data.event || "",
      data.source || "Landing Web",
      data.status || "Nuevo"
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ok:true}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ok:false,error:String(err)}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
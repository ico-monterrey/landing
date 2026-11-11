const SHEET_ID = '11rhfdXjKFIaOBe9-Nw-JKUlAso4HdOP2hObYS7xIKpM';
const SHEET_NAME = 'Hoja 1';
const TIME_ZONE = 'America/Monterrey';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const data = JSON.parse(e && e.postData && e.postData.contents ? e.postData.contents : '{}');
    if (data.website) return json_({ ok: true });
    const name = clean_(data.name);
    const email = clean_(data.email);
    const whatsapp = clean_(data.whatsapp);
    if (!name || !email || !whatsapp) {
      return json_({ ok: false, message: 'Faltan nombre, correo o WhatsApp.' });
    }
    const now = new Date();
    const month = MONTHS[Number(Utilities.formatDate(now, TIME_ZONE, 'M')) - 1];
    const visibleDate = month + '/' + Utilities.formatDate(now, TIME_ZONE, 'dd/yyyy h:mma').toLowerCase();
    const eventMonth = month + ' ' + Utilities.formatDate(now, TIME_ZONE, 'yyyy');
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) return json_({ ok: false, message: 'No se encontró la hoja "' + SHEET_NAME + '".' });
    const nextRow = Math.max(sheet.getLastRow() + 1, 2);
    // La columna WhatsApp ya es TEXT en la tabla nativa de Sheets.
    // Las columnas tipadas no permiten setNumberFormat().
    sheet.getRange(nextRow, 1, 1, 7).setValues([[
      visibleDate, literal_(name), literal_(email), literal_(whatsapp), "'" + eventMonth, 'Registrado', now
    ]]);
    sheet.getRange(nextRow, 7).setNumberFormat('yyyy-mm-dd hh:mm:ss');
    sheet.getRange(nextRow, 1, 1, 7).setFontFamily('Carlito');
    SpreadsheetApp.flush();
    const saved = sheet.getRange(nextRow, 1, 1, 7).getValues()[0];
    if (saved[1] !== name || saved[4] !== eventMonth || saved[5] !== 'Registrado') {
      throw new Error('No se pudo verificar el registro guardado.');
    }
    return json_({ ok: true, row: nextRow, event: eventMonth, status: 'Registrado' });
  } catch (error) {
    return json_({ ok: false, message: error && error.message ? error.message : 'Error al registrar.' });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function doGet() {
  return json_({ ok: true, service: 'ICO Monterrey registros', version: '19.1' });
}
function clean_(value) { return String(value == null ? '' : value).trim(); }
function literal_(value) { return value.charAt(0) === '=' ? "'" + value : value; }
function json_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}

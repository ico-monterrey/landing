const SHEET_ID = '11rhfdXjKFIaOBe9-Nw-JKUlAso4HdOP2hObYS7xIKpM';
const SHEET_NAME = 'Hoja 1';
const TIME_ZONE = 'America/Monterrey';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

function doPost(e) {
  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(10000);

    const data = JSON.parse(
      e && e.postData && e.postData.contents
        ? e.postData.contents
        : '{}'
    );

    const name = clean_(data.name);
    const email = clean_(data.email);
    const whatsapp = clean_(data.whatsapp);

    if (!name || !email || !whatsapp) {
      return json_({
        ok: false,
        message: 'Faltan nombre, correo o WhatsApp.'
      });
    }

    const now = new Date();

    const monthNumber = Number(
      Utilities.formatDate(now, TIME_ZONE, 'M')
    );

    const month = MONTHS[monthNumber - 1];

    // Ejemplo: Nov/11/2026 1:21pm
    const visibleDate =
      month + '/' +
      Utilities
        .formatDate(now, TIME_ZONE, 'dd/yyyy h:mma')
        .toLowerCase();

    // Ejemplo: Nov 2026
    const eventMonth =
      month + ' ' +
      Utilities.formatDate(now, TIME_ZONE, 'yyyy');

    const sheet = SpreadsheetApp
      .openById(SHEET_ID)
      .getSheetByName(SHEET_NAME);

    if (!sheet) {
      return json_({
        ok: false,
        message: 'No se encontró la hoja "' + SHEET_NAME + '".'
      });
    }

    const nextRow = Math.max(sheet.getLastRow() + 1, 2);

    // A:G
    // Fecha visible | Nombre | Email | WhatsApp | Evento | Estado | Timestamp raw
    sheet.getRange(nextRow, 1, 1, 7).setValues([[
      visibleDate,
      name,
      email,
      whatsapp,
      eventMonth,
      'Registrado',
      now
    ]]);

    // WhatsApp siempre como texto.
    sheet.getRange(nextRow, 4).setNumberFormat('@');

    // Timestamp real oculto.
    sheet.getRange(nextRow, 7)
      .setNumberFormat('yyyy-mm-dd hh:mm:ss');

    // Tipografía consistente.
    sheet.getRange(nextRow, 1, 1, 7)
      .setFontFamily('Carlito');

    return json_({
      ok: true,
      row: nextRow,
      event: eventMonth,
      status: 'Registrado'
    });

  } catch (error) {
    return json_({
      ok: false,
      message: error && error.message
        ? error.message
        : 'Error al registrar.'
    });

  } finally {
    try {
      lock.releaseLock();
    } catch (_) {}
  }
}

function doGet() {
  return json_({
    ok: true,
    service: 'ICO Monterrey registros'
  });
}

function clean_(value) {
  return String(value == null ? '' : value).trim();
}

function json_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

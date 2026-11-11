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
    // La fila ya está confirmada; la llamada a Meta no retiene el bloqueo.
    lock.releaseLock();
    const notification = notifyWhatsAppRegistration_(name, whatsapp, email);
    return json_({ ok: true, row: nextRow, event: eventMonth, status: 'Registrado', notification: notification.ok ? 'accepted' : 'failed' });
  } catch (error) {
    return json_({ ok: false, message: error && error.message ? error.message : 'Error al registrar.' });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function doGet() {
  return json_({ ok: true, service: 'ICO Monterrey registros', version: '19.2-whatsapp' });
}
function clean_(value) { return String(value == null ? '' : value).trim(); }
function literal_(value) { return value.charAt(0) === '=' ? "'" + value : value; }
function json_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}

function notifyWhatsAppRegistration_(name, whatsapp, email) {
  let result;
  try {
    result = sendWhatsAppTemplate_('nuevo_registro_ico_copiar', 'es_MX', [name, whatsapp, email]);
  } catch (_) {
    result = { ok: false, error: 'WHATSAPP_NOTIFICATION_FAILED' };
  }
  const summary = Object.assign({ at: new Date().toISOString() }, result);
  console.log(JSON.stringify({ service: 'ico-whatsapp', notification: summary }));
  try {
    PropertiesService.getScriptProperties().setProperty('WHATSAPP_LAST_RESULT', JSON.stringify(summary));
  } catch (_) {}
  return result;
}

// Comprobación de configuración y permisos; no envía mensajes.
function checkWhatsAppConfiguration() {
  const properties = PropertiesService.getScriptProperties();
  const token = clean_(properties.getProperty('WHATSAPP_TOKEN'));
  const phoneNumberId = clean_(properties.getProperty('WHATSAPP_PHONE_NUMBER_ID'));
  const recipient = clean_(properties.getProperty('WHATSAPP_TO'));
  if (!token || !/^\d+$/.test(phoneNumberId) || !recipient) {
    console.log(JSON.stringify({ ok: false, error: 'WHATSAPP_CONFIGURATION_MISSING' }));
    return;
  }
  const version = clean_(properties.getProperty('WHATSAPP_GRAPH_VERSION')) || 'v25.0';
  if (!/^v\d+\.0$/.test(version)) throw new Error('WHATSAPP_API_VERSION_INVALID');
  const response = UrlFetchApp.fetch('https://graph.facebook.com/' + version + '/' + phoneNumberId + '?fields=id', {
    headers: { Authorization: 'Bearer ' + token },
    muteHttpExceptions: true
  });
  let body;
  try { body = JSON.parse(response.getContentText()); } catch (_) { body = {}; }
  const status = response.getResponseCode();
  console.log(JSON.stringify({ ok: status >= 200 && status < 300 && !!body.id, httpStatus: status, code: body.error && body.error.code }));
}

// Los secretos se leen exclusivamente de Script Properties.
function sendWhatsAppTemplate_(templateName, language, bodyParameters) {
  const properties = PropertiesService.getScriptProperties();
  const token = clean_(properties.getProperty('WHATSAPP_TOKEN'));
  const phoneNumberId = clean_(properties.getProperty('WHATSAPP_PHONE_NUMBER_ID'));
  const recipient = clean_(properties.getProperty('WHATSAPP_TO')).replace(/[+\s()-]/g, '');
  const version = clean_(properties.getProperty('WHATSAPP_GRAPH_VERSION')) || 'v25.0';
  if (!token || !/^\d+$/.test(phoneNumberId) || !/^\d{8,15}$/.test(recipient)) {
    return { ok: false, error: 'WHATSAPP_CONFIGURATION_MISSING' };
  }
  if (!/^v\d+\.0$/.test(version)) {
    return { ok: false, error: 'WHATSAPP_API_VERSION_INVALID' };
  }
  const payload = buildWhatsAppTemplateMessage_(recipient, templateName, language, bodyParameters);
  try {
    const response = UrlFetchApp.fetch('https://graph.facebook.com/' + version + '/' + phoneNumberId + '/messages', {
      method: 'post',
      contentType: 'application/json',
      headers: { Authorization: 'Bearer ' + token },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    let result;
    try { result = JSON.parse(response.getContentText()); } catch (_) { result = {}; }
    const status = response.getResponseCode();
    const messageId = result.messages && result.messages[0] && result.messages[0].id;
    if (status >= 200 && status < 300 && messageId) {
      return { ok: true, messageId: messageId };
    }
    // No registrar respuestas completas, token, números ni datos del participante.
    return { ok: false, httpStatus: status, code: result.error && result.error.code, subcode: result.error && result.error.error_subcode };
  } catch (_) {
    return { ok: false, error: 'WHATSAPP_REQUEST_FAILED' };
  }
}

function buildWhatsAppTemplateMessage_(recipient, templateName, language, bodyParameters) {
  const template = { name: templateName, language: { code: language } };
  if (bodyParameters.length) {
    template.components = [{ type: 'body', parameters: bodyParameters.map(function (value) {
      return { type: 'text', text: String(value).replace(/[\r\n\t]+/g, ' ').trim() };
    }) }];
  }
  return { messaging_product: 'whatsapp', recipient_type: 'individual', to: recipient, type: 'template', template: template };
}

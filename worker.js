const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxwyqnn2_fR9EUiNVM5rdpWJCBe2vqn2ck6wktGK0kwJ1dR4WSOgTpzIPrCMkkraW3t9A/exec';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  });
}

async function handleRegister(request) {
  try {
    const contentType = request.headers.get('content-type') || '';

    if (!contentType.includes('application/json')) {
      return json({ ok: false, message: 'Formato no válido' }, 415);
    }

    const data = await request.json();

    // Honeypot anti-spam
    if (data.website) {
      return json({ ok: true });
    }

    const name = String(data.name || '').trim();
    const email = String(data.email || '').trim();
    const whatsapp = String(data.whatsapp || '').trim();

    if (!name || !email || !whatsapp) {
      return json({ ok: false, message: 'Faltan campos requeridos' }, 400);
    }

    if (name.length > 120 || email.length > 180 || whatsapp.length > 40) {
      return json({ ok: false, message: 'Datos demasiado largos' }, 400);
    }

    const googleResponse = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'content-type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify({
        name,
        email,
        whatsapp
      }),
      redirect: 'follow'
    });

    const responseText = await googleResponse.text();

    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      throw new Error('Respuesta inválida de Google Apps Script');
    }

    if (!googleResponse.ok || !result.ok) {
      throw new Error(result.message || 'No se pudo guardar el registro');
    }

    return json({
      ok: true,
      message: 'Registro confirmado',
      event: result.event,
      status: result.status
    });

  } catch (error) {
    console.error('Registration error:', error);

    return json({
      ok: false,
      message: 'No se pudo completar el registro'
    }, 500);
  }
}


async function safeTokenEqual(provided, expected) {
  const encoder = new TextEncoder();
  const [a, b] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(provided)),
    crypto.subtle.digest('SHA-256', encoder.encode(expected))
  ]);
  return crypto.subtle.timingSafeEqual(a, b);
}

async function webhookBody(request) {
  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 1048576) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const body = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
  return body;
}

async function handleWhatsAppWebhook(request, env) {
  if (!env.META_APP_SECRET || !env.WHATSAPP_VERIFY_TOKEN || !env.WHATSAPP_PHONE_NUMBER_ID) {
    return new Response('Webhook unavailable', { status: 503 });
  }
  if (request.method === 'GET') {
    const params = new URL(request.url).searchParams;
    const verified = await safeTokenEqual(params.get('hub.verify_token') || '', env.WHATSAPP_VERIFY_TOKEN);
    if (params.get('hub.mode') !== 'subscribe' || !verified || !params.has('hub.challenge')) {
      return new Response('Forbidden', { status: 403 });
    }
    return new Response(params.get('hub.challenge'), {
      headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' }
    });
  }
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const signature = request.headers.get('x-hub-signature-256') || '';
  if (!/^sha256=[a-f0-9]{64}$/i.test(signature)) return new Response('Forbidden', { status: 403 });
  const body = await webhookBody(request);
  if (!body) return new Response('Payload too large', { status: 413 });
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(env.META_APP_SECRET),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
  const bytes = Uint8Array.from(signature.slice(7).match(/../g), hex => parseInt(hex, 16));
  if (!(await crypto.subtle.verify('HMAC', key, bytes, body))) return new Response('Forbidden', { status: 403 });
  let payload;
  try { payload = JSON.parse(new TextDecoder().decode(body)); }
  catch { return new Response('Invalid JSON', { status: 400 }); }
  if (payload.object === 'whatsapp_business_account') {
    for (const entry of Array.isArray(payload.entry) ? payload.entry : []) {
      for (const change of Array.isArray(entry.changes) ? entry.changes : []) {
        const value = change.value;
        if (change.field !== 'messages' || value?.metadata?.phone_number_id !== env.WHATSAPP_PHONE_NUMBER_ID) continue;
        for (const status of Array.isArray(value.statuses) ? value.statuses : []) {
          if (!['sent', 'delivered', 'read', 'failed'].includes(status.status)) continue;
          const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(status.id || '')));
          // Correlación sin registrar el wamid (que puede codificar el teléfono).
          const reference = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
          const codes = (Array.isArray(status.errors) ? status.errors : [])
            .map(error => error.code).filter(code => Number.isSafeInteger(code)).slice(0, 10);
          console.log(JSON.stringify({ service: 'ico-whatsapp-delivery', reference,
            status: status.status, codes }));
        }
      }
    }
  }
  // Se descartan mensajes entrantes, números, contactos y textos de errores.
  return new Response('EVENT_RECEIVED');
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/whatsapp/webhook') {
      return handleWhatsAppWebhook(request, env);
    }

    if (url.pathname === '/api/register') {
      if (request.method === 'POST') {
        return handleRegister(request);
      }

      if (request.method === 'GET') {
        return json({
          ok: true,
          service: 'ICO Monterrey registration API'
        });
      }

      return json({
        ok: false,
        message: 'Método no permitido'
      }, 405);
    }

    return env.ASSETS.fetch(request);
  }
};

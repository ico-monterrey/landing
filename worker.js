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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

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

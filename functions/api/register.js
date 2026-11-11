const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbxwyqnn2_fR9EUiNVM5rdpWJCBe2vqn2ck6wktGK0kwJ1dR4WSOgTpzIPrCMkkraW3t9A/exec';

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  });
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();

    // Honeypot anti-bot.
    if (body.website) {
      return jsonResponse({ ok: true });
    }

    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim();
    const whatsapp = String(body.whatsapp || '').trim();

    if (!name || !email || !whatsapp) {
      return jsonResponse(
        {
          ok: false,
          message: 'Faltan nombre, correo o WhatsApp.'
        },
        400
      );
    }

    // El servidor NO confía en event/status enviados por el navegador.
    // Apps Script calcula el mes actual y fuerza Estado = Registrado.
    const upstream = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        name,
        email,
        whatsapp
      })
    });

    const raw = await upstream.text();

    let result = null;
    try {
      result = JSON.parse(raw);
    } catch (_) {}

    if (!upstream.ok || !result || result.ok !== true) {
      return jsonResponse(
        {
          ok: false,
          message:
            result?.message ||
            'Google Sheets rechazó el registro.'
        },
        502
      );
    }

    return jsonResponse({
      ok: true,
      event: result.event,
      status: result.status
    });

  } catch (error) {
    return jsonResponse(
      {
        ok: false,
        message: 'No se pudo completar el registro.'
      },
      500
    );
  }
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    if (body.website) return Response.json({ ok: true });

    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const whatsapp = String(body.whatsapp || "").trim();

    if (!name || !email || !whatsapp) {
      return Response.json({ ok:false, error:"missing_fields" }, { status:400 });
    }

    const url = context.env.GOOGLE_SCRIPT_URL;
    if (!url) return Response.json({ ok:false, error:"not_configured" }, { status:503 });

    const response = await fetch(url, {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        name, email, whatsapp,
        event:"ICO Monterrey — 26 septiembre 2026",
        source:"Landing Web",
        status:"Nuevo"
      })
    });

    if (!response.ok) throw new Error("Google endpoint failed");
    return Response.json({ ok:true });
  } catch (err) {
    return Response.json({ ok:false, error:"server_error" }, { status:500 });
  }
}
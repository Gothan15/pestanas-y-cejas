import { NextRequest, NextResponse } from "next/server";
import { clavePanel, crearTokenSesion, guardarCookieSesion } from "@/lib/panelAuth";

// Entrada al panel privado: una sola clave (PANEL_CLAVE).

export async function POST(req: NextRequest) {
  const clave = clavePanel();
  if (!clave) {
    return NextResponse.json(
      { error: "El panel todavía no está configurado: falta la variable PANEL_CLAVE en el servidor." },
      { status: 503 },
    );
  }

  let cuerpo: { clave?: unknown };
  try {
    cuerpo = await req.json();
  } catch {
    return NextResponse.json({ error: "Petición no válida" }, { status: 400 });
  }

  if (typeof cuerpo.clave !== "string" || cuerpo.clave !== clave) {
    return NextResponse.json({ error: "Clave incorrecta" }, { status: 401 });
  }

  await guardarCookieSesion(await crearTokenSesion());
  return NextResponse.json({ ok: true });
}

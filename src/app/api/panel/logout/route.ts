import { NextResponse } from "next/server";
import { borrarCookieSesion } from "@/lib/panelAuth";

// Salir del panel: borra la cookie de sesión.

export async function POST() {
  await borrarCookieSesion();
  return NextResponse.json({ ok: true });
}

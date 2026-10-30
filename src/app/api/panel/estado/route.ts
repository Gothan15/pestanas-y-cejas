import { NextResponse } from "next/server";
import { haySesionPanel } from "@/lib/panelAuth";

// ¿Hay sesión de panel activa? Lo consulta la página /panel al
// cargar para saber si mostrar el formulario de clave o la agenda.

export async function GET() {
  return NextResponse.json({ autenticada: await haySesionPanel() });
}

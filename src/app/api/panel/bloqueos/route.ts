import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { haySesionPanel } from "@/lib/panelAuth";
import { esFechaValida, esTurnoDeLaRejilla, hoyISO } from "@/lib/agenda";

// Gestión de horarios ocupados. SOLO con sesión del panel:
// listar (desde hoy en adelante), crear y quitar bloqueos.

// GET /api/panel/bloqueos → próximos bloqueos, ordenados.
export async function GET() {
  if (!(await haySesionPanel())) {
    return NextResponse.json({ error: "Sin sesión" }, { status: 401 });
  }
  try {
    const bloqueos = await prisma.horarioOcupado.findMany({
      where: { fecha: { gte: hoyISO() } },
      orderBy: [{ fecha: "asc" }, { hora: "asc" }],
    });
    return NextResponse.json({ bloqueos });
  } catch {
    return NextResponse.json({ error: "No se pudieron cargar los horarios" }, { status: 500 });
  }
}

// POST /api/panel/bloqueos {fecha, hora, nota?}
// Idempotente: si ese turno ya estaba ocupado, devuelve el
// bloqueo existente sin dar error (tocar dos veces no rompe nada).
export async function POST(req: NextRequest) {
  if (!(await haySesionPanel())) {
    return NextResponse.json({ error: "Sin sesión" }, { status: 401 });
  }

  let cuerpo: { fecha?: unknown; hora?: unknown; nota?: unknown };
  try {
    cuerpo = await req.json();
  } catch {
    return NextResponse.json({ error: "Petición no válida" }, { status: 400 });
  }

  const { fecha, hora } = cuerpo;
  if (typeof fecha !== "string" || !esFechaValida(fecha) || fecha < hoyISO()) {
    return NextResponse.json({ error: "Fecha no válida" }, { status: 400 });
  }
  if (typeof hora !== "string" || !esTurnoDeLaRejilla(fecha, hora)) {
    return NextResponse.json({ error: "Esa hora no es un turno de ese día" }, { status: 400 });
  }
  const nota =
    typeof cuerpo.nota === "string" && cuerpo.nota.trim() ? cuerpo.nota.trim().slice(0, 120) : null;

  try {
    const existente = await prisma.horarioOcupado.findUnique({
      where: { fecha_hora: { fecha, hora } },
    });
    if (existente) return NextResponse.json({ bloqueo: existente, yaExistia: true });
    const bloqueo = await prisma.horarioOcupado.create({ data: { fecha, hora, nota } });
    return NextResponse.json({ bloqueo }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "No se pudo guardar el horario" }, { status: 500 });
  }
}

// DELETE /api/panel/bloqueos?id=... → libera ese turno.
export async function DELETE(req: NextRequest) {
  if (!(await haySesionPanel())) {
    return NextResponse.json({ error: "Sin sesión" }, { status: 401 });
  }
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Falta el horario a quitar" }, { status: 400 });
  }
  try {
    await prisma.horarioOcupado.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Ese horario ya no existía" }, { status: 404 });
  }
}

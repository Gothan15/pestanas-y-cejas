import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { esFechaValida, hoyISO, sumarDias } from "@/lib/agenda";
import { negocio } from "@/config/negocio";

// Disponibilidad PÚBLICA: qué fecha+hora están ocupadas en un
// rango. Solo devuelve fecha y hora — ningún dato personal (la
// nota que la dueña escriba en su panel nunca sale por aquí).

const MAX_DIAS = 62;

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const hoy = hoyISO();
  const desde = params.get("desde") ?? hoy;
  const hasta = params.get("hasta") ?? sumarDias(desde, negocio.agenda.diasAnticipacion);

  if (!esFechaValida(desde) || !esFechaValida(hasta) || hasta < desde) {
    return NextResponse.json({ error: "Rango de fechas no válido" }, { status: 400 });
  }
  // Diferencia en días calculada sobre las cadenas (sin UTC).
  const dias = Math.round(
    (new Date(`${hasta}T12:00:00`).getTime() - new Date(`${desde}T12:00:00`).getTime()) / 86_400_000,
  );
  if (dias > MAX_DIAS) {
    return NextResponse.json({ error: "Rango demasiado amplio" }, { status: 400 });
  }

  try {
    const ocupados = await prisma.horarioOcupado.findMany({
      where: { fecha: { gte: desde, lte: hasta } },
      select: { fecha: true, hora: true },
      orderBy: [{ fecha: "asc" }, { hora: "asc" }],
    });
    return NextResponse.json({ ocupados });
  } catch {
    return NextResponse.json({ error: "No se pudo consultar la disponibilidad" }, { status: 500 });
  }
}

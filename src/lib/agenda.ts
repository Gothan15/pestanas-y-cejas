// Lógica pura de la agenda: qué turnos existen cada día.
// Sin dependencias de servidor: lo usan igual el formulario
// público de reserva y el panel privado de la dueña.
//
// Las fechas se manejan SIEMPRE como cadenas "YYYY-MM-DD" y las
// horas como "HH:MM". El día de la semana se calcula creando la
// fecha en hora LOCAL (mediodía, para que ningún cambio de hora
// la corra de día), nunca convirtiendo a UTC.

import { negocio } from "@/config/negocio";

export type FechaISO = string; // "YYYY-MM-DD"
export type HoraHHMM = string; // "HH:MM"

const RE_FECHA = /^\d{4}-\d{2}-\d{2}$/;
const RE_HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

/** ¿La cadena tiene formato de fecha válido (YYYY-MM-DD)? */
export function esFechaValida(fecha: string): boolean {
  if (!RE_FECHA.test(fecha)) return false;
  const d = fechaLocal(fecha);
  // Rechaza fechas imposibles (2026-02-31 y similares).
  return !Number.isNaN(d.getTime()) && aFechaISO(d) === fecha;
}

/** ¿La cadena tiene formato de hora válido (HH:MM, 00:00–23:59)? */
export function esHoraValida(hora: string): boolean {
  return RE_HORA.test(hora);
}

/** "HH:MM" → minutos desde medianoche. */
function aMinutos(hora: HoraHHMM): number {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

/** Minutos desde medianoche → "HH:MM". */
function aHora(minutos: number): HoraHHMM {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Crea un Date local a partir de "YYYY-MM-DD" anclado a mediodía:
 * así getDay()/getDate() dan el día que la cadena dice, sin que la
 * zona horaria del navegador o del servidor lo mueva.
 */
export function fechaLocal(fecha: FechaISO): Date {
  return new Date(`${fecha}T12:00:00`);
}

/** Date local → "YYYY-MM-DD" usando sus componentes locales. */
export function aFechaISO(d: Date): FechaISO {
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

/** Hoy en hora local, como "YYYY-MM-DD". */
export function hoyISO(ahora: Date = new Date()): FechaISO {
  return aFechaISO(ahora);
}

/** Suma días a una fecha "YYYY-MM-DD" y devuelve otra igual. */
export function sumarDias(fecha: FechaISO, dias: number): FechaISO {
  const d = fechaLocal(fecha);
  d.setDate(d.getDate() + dias);
  return aFechaISO(d);
}

/** ¿Ese día trabaja el negocio? (según agenda.diasLaborales) */
export function esDiaLaboral(fecha: FechaISO): boolean {
  if (!esFechaValida(fecha)) return false;
  return negocio.agenda.diasLaborales.includes(fechaLocal(fecha).getDay());
}

/**
 * Inicios de turno de un día: desde la apertura hasta el cierre
 * menos un intervalo (el último turno debe poder terminar antes
 * de cerrar). Día no laboral → lista vacía.
 */
export function generarHoras(fecha: FechaISO): HoraHHMM[] {
  if (!esDiaLaboral(fecha)) return [];
  const { apertura, cierre, intervaloMin } = negocio.agenda;
  const horas: HoraHHMM[] = [];
  for (let t = aMinutos(apertura); t <= aMinutos(cierre) - intervaloMin; t += intervaloMin) {
    horas.push(aHora(t));
  }
  return horas;
}

/** ¿La hora dada pertenece a la rejilla de turnos de ese día? */
export function esTurnoDeLaRejilla(fecha: FechaISO, hora: string): boolean {
  return esHoraValida(hora) && generarHoras(fecha).includes(hora);
}

/** "YYYY-MM-DD" → «lunes 2 de noviembre» para textos de la web. */
export function fechaBonita(fecha: FechaISO): string {
  return new Intl.DateTimeFormat("es", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(fechaLocal(fecha));
}

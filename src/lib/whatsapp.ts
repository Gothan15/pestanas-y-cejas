import { negocio } from "@/config/negocio";

/** El WhatsApp solo se considera configurado si son solo dígitos (8–15). */
export function whatsappConfigurado(): boolean {
  return /^\d{8,15}$/.test(negocio.whatsapp);
}

export function enlaceWhatsApp(mensaje: string): string {
  return `https://wa.me/${negocio.whatsapp}?text=${encodeURIComponent(mensaje)}`;
}

/** "2026-11-02" -> "lunes 2 de noviembre de 2026" para el mensaje. */
function fechaBonita(fecha: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return fecha;
  const d = new Date(`${fecha}T12:00:00`);
  return new Intl.DateTimeFormat("es", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(d);
}

export function mensajeReserva(datos: {
  nombre?: string;
  servicio?: string;
  fecha?: string;
  hora?: string;
}): string {
  const partes = ["Hola, quiero reservar una cita."];
  if (datos.servicio) partes.push(`Servicio: ${datos.servicio}.`);
  if (datos.nombre) partes.push(`Me llamo ${datos.nombre}.`);
  if (datos.fecha) partes.push(`Me gustaría el ${fechaBonita(datos.fecha)}${datos.hora ? ` a las ${datos.hora}` : ""}.`);
  partes.push("¿Tienes ese turno disponible?");
  return partes.join(" ");
}

export function mensajeGeneral(): string {
  return `Hola, vi la página de ${negocio.nombre} y quiero información para reservar una cita.`;
}

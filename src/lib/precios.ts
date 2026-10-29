import { negocio, type PrecioUSD } from "@/config/negocio";

/**
 * Conversión USD → CUP. Funciones puras, sin red: sirven igual en
 * servidor y en cliente. La tasa llega como parámetro (la obtiene
 * src/lib/tasa.ts desde elTOQUE) para que esto se pueda probar
 * sin conexión.
 */

export function convertirACUP(usd: number, tasaUSD: number): number {
  const redondeo = negocio.moneda.redondeoCUP || 1;
  return Math.round((usd * tasaUSD) / redondeo) * redondeo;
}

/** 2580 → "2 580 CUP" (espacio como separador de miles, estilo CU). */
export function formatearCUP(cup: number): string {
  const conMiles = String(Math.round(cup)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${conMiles} CUP`;
}

/** 0.5 → "0.50 USD" · 3 → "3 USD" */
export function formatearUSD(usd: number): string {
  return `${usd % 1 === 0 ? usd.toFixed(0) : usd.toFixed(2)} USD`;
}

/**
 * El texto de precio que ve la clienta: primero el CUP de hoy
 * (lo que va a pagar) y entre paréntesis la base en USD, para que
 * se entienda por qué el CUP puede cambiar de un día a otro.
 * Ej.: "2 580 CUP (3 USD)" · rango: "770–1 720 CUP (0.90–2 USD)"
 */
export function textoPrecio(precioUSD: PrecioUSD, tasaUSD: number): string {
  if (Array.isArray(precioUSD)) {
    const [min, max] = precioUSD;
    return `${formatearCUP(convertirACUP(min, tasaUSD))}–${formatearCUP(convertirACUP(max, tasaUSD)).replace(" CUP", "")} CUP (${formatearUSD(min)}–${formatearUSD(max)})`;
  }
  return `${formatearCUP(convertirACUP(precioUSD, tasaUSD))} (${formatearUSD(precioUSD)})`;
}

import { cacheLife } from "next/cache";
import { negocio } from "@/config/negocio";

/**
 * Tasa USD → CUP de elTOQUE, obtenida en el SERVIDOR.
 *
 * Por qué NO scraping de la página de elTOQUE:
 * - elTOQUE ofrece una API oficial de tasas (tasas.eltoque.com)
 *   pensada justo para esto; pide un token gratuito de acceso.
 * - Scrapear el HTML es frágil: cambia el diseño y se rompe la
 *   página, puede chocar con su protección anti-bots y el propio
 *   elTOQUE explica que el scraping puede afectar a su sitio.
 * - Además, el token jamás debe viajar al navegador de la clienta:
 *   por eso la llamada se hace aquí, en servidor, nunca en cliente.
 *
 * Cómo se mantiene sola:
 * - 'use cache' + cacheLife('hours'): la tasa se pide como mucho
 *   unas pocas veces al día, no en cada visita.
 * - Si no hay token (ELTOQUE_API_TOKEN) o la API falla, se usa la
 *   tasa de respaldo de src/config/negocio.ts y la página avisa
 *   de que es una tasa de respaldo, con su fecha. Nunca se rompe.
 *
 * La URL se puede cambiar con ELTOQUE_API_URL si elTOQUE mueve
 * el endpoint; el lector de abajo busca el valor USD dentro del
 * JSON sea cual sea su forma ({tasas:{USD:…}}, {USD:…}, etc.).
 */

export type TasaInfo = {
  /** CUP por 1 USD. Ej.: 860 */
  tasa: number;
  fuente: "elTOQUE" | "respaldo";
  detalle: string;
};

/** Busca un número USD plausible (>10) en cualquier rincón del JSON. */
function buscarUSD(dato: unknown, profundidad = 0): number | null {
  if (profundidad > 4 || dato === null || typeof dato !== "object") return null;
  const obj = dato as Record<string, unknown>;
  for (const clave of ["USD", "usd", "USD_CUP"]) {
    const v = obj[clave];
    if (typeof v === "number" && v > 10 && v < 100000) return v;
    if (typeof v === "string") {
      const n = Number(v);
      if (Number.isFinite(n) && n > 10 && n < 100000) return n;
    }
  }
  for (const v of Object.values(obj)) {
    const encontrado = buscarUSD(v, profundidad + 1);
    if (encontrado !== null) return encontrado;
  }
  return null;
}

export async function obtenerTasaUSD(): Promise<TasaInfo> {
  "use cache";
  cacheLife("hours");

  const respaldo: TasaInfo = {
    tasa: negocio.moneda.tasaFallbackUSD,
    fuente: "respaldo",
    detalle: `Tasa de respaldo del ${negocio.moneda.tasaFallbackFecha}: 1 USD = ${negocio.moneda.tasaFallbackUSD} CUP. Configura ELTOQUE_API_TOKEN para actualizarla sola.`,
  };

  const token = process.env.ELTOQUE_API_TOKEN;
  if (!token) return respaldo;

  const url = process.env.ELTOQUE_API_URL ?? "https://tasas.eltoque.com/v1/trmi";
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
    if (!res.ok) return respaldo;
    const tasa = buscarUSD(await res.json());
    if (tasa === null) return respaldo;
    return {
      tasa,
      fuente: "elTOQUE",
      detalle: `Tasa de elTOQUE actualizada automáticamente: 1 USD = ${tasa} CUP.`,
    };
  } catch {
    return respaldo;
  }
}

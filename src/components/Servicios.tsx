"use client";

import { negocio } from "@/config/negocio";
import { textoPrecio } from "@/lib/precios";
import type { TasaInfo } from "@/lib/tasa";

export const EVENTO_SERVICIO = "pestanas:servicio-elegido";

/**
 * Servicios como índice editorial de revista: filas numeradas con
 * el precio al final, no tarjetas iguales en una cuadrícula.
 * El precio se guarda en USD en el config y aquí se muestra ya
 * convertido a CUP con la tasa que el servidor trajo de elTOQUE
 * (prop `tasa`, ver src/app/page.tsx y src/lib/tasa.ts).
 * Al tocar «Reservar» se avisa al formulario (evento) y se baja
 * a él con ese servicio ya seleccionado.
 */
export default function Servicios({ tasa }: { tasa: TasaInfo }) {
  const elegir = (id: string) => {
    window.dispatchEvent(new CustomEvent<string>(EVENTO_SERVICIO, { detail: id }));
    document.getElementById("reservar")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div>
      <p className="mb-6 border border-linea bg-crema/70 px-4 py-3 text-sm leading-6">
        <strong>Pago en CUP al cambio del día.</strong> Precios calculados con{" "}
        {tasa.fuente === "elTOQUE" ? "la tasa de elTOQUE" : "una tasa de respaldo"}:{" "}
        <strong>1 USD = {tasa.tasa} CUP</strong>, redondeados a la decena. Si el cambio se mueve, el precio en CUP se
        mueve solo, sin tocar la lista.
      </p>
      {negocio.servicios.map((s, i) => (
        <article
          key={s.id}
          className="group grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 border-t border-linea py-6 transition-colors last:border-b hover:bg-crema/60 sm:grid-cols-[64px_1fr_auto] sm:items-baseline sm:gap-x-6 sm:px-4"
        >
          <span className="font-display text-sm text-acento sm:text-base">
            {String(i + 1).padStart(2, "0")}
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-2xl leading-tight sm:text-[1.7rem]">{s.nombre}</h3>
            <p className="mt-1 max-w-xl text-sm leading-6 text-tinta/65">{s.descripcion}</p>
            <p className="mt-2 text-xs font-semibold tracking-[0.14em] text-tinta/50 uppercase">
              {s.duracion || "Duración por confirmar"}
            </p>
          </div>
          <div className="col-start-2 flex items-baseline gap-4 sm:col-start-3 sm:flex-col sm:items-end sm:gap-1">
            <span className="font-display text-xl whitespace-nowrap text-dorado sm:text-2xl">
              {textoPrecio(s.precioUSD, tasa.tasa)}
            </span>
            <button
              type="button"
              onClick={() => elegir(s.id)}
              className="text-sm font-semibold whitespace-nowrap text-acento underline decoration-2 underline-offset-4 transition group-hover:decoration-4"
            >
              Reservar →
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

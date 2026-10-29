"use client";

import { useEffect, useState } from "react";
import { negocio } from "@/config/negocio";
import { enlaceWhatsApp, mensajeReserva, whatsappConfigurado } from "@/lib/whatsapp";
import { EVENTO_SERVICIO } from "./Servicios";

/**
 * Formulario de reserva con forma de ficha/vale en papel: campos con
 * solo línea inferior y botón de WhatsApp. Al enviar se abre wa.me
 * con el mensaje ya armado (ver src/lib/whatsapp.ts).
 */
export default function ReservaForm() {
  const [nombre, setNombre] = useState("");
  const [servicioId, setServicioId] = useState(negocio.servicios[0]?.id ?? "");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [aviso, setAviso] = useState("");

  // Si la clienta tocó «Reservar» en un servicio, ese queda elegido aquí.
  useEffect(() => {
    const alSeleccionar = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      if (negocio.servicios.some((s) => s.id === id)) setServicioId(id);
    };
    window.addEventListener(EVENTO_SERVICIO, alSeleccionar);
    return () => window.removeEventListener(EVENTO_SERVICIO, alSeleccionar);
  }, []);

  const servicio = negocio.servicios.find((s) => s.id === servicioId);

  const enviar = () => {
    if (!whatsappConfigurado()) {
      setAviso(
        "Falta el WhatsApp real del negocio en src/config/negocio.ts (campo whatsapp). En cuanto esté, este botón abre WhatsApp con el mensaje ya escrito.",
      );
      return;
    }
    setAviso("");
    const mensaje = mensajeReserva({
      nombre: nombre.trim() || undefined,
      servicio: servicio?.nombre,
      fecha: fecha || undefined,
      hora: hora || undefined,
    });
    window.open(enlaceWhatsApp(mensaje), "_blank", "noopener,noreferrer");
  };

  const claseCampo =
    "mt-1 w-full border-0 border-b-2 border-linea bg-transparent px-0 py-2 text-base font-medium tracking-normal text-tinta normal-case outline-none transition placeholder:text-tinta/35 focus:border-acento";
  const claseEtiqueta = "block text-xs font-bold tracking-[0.16em] text-tinta/55 uppercase";

  return (
    <div className="relative bg-[#fffdf6] shadow-[10px_10px_0_0_var(--tinta)] ring-1 ring-linea">
      {/* Cabecera del vale */}
      <div className="flex items-center justify-between border-b-2 border-dashed border-linea px-6 py-4 sm:px-8">
        <span className="font-display text-lg">Ficha de reserva</span>
        <span className="text-xs font-bold tracking-[0.18em] text-acento uppercase">Por WhatsApp</span>
      </div>

      <div className="grid gap-5 px-6 py-6 sm:grid-cols-2 sm:px-8 sm:py-8">
        <label className={claseEtiqueta}>
          Tu nombre
          <input
            className={claseCampo}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej.: Yamila"
            autoComplete="name"
          />
        </label>
        <label className={claseEtiqueta}>
          Servicio
          <select className={claseCampo} value={servicioId} onChange={(e) => setServicioId(e.target.value)}>
            {negocio.servicios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </select>
        </label>
        <label className={claseEtiqueta}>
          Día que prefieres
          <input type="date" className={claseCampo} value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </label>
        <label className={claseEtiqueta}>
          Hora que prefieres
          <input type="time" className={claseCampo} value={hora} onChange={(e) => setHora(e.target.value)} />
        </label>
      </div>

      <div className="px-6 pb-6 sm:px-8 sm:pb-8">
        <button
          type="button"
          onClick={enviar}
          className="w-full bg-[#1faa55] px-6 py-3.5 text-base font-bold text-white transition hover:brightness-95"
        >
          Reservar por WhatsApp
        </button>
        <p className="mt-3 text-center text-xs leading-5 text-tinta/55">
          Sin registros ni contraseñas: se abre WhatsApp con tu mensaje ya escrito y el negocio te confirma el turno
          en el chat.
        </p>
        {aviso ? (
          <p className="mt-4 border border-acento/40 bg-crema px-4 py-3 text-sm leading-6 text-tinta">{aviso}</p>
        ) : null}
      </div>

      {/* Muescas de vale recortable */}
      <span className="absolute top-[57px] -left-3 h-6 w-6 rounded-full bg-papel ring-1 ring-linea" aria-hidden />
      <span className="absolute top-[57px] -right-3 h-6 w-6 rounded-full bg-papel ring-1 ring-linea" aria-hidden />
    </div>
  );
}

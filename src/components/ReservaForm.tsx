"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { negocio } from "@/config/negocio";
import { enlaceWhatsApp, mensajeReserva, whatsappConfigurado } from "@/lib/whatsapp";
import { esDiaLaboral, generarHoras, hoyISO, sumarDias } from "@/lib/agenda";
import { EVENTO_SERVICIO } from "./Servicios";

/**
 * Formulario de reserva con forma de ficha/vale en papel: campos con
 * solo línea inferior y botón de WhatsApp. Al enviar se abre wa.me
 * con el mensaje ya armado (ver src/lib/whatsapp.ts).
 *
 * Las horas ya no se escriben a mano: salen de la rejilla de turnos
 * de la agenda (src/lib/agenda.ts) y las que la dueña marcó como
 * ocupadas en su panel salen oscuras y no se pueden elegir.
 */
export default function ReservaForm() {
  const [nombre, setNombre] = useState("");
  const [servicioId, setServicioId] = useState(negocio.servicios[0]?.id ?? "");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [aviso, setAviso] = useState("");
  const [ocupadas, setOcupadas] = useState<Set<string>>(new Set());
  const [dispFallo, setDispFallo] = useState(false);
  const [avisoFecha, setAvisoFecha] = useState("");
  const [cargandoHoras, setCargandoHoras] = useState(false);
  // «Hoy» se lee solo en el cliente, con useSyncExternalStore:
  // leer la hora actual durante el render bloquea el prerender en
  // Next 16 (blocking-prerender-current-time-client), un efecto
  // con setState lo marca el lint, y en el servidor debe valer "".
  const hoy = useSyncExternalStore(
    () => () => {},
    () => hoyISO(),
    () => "",
  );

  // Si la clienta tocó «Reservar» en un servicio, ese queda elegido aquí.
  useEffect(() => {
    const alSeleccionar = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      if (negocio.servicios.some((s) => s.id === id)) setServicioId(id);
    };
    window.addEventListener(EVENTO_SERVICIO, alSeleccionar);
    return () => window.removeEventListener(EVENTO_SERVICIO, alSeleccionar);
  }, []);

  // Al cambiar el día se limpian la hora y la disponibilidad
  // anterior, y el efecto de abajo consulta los turnos ocupados.
  // El atributo min no basta: el selector de fecha de iOS deja
  // escoger días pasados, así que aquí un día anterior a hoy se
  // corrige a hoy y se avisa.
  const alCambiarFecha = (v: string) => {
    let valor = v;
    if (v && hoy && v < hoy) {
      valor = hoy;
      setAvisoFecha("Ese día ya pasó: te dejo en hoy, el primer día que puedes elegir.");
    } else {
      setAvisoFecha("");
    }
    setFecha(valor);
    setHora("");
    setOcupadas(new Set());
    setDispFallo(false);
    setCargandoHoras(valor !== "");
  };

  useEffect(() => {
    if (!fecha) return;
    let cancelado = false;
    (async () => {
      try {
        const res = await fetch(`/api/disponibilidad?desde=${fecha}&hasta=${fecha}`);
        if (!res.ok) throw new Error("sin disponibilidad");
        const data = (await res.json()) as { ocupados: { hora: string }[] };
        if (!cancelado) setOcupadas(new Set(data.ocupados.map((o) => o.hora)));
      } catch {
        // Sin disponibilidad comprobable: se ofrecen todos los
        // turnos y la clienta confirma el suyo por WhatsApp.
        if (!cancelado) setDispFallo(true);
      } finally {
        if (!cancelado) setCargandoHoras(false);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [fecha]);

  const servicio = negocio.servicios.find((s) => s.id === servicioId);
  const maxFecha = hoy ? sumarDias(hoy, negocio.agenda.diasAnticipacion) : "";
  const laboral = fecha ? esDiaLaboral(fecha) : false;
  const horas = fecha && laboral ? generarHoras(fecha) : [];

  const horaYaPaso = (h: string) => {
    if (fecha !== hoy) return false;
    const ahora = new Date();
    const [hh, mm] = h.split(":").map(Number);
    return hh * 60 + mm <= ahora.getHours() * 60 + ahora.getMinutes();
  };

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
          <input
            type="date"
            className={claseCampo}
            value={fecha}
            min={hoy || undefined}
            max={maxFecha || undefined}
            onChange={(e) => alCambiarFecha(e.target.value)}
          />
          {avisoFecha ? (
            <span className="mt-2 block text-xs font-semibold tracking-normal text-acento normal-case">
              {avisoFecha}
            </span>
          ) : null}
        </label>

        <div className={claseEtiqueta}>
          Hora que prefieres
          {fecha === "" ? (
            <p className="mt-2 text-sm font-medium tracking-normal text-tinta/50 normal-case">
              Elige primero el día y te enseñamos los turnos.
            </p>
          ) : !laboral ? (
            <p className="mt-2 border border-acento/40 bg-crema px-3 py-2.5 text-sm font-medium tracking-normal text-tinta normal-case">
              Ese día no se trabaja, elige otro día.
            </p>
          ) : (
            <>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {horas.map((h) => {
                  const ocupada = ocupadas.has(h);
                  const paso = horaYaPaso(h);
                  if (ocupada) {
                    return (
                      <button
                        key={h}
                        type="button"
                        disabled
                        className="cursor-not-allowed bg-tinta px-1 py-2 text-center text-papel"
                      >
                        <span className="block text-sm font-bold line-through">{h}</span>
                        <span className="block text-[10px] font-semibold tracking-wide text-dorado uppercase">
                          Ocupado
                        </span>
                      </button>
                    );
                  }
                  const elegida = hora === h;
                  return (
                    <button
                      key={h}
                      type="button"
                      disabled={paso}
                      onClick={() => setHora(h)}
                      aria-pressed={elegida}
                      className={`border-2 px-1 py-2 text-center transition disabled:cursor-not-allowed disabled:opacity-40 ${
                        elegida
                          ? "border-acento bg-acento text-papel"
                          : "border-linea bg-transparent hover:border-acento"
                      }`}
                    >
                      <span className="block text-sm font-bold">{h}</span>
                      <span
                        className={`block text-[10px] font-semibold tracking-wide uppercase ${
                          elegida ? "text-papel/85" : "text-tinta/50"
                        }`}
                      >
                        {paso ? "Ya pasó" : elegida ? "Elegida" : "Libre"}
                      </span>
                    </button>
                  );
                })}
              </div>
              {cargandoHoras ? (
                <p className="mt-2 text-xs font-medium tracking-normal text-tinta/50 normal-case">
                  Comprobando los turnos ocupados…
                </p>
              ) : dispFallo ? (
                <p className="mt-2 text-xs font-medium tracking-normal text-tinta/50 normal-case">
                  No se pudo comprobar la disponibilidad: elige tu hora y confirma el turno por WhatsApp.
                </p>
              ) : null}
            </>
          )}
        </div>
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

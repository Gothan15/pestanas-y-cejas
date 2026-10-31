"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { negocio } from "@/config/negocio";
import { esDiaLaboral, fechaBonita, generarHoras, hoyISO, sumarDias } from "@/lib/agenda";

// Panel privado de la dueña: marcar los horarios ocupados.
// Pensado para el móvil y para alguien no técnico: entrar con la
// clave, tocar una hora para ocuparla, tocarla otra vez para
// liberarla. Lo que se marca aquí deja de ofrecerse en la web.

type Bloqueo = {
  id: string;
  fecha: string;
  hora: string;
  nota: string | null;
};

export default function PanelPage() {
  const [autenticada, setAutenticada] = useState<boolean | null>(null);
  const [clave, setClave] = useState("");
  const [errorLogin, setErrorLogin] = useState("");
  const [bloqueos, setBloqueos] = useState<Bloqueo[]>([]);
  const [fecha, setFecha] = useState("");
  const [nota, setNota] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);

  // «Hoy» se lee al montar, en el navegador: leer la hora actual
  // durante el render bloquea el prerender en Next 16.
  const [hoy, setHoy] = useState("");
  const maxFecha = hoy ? sumarDias(hoy, 90) : "";

  const cargarBloqueos = useCallback(async () => {
    const res = await fetch("/api/panel/bloqueos");
    if (res.status === 401) {
      setAutenticada(false);
      return;
    }
    if (res.ok) {
      const data = (await res.json()) as { bloqueos: Bloqueo[] };
      setBloqueos(data.bloqueos);
    }
  }, []);

  useEffect(() => {
    const h = hoyISO();
    setHoy(h);
    setFecha(h);
    (async () => {
      const res = await fetch("/api/panel/estado");
      const data = (await res.json().catch(() => ({ autenticada: false }))) as {
        autenticada: boolean;
      };
      setAutenticada(data.autenticada);
      if (data.autenticada) await cargarBloqueos();
    })();
  }, [cargarBloqueos]);

  const entrar = async () => {
    setErrorLogin("");
    const res = await fetch("/api/panel/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clave }),
    });
    if (res.ok) {
      setClave("");
      setAutenticada(true);
      await cargarBloqueos();
      return;
    }
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setErrorLogin(data.error ?? "No se pudo entrar. Revisa la clave.");
  };

  const salir = async () => {
    await fetch("/api/panel/logout", { method: "POST" });
    setAutenticada(false);
    setBloqueos([]);
  };

  const ocupadosDelDia = useMemo(
    () => new Map(bloqueos.filter((b) => b.fecha === fecha).map((b) => [b.hora, b])),
    [bloqueos, fecha],
  );
  const horas = useMemo(() => generarHoras(fecha), [fecha]);
  const laboral = esDiaLaboral(fecha);

  // Horas de hoy que ya pasaron: no se ofrecen ni se pueden tocar.
  const horaYaPaso = (hora: string) => {
    if (fecha !== hoy) return false;
    const ahora = new Date();
    const [h, m] = hora.split(":").map(Number);
    return h * 60 + m <= ahora.getHours() * 60 + ahora.getMinutes();
  };

  const tocarHora = async (hora: string) => {
    if (guardando) return;
    const existente = ocupadosDelDia.get(hora);
    setGuardando(true);
    setMensaje("");
    if (existente) {
      const res = await fetch(`/api/panel/bloqueos?id=${encodeURIComponent(existente.id)}`, {
        method: "DELETE",
      });
      if (res.ok) setMensaje(`Liberado el turno de las ${hora}. Ya se puede reservar.`);
    } else {
      const res = await fetch("/api/panel/bloqueos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fecha, hora, nota: nota.trim() || undefined }),
      });
      if (res.ok) {
        setMensaje(`Turno de las ${hora} marcado como ocupado. Ya no se ofrece en la página.`);
        setNota("");
      }
    }
    await cargarBloqueos();
    setGuardando(false);
  };

  const quitarBloqueo = async (b: Bloqueo) => {
    const res = await fetch(`/api/panel/bloqueos?id=${encodeURIComponent(b.id)}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setMensaje(`Liberado: ${fechaBonita(b.fecha)} a las ${b.hora}.`);
      await cargarBloqueos();
    }
  };

  const claseInput =
    "mt-1 w-full border-0 border-b-2 border-linea bg-transparent px-0 py-2 text-base font-medium text-tinta outline-none transition focus:border-acento";

  return (
    <main className="min-h-screen bg-papel text-tinta">
      <div className="mx-auto max-w-xl px-5 py-8 sm:py-12">
        <p className="text-[11px] font-bold tracking-[0.24em] text-acento uppercase">
          {negocio.nombre} · Panel privado
        </p>
        <h1 className="font-display mt-2 text-4xl">Horarios ocupados</h1>
        <p className="mt-3 text-sm leading-6 text-tinta/65">
          Cuando confirmes una cita por WhatsApp, marca aquí su día y su hora: ese turno sale oscuro
          en la página y nadie más lo puede pedir.
        </p>

        {autenticada === null ? (
          <p className="mt-10 text-sm text-tinta/60">Cargando…</p>
        ) : !autenticada ? (
          <div className="mt-8 bg-[#fffdf6] p-6 shadow-[8px_8px_0_0_var(--tinta)] ring-1 ring-linea">
            <label className="block text-xs font-bold tracking-[0.16em] text-tinta/55 uppercase">
              Tu clave
              <input
                type="password"
                className={claseInput}
                value={clave}
                onChange={(e) => setClave(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && entrar()}
                placeholder="Escribe la clave del panel"
                autoComplete="current-password"
              />
            </label>
            <button
              type="button"
              onClick={entrar}
              className="mt-5 w-full bg-tinta px-6 py-3 font-bold text-papel transition hover:bg-acento"
            >
              Entrar
            </button>
            {errorLogin ? (
              <p className="mt-4 border border-acento/40 bg-crema px-4 py-3 text-sm leading-6">{errorLogin}</p>
            ) : null}
          </div>
        ) : (
          <>
            <div className="mt-8 bg-[#fffdf6] p-6 shadow-[8px_8px_0_0_var(--tinta)] ring-1 ring-linea">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-xs font-bold tracking-[0.16em] text-tinta/55 uppercase">
                  Día
                  <input
                    type="date"
                    className={claseInput}
                    value={fecha}
                    min={hoy || undefined}
                    max={maxFecha || undefined}
                    onChange={(e) => setFecha(e.target.value || hoy)}
                  />
                </label>
                <label className="block text-xs font-bold tracking-[0.16em] text-tinta/55 uppercase">
                  Nota (opcional)
                  <input
                    className={claseInput}
                    value={nota}
                    onChange={(e) => setNota(e.target.value)}
                    placeholder="Ej.: el nombre de la clienta"
                    maxLength={120}
                  />
                </label>
              </div>
              <p className="font-display mt-5 text-lg capitalize">{fechaBonita(fecha)}</p>

              {!laboral ? (
                <p className="mt-4 border border-linea bg-crema px-4 py-3 text-sm leading-6">
                  Ese día no se trabaja, no hay turnos que marcar.
                </p>
              ) : (
                <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {horas.map((hora) => {
                    const bloqueo = ocupadosDelDia.get(hora);
                    const paso = horaYaPaso(hora);
                    if (bloqueo) {
                      return (
                        <button
                          key={hora}
                          type="button"
                          disabled={guardando}
                          onClick={() => tocarHora(hora)}
                          className="bg-tinta px-2 py-3 text-center text-papel transition hover:bg-acento disabled:opacity-60"
                          title={bloqueo.nota ?? undefined}
                        >
                          <span className="block text-base font-bold line-through">{hora}</span>
                          <span className="block text-[11px] font-semibold tracking-wide text-dorado uppercase">
                            Ocupado
                          </span>
                          {bloqueo.nota ? (
                            <span className="mt-0.5 block truncate text-[11px] text-papel/75">{bloqueo.nota}</span>
                          ) : null}
                        </button>
                      );
                    }
                    return (
                      <button
                        key={hora}
                        type="button"
                        disabled={guardando || paso}
                        onClick={() => tocarHora(hora)}
                        className="border-2 border-linea bg-papel px-2 py-3 text-center transition hover:border-acento disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <span className="block text-base font-bold">{hora}</span>
                        <span className="block text-[11px] font-semibold tracking-wide text-tinta/50 uppercase">
                          {paso ? "Ya pasó" : "Libre"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
              <p className="mt-4 text-xs leading-5 text-tinta/55">
                Toca una hora libre para ocuparla; toca una ocupada para liberarla. La nota se guarda
                junto a la hora que marques.
              </p>
              {mensaje ? (
                <p className="mt-4 border border-dorado/50 bg-crema px-4 py-3 text-sm leading-6">{mensaje}</p>
              ) : null}
            </div>

            <h2 className="font-display mt-10 text-2xl">Próximos horarios ocupados</h2>
            {bloqueos.length === 0 ? (
              <p className="mt-3 text-sm text-tinta/60">
                No hay ningún horario ocupado marcado. Todos los turnos se ofrecen en la página.
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-linea border-y border-linea">
                {bloqueos.map((b) => (
                  <li key={b.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="font-semibold capitalize">
                        {fechaBonita(b.fecha)} · {b.hora}
                      </p>
                      {b.nota ? <p className="truncate text-sm text-tinta/60">{b.nota}</p> : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => quitarBloqueo(b)}
                      className="shrink-0 border-2 border-tinta px-3 py-1.5 text-sm font-bold transition hover:bg-tinta hover:text-papel"
                    >
                      Quitar
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <button
              type="button"
              onClick={salir}
              className="mt-10 text-sm font-semibold text-tinta/60 underline underline-offset-4 hover:text-acento"
            >
              Salir del panel
            </button>
            <p className="mt-2 text-xs text-tinta/45">
              Horario de trabajo actual: {negocio.agenda.apertura}–{negocio.agenda.cierre}, turnos de{" "}
              {negocio.agenda.intervaloMin} min (provisional, se ajusta en el código).
            </p>
          </>
        )}
      </div>
    </main>
  );
}
